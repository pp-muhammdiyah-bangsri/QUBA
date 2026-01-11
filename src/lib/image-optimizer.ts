
/**
 * Fetches an image URL and returns a resized Base64 Data URL.
 * Optimal for passing images to react-pdf to reduce document size and processing time.
 */
export async function optimizeImage(url: string, maxWidth: number = 300): Promise<string | null> {
    if (!url) return null;

    try {
        // 1. Fetch the image with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const response = await fetch(url, {
            mode: 'cors',
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error("Failed to fetch image");

        const blob = await response.blob();

        // 2. Create standard Image object
        const img = new Image();
        const objectUrl = URL.createObjectURL(blob);
        img.src = objectUrl;

        // 3. Wait for load and draw to canvas
        return new Promise((resolve) => {
            img.onload = () => {
                const aspect = img.height / img.width;
                const width = Math.min(img.width, maxWidth);
                const height = width * aspect;

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    // Compress to JPEG 0.8
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    resolve(dataUrl);
                } else {
                    resolve(null);
                }

                URL.revokeObjectURL(objectUrl);
            };

            img.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                resolve(null); // Fallback to null on error
            };
        });
    } catch (error) {
        console.error("Image optimization failed:", error);
        return null; // Return null so PDF falls back to generic avatar if needed
    }
}
