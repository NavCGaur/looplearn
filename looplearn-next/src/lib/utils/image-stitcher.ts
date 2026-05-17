export const OUTPUT_WIDTH = 1200
export const JPEG_QUALITY = 0.72
export const CONTRAST_FACTOR = 1.5

export async function stitchImages(files: File[]): Promise<{ base64: string, mimeType: 'image/jpeg' }> {
    const imgs = await Promise.all(
        files.map(file =>
            new Promise<HTMLImageElement>((resolve, reject) => {
                const img = new Image()
                img.onload = () => resolve(img)
                img.onerror = reject
                img.src = URL.createObjectURL(file)
            })
        )
    )

    const WIDTH = Math.min(OUTPUT_WIDTH, Math.max(...imgs.map(img => img.naturalWidth)))
    const totalHeight = imgs.reduce((sum, img) => {
        const scale = WIDTH / img.naturalWidth
        return sum + Math.round(img.naturalHeight * scale)
    }, 0)

    const canvas = document.createElement('canvas')
    canvas.width = WIDTH
    canvas.height = totalHeight
    const ctx = canvas.getContext('2d')!

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, WIDTH, totalHeight)

    let y = 0
    for (const img of imgs) {
        const scale = WIDTH / img.naturalWidth
        const h = Math.round(img.naturalHeight * scale)
        ctx.drawImage(img, 0, y, WIDTH, h)
        y += h
    }

    const imgData = ctx.getImageData(0, 0, WIDTH, totalHeight)
    const d = imgData.data
    for (let i = 0; i < d.length; i += 4) {
        const r = d[i]
        const g = d[i + 1]
        const b = d[i + 2]

        const avg = (r + g + b) / 3

        let newColor = avg
        newColor = ((newColor / 255 - 0.5) * CONTRAST_FACTOR + 0.5) * 255
        newColor = Math.max(0, Math.min(255, newColor))

        d[i] = newColor
        d[i + 1] = newColor
        d[i + 2] = newColor
    }
    ctx.putImageData(imgData, 0, 0)

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            blob => {
                if (!blob) return reject(new Error('Canvas to Blob failed'))
                const reader = new FileReader()
                reader.onloadend = () => {
                    const result = reader.result as string
                    const base64 = result.substring(result.indexOf(',') + 1)
                    resolve({ base64, mimeType: 'image/jpeg' })
                }
                reader.onerror = reject
                reader.readAsDataURL(blob)
            },
            'image/jpeg',
            JPEG_QUALITY
        )
    })
}
