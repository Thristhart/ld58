import { Position } from "./entity";
import { GameWorld } from "./gameworld";

export interface RoomDefinition {
    width: number;
    height: number;
    initialSpawns?: (gameWorld: GameWorld, room: RoomInstance) => void;
    // not yet implemented
    playerEntered?: (gameWorld: GameWorld, room: RoomInstance) => void;
}

export class RoomInstance {
    position: Position;
    definition: RoomDefinition;

    constructor(position: Position, definition: RoomDefinition) {
        this.position = position;
        this.definition = definition;
    }

    centerPoint() {
        return { x: this.position.x + this.definition.width / 2, y: this.position.y + this.definition.height / 2 };
    }

    containsPoint(point: Position) {
        // +/- 1 for walls
        return (
            point.x >= this.position.x - 1 &&
            point.x <= this.position.x + this.definition.width + 1 &&
            point.y >= this.position.y - 1 &&
            point.y <= this.position.y + this.definition.height + 1
        );
    }

    *pointsInRoom() {
        // +/- 1 for walls
        for (let x = this.position.x - 1; x < this.position.x + this.definition.width + 1; x++) {
            for (let y = this.position.y - 1; y < this.position.y + this.definition.height + 1; y++) {
                yield { x, y };
            }
        }
    }
}
