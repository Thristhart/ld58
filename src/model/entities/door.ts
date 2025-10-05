import closedDoorImageUrl from "#src/assets/door_closed.png";
import openDoorImageUrl from "#src/assets/door_open.png";
import { drawRotatedImage } from "#src/drawRotatedImage.ts";
import { loadImage } from "#src/images.ts";
import { TileEntity } from "./tile";
import { Wall } from "./wall";

const openDoorImage = loadImage(openDoorImageUrl);
const closedDoorImage = loadImage(closedDoorImageUrl);

export class OpenDoor extends TileEntity {
    draw(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
        drawRotatedImage(context, openDoorImage.bitmap, this.position, (Math.PI / 2) * this.facing);
    }
}
export class ClosedDoor extends Wall {
    draw(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
        drawRotatedImage(context, closedDoorImage.bitmap, this.position, (Math.PI / 2) * this.facing);
    }
}
