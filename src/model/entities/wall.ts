import wallImageUrl from "#src/assets/wall.png";
import { drawRotatedImage } from "#src/drawRotatedImage.ts";
import { loadImage } from "#src/images.ts";
import { Entity } from "../entity";

const wallImage = loadImage(wallImageUrl);

export class Wall extends Entity {
    draw(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
        drawRotatedImage(context, wallImage.bitmap, this.position, (Math.PI / 2) * this.facing);
    }
}
