const unloadedImages = new Set<HTMLImageElement>();

export function loadImage(url: string) {
    const image = new Image() as HTMLImageElement & { bitmap: ImageBitmap; promise: Promise<void> };
    unloadedImages.add(image);
    let resolveThisLoad: () => void;
    image.promise = new Promise<void>((resolve) => {
        resolveThisLoad = resolve;
    });
    image.addEventListener("load", async () => {
        image.bitmap = await createImageBitmap(image);
        unloadedImages.delete(image);
        resolveThisLoad();
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
