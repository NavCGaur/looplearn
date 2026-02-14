'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type State = {
    error?: string | null
    success?: boolean
    message?: string | null
}

export async function updateProfile(prevState: State, formData: FormData): Promise<State> {
    const supabase = await createClient()

    // 1. Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        return { error: 'Not authenticated', success: false }
    }

    // 2. Extract form data
    const displayName = formData.get('displayName') as string
    const school = formData.get('school') as string
    const bio = formData.get('bio') as string
    const avatarOption = formData.get('avatarOption') as string // 'default' or 'upload'
    const defaultAvatarUrl = formData.get('defaultAvatarUrl') as string
    const file = formData.get('avatarFile') as File

    // Basic validation
    if (!displayName || displayName.length < 2) {
        return { error: 'Display name must be at least 2 characters', success: false }
    }

    try {
        let avatarUrl = undefined

        // 3. Handle Avatar Logic
        if (avatarOption === 'upload' && file && file.size > 0) {
            // Validate file type/size
            if (!file.type.startsWith('image/')) {
                return { error: 'File must be an image', success: false }
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                return { error: 'Image must be less than 5MB', success: false }
            }

            // Upload to Supabase Storage
            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) {
                console.error('Upload error:', uploadError)
                // If bucket doesn't exist or permissions fail, we might fail here.
                // For now, return error.
                return { error: 'Failed to upload image. Please try again.', success: false }
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            avatarUrl = publicUrl
        } else if (avatarOption === 'default' && defaultAvatarUrl) {
            avatarUrl = defaultAvatarUrl
        }

        // 4. Update Profile
        const updateData: any = {
            display_name: displayName,
            school: school,
            bio: bio,
            updated_at: new Date().toISOString(),
        }

        if (avatarUrl) {
            updateData.avatar_url = avatarUrl
        }

        const { error: updateError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', user.id)

        if (updateError) {
            console.error('Profile update error:', updateError)
            return { error: 'Failed to update profile', success: false }
        }

        revalidatePath('/dashboard')
        revalidatePath('/dashboard/profile')

        return { success: true, message: 'Profile updated successfully!' }
    } catch (e) {
        console.error('Unexpected error:', e)
        return { error: 'An unexpected error occurred', success: false }
    }
}
