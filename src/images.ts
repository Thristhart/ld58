const unloadedImages = new Set<HTMLImageElement>();

export function loadImage(url: string) {
    const image = new Image() as HTMLImageElement & { bitmap: ImageBitmap };
    unloadedImages.add(image);
    image.addEventListener("load", async () => {
        image.bitmap = await createImageBitmap(image);
        unloadedImages.delete(image);
        if (unloadedImages.size === 0) {
            resolveImageLoad();
        }
    });
    image.addEventListener("error", () => {
        unloadedImages.delete(image);
    });
    image.src = url;
    return image;
}
let resolveImageLoad: () => void;
export const imageLoadPromise = new Promise<void>((resolve) => {
    resolveImageLoad = resolve;
});
