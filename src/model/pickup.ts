import { Player } from "./entities/player";
import { Entity } from "./entity";
import { loadImage } from "#src/images.ts";

import pickupImageUrl from "#src/assets/pickup.png";
import { GRID_SQUARE_SIZE } from "#src/constants.ts";
const pickupImage = loadImage(pickupImageUrl);

export class Pickup extends Entity {
    consume(consumer: Entity) {
        if (consumer instanceof Player) {
            consumer.addSegment();
        }

        const newPos = this.gameWorld.getRandomEmptyPositionNearPlayer();
        const newCopy = new Pickup(newPos, this.gameWorld);
        this.gameWorld.addEntity(newCopy);
    }
    draw(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
        context.drawImage(
            pickupImage,
            this.position.x * GRID_SQUARE_SIZE,
            this.position.y * GRID_SQUARE_SIZE,
            GRID_SQUARE_SIZE,
            GRID_SQUARE_SIZE
        );
    }
}
