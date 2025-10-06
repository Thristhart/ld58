import { Player } from "./player";
import { Entity } from "../entity";
import { loadImage } from "#src/images.ts";

import pickupImageUrl from "#src/assets/egg.png";
import { GRID_SQUARE_SIZE } from "#src/constants.ts";
import { ClosedDoor } from "./door";
const pickupImage = loadImage(pickupImageUrl);

export class Pickup extends Entity {
    consume(consumer: Entity) {
        if (consumer instanceof Player) {
            consumer.addSegment();
        }

        const newPos = this.gameWorld.getRandomEmptyFoodSpawnPositionNearPlayer();
        const currentRoom = this.gameWorld.getRoomContainingPosition(this.gameWorld.player.position)!;
        const doors = this.gameWorld.getEntitiesInRoom(currentRoom).filter((x) => x instanceof ClosedDoor);
        let biggestDoor = 0;
        doors.forEach((x) => {
            if (x.openRequirements > biggestDoor) {
                biggestDoor = x.openRequirements;
            }
        });

        const pickups = this.gameWorld.getEntitiesInRoom(currentRoom).filter((x) => x instanceof Pickup);
        let maximumSizePossibleCurrently = this.gameWorld.player.otherSegments.length + pickups.length;
        if (maximumSizePossibleCurrently <= biggestDoor + 1) {
            const newCopy = new Pickup(newPos, this.gameWorld);
            this.gameWorld.addEntity(newCopy);
        }
    }
    draw(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
        context.drawImage(
            pickupImage.bitmap,
            this.position.x * GRID_SQUARE_SIZE,
            this.position.y * GRID_SQUARE_SIZE,
            GRID_SQUARE_SIZE,
            GRID_SQUARE_SIZE
        );
    }
}
