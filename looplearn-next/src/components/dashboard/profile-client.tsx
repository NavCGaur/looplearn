'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { startTransition } from 'react'
import { updateProfile } from '@/app/actions/profile'
import { signOut } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { LoopLearnXIcon } from '@/components/ui/brand-icons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Loader2, Upload, User, School, BookOpen, Save, CheckCircle2, AlertCircle, Home, LogOut, BarChart3 } from 'lucide-react'

// Simple Toast Component
function Toast({ title, description, variant = 'default', onClose }: { title: string, description: string, variant?: 'default' | 'destructive', onClose: () => void }) {
    return (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg border flex items-start gap-3 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 ${variant === 'destructive' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-white border-gray-200 text-gray-800'}`}>
            {variant === 'destructive' ? <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" /> : <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />}
            <div>
                <h4 className="font-semibold text-sm">{title}</h4>
                <p className="text-sm opacity-90">{description}</p>
            </div>
            <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600">×</button>
        </div>
    )
}

interface ProfileClientProps {
    user: any // Typed as any for now, should be Profile interface
}

const DEFAULT_AVATARS = [
    '/avatars/avatar_boy_1.png',
    '/avatars/avatar_boy_2.png',
    '/avatars/avatar_boy_3.png',
    '/avatars/avatar_girl_1.png',
    '/avatars/avatar_girl_2.png',
    '/avatars/avatar_girl_3.png',
]

export function ProfileClient({ user }: ProfileClientProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [toast, setToast] = useState<{ title: string, description: string, variant?: 'default' | 'destructive' } | null>(null)

    // Form State
    const [displayName, setDisplayName] = useState(user.name || '')
    const [school, setSchool] = useState(user.school || '')
    const [bio, setBio] = useState(user.bio || '')
    const [classStandard, setClassStandard] = useState(user.class?.toString() || '9')

    // Avatar State
    const [avatarOption, setAvatarOption] = useState<'default' | 'upload'>('default')
    const [selectedDefaultAvatar, setSelectedDefaultAvatar] = useState(user.avatar_url && DEFAULT_AVATARS.includes(user.avatar_url) ? user.avatar_url : DEFAULT_AVATARS[0])
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(user.avatar_url || null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setUploadedFile(file)
            setAvatarOption('upload')
            // Create preview
            const objectUrl = URL.createObjectURL(file)
            setPreviewUrl(objectUrl)
        }
    }

    const handleDefaultAvatarSelect = (avatarUrl: string) => {
        setSelectedDefaultAvatar(avatarUrl)
        setAvatarOption('default')
        setPreviewUrl(avatarUrl)
        setUploadedFile(null)
    }

    const showToast = (title: string, description: string, variant: 'default' | 'destructive' = 'default') => {
        setToast({ title, description, variant })
        setTimeout(() => setToast(null), 5000)
    }

    const handleSignOut = async () => {
        await signOut()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const formData = new FormData()
        formData.append('displayName', displayName)
        formData.append('school', school)
        formData.append('bio', bio)
        formData.append('class', classStandard)
        formData.append('avatarOption', avatarOption)

        if (avatarOption === 'default') {
            formData.append('defaultAvatarUrl', selectedDefaultAvatar)
        } else if (avatarOption === 'upload' && uploadedFile) {
            formData.append('avatarFile', uploadedFile)
        }

        startTransition(async () => {
            const result = await updateProfile({}, formData)

            if (result.success) {
                showToast("Profile Updated", "Your changes have been saved successfully.")
                router.refresh()
            } else {
                showToast("Error", result.error || "Failed to update profile.", "destructive")
            }
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-blue-100/50 shadow-sm">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="flex items-center gap-2 group hover:opacity-90 transition-opacity">
                                <span className="text-2xl font-bold font-fredoka flex items-center">
                                    <span className="bg-gradient-to-r from-blue-500 via-green-500 to-blue-600 bg-clip-text text-transparent">LoopLearn</span>
                                    <LoopLearnXIcon className="w-8 h-8" />
                                </span>
                            </Link>
                            <div className="hidden md:block h-6 w-px bg-gray-200" />
                            <div className="hidden md:block">
                                <h1 className="text-xl font-fredoka font-bold text-gray-800">
                                    My Profile
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link href="/" className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-fredoka font-bold text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
                                <Home className="w-4 h-4" />
                                Home
                            </Link>

                            <Link href="/dashboard/analytics" className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-fredoka font-bold text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
                                <BarChart3 className="w-4 h-4" />
                                Analytics
                            </Link>

                            {(user.role === 'teacher' || user.role === 'admin') && (
                                <Link
                                    href="/dashboard"
                                    className="hidden sm:block text-sm font-fredoka font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-4 py-2 rounded-full transition-colors"
                                >
                                    Teacher View
                                </Link>
                            )}

                            <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-fredoka font-bold text-gray-900 leading-none">{user.name}</p>
                                    <p className="text-xs font-fredoka text-gray-500">Class {user.class || 'N/A'}</p>
                                </div>
                                <button
                                    onClick={handleSignOut}
                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                                    title="Sign Out"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Left Column - Avatar */}
                        <Card className="md:col-span-1 border-blue-100 shadow-md">
                            <CardHeader>
                                <CardTitle className="text-lg font-fredoka">Profile Picture</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center gap-4">
                                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg ring-2 ring-blue-100">
                                    <Image
                                        src={previewUrl || '/loopie-main.png'}
                                        alt="Avatar Preview"
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                <div className="w-full bg-gray-100 p-1 rounded-lg grid grid-cols-2 gap-1 mb-2">
                                    <button
                                        type="button"
                                        onClick={() => setAvatarOption('default')}
                                        className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${avatarOption === 'default' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Choose
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAvatarOption('upload')}
                                        className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${avatarOption === 'upload' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Upload
                                    </button>
                                </div>

                                {avatarOption === 'default' ? (
                                    <div className="grid grid-cols-3 gap-2 w-full animate-in fade-in slide-in-from-bottom-2">
                                        {DEFAULT_AVATARS.map((avatar, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => handleDefaultAvatarSelect(avatar)}
                                                className={`relative w-16 h-16 rounded-full overflow-hidden border-2 transition-all ${selectedDefaultAvatar === avatar ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent hover:border-gray-200'}`}
                                            >
                                                <Image src={avatar} alt={`Avatar ${i + 1}`} fill className="object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="w-full animate-in fade-in slide-in-from-bottom-2">
                                        <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer relative hover:border-blue-300">
                                            <Upload className="w-8 h-8 text-gray-400" />
                                            <span className="text-xs text-gray-500 text-center">Click to select image</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                        </label>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Right Column - Details */}
                        <Card className="md:col-span-2 border-blue-100 shadow-md">
                            <CardHeader>
                                <CardTitle className="text-lg font-fredoka">Personal Details</CardTitle>
                                <CardDescription>Update your personal information properly.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="displayName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Display Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <input
                                            id="displayName"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-9"
                                            placeholder="Your Name"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="class" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Class / Standard</label>
                                        <div className="relative">
                                            <BookOpen className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                                            <div className="flex h-10 w-full rounded-md border border-input bg-gray-100 px-3 py-2 text-sm ring-offset-background pl-9 items-center text-gray-500 cursor-not-allowed">
                                                {classStandard ? `Grade ${classStandard}` : 'Not Assigned'}
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-1 ml-1">Read-only</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="school" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">School Name</label>
                                        <div className="relative">
                                            <School className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <input
                                                id="school"
                                                value={school}
                                                onChange={(e) => setSchool(e.target.value)}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-9"
                                                placeholder="Your School"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="bio" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Bio</label>
                                    <textarea
                                        id="bio"
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Tell us a bit about yourself..."
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none h-32"
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end pt-2">
                                <Button type="submit" disabled={isPending} className="bg-gradient-to-r from-blue-600 to-indigo-600 font-bold hover:opacity-90 transition-opacity">
                                    {isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </form>
            </div>
        </div>
    )
}
