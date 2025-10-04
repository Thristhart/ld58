import { Player } from "./entities/player";
import { Entity } from "./entity";

export class Pickup extends Entity {
    consume(consumer: Entity) {
        if (consumer instanceof Player) {
            consumer.addSegment();
        }

        const newPos = this.gameWorld.getRandomEmptyPositionNearPlayer();
        const newCopy = new Pickup(newPos, this.gameWorld);
        this.gameWorld.addEntity(newCopy);
    }
}
