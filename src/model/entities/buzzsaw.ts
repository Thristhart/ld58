import { getPositionInDirection, reverseDirection } from "#src/direction.ts";
import { Enemy } from "./enemy";
import { Wall } from "./wall";
import { loadImage } from "#src/images.ts";

import buzzsawImageUrl from "#src/assets/buzzsaw.png";
import { drawRotatedImage } from "#src/drawRotatedImage.ts";
const buzzsawImage = loadImage(buzzsawImageUrl);

export class Buzzsaw extends Enemy {
    timeSinceMove = 0;
    timePerMove = 200;

    moveForward() {
        const nextPosition = getPositionInDirection(this.position, this.facing);
        const entitiesAtPos = this.gameWorld.getEntitiesAt(nextPosition);
        for (const entity of entitiesAtPos) {
            if (entity instanceof Wall) {
                this.facing = reverseDirection(this.facing);
                return;
            }
        }

        this.gameWorld.moveEntity(this, nextPosition);
    }
    think(dt: number): void {
        this.timeSinceMove += dt;
        if (this.timeSinceMove > this.timePerMove) {
            this.timeSinceMove = 0;
            this.moveForward();
        }
    }
    draw(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
        drawRotatedImage(context, buzzsawImage, this.position, (Math.PI * this.timeSinceMove) / this.timePerMove);
    }
}
