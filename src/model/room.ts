import { Position } from "./entity";

export enum TileType {
    Wall,
    Door,
    FoodSpawn,
    EnemySpawn,
}

export interface RoomDefinition {
    width: number;
    height: number;
    locations: Map<Position, TileType>;
    name: string;
}

export class RoomInstance {
    position: Position;
    definition: RoomDefinition;
    id: number;

    constructor(position: Position, definition: RoomDefinition, id: number) {
        this.position = position;
        this.definition = definition;
        this.id = id;
    }

    centerPoint() {
        return { x: this.position.x + this.definition.width / 2, y: this.position.y + this.definition.height / 2 };
    }

    containsPoint(point: Position) {
        return (
            point.x >= this.position.x &&
            point.x < this.position.x + this.definition.width &&
            point.y >= this.position.y &&
            point.y < this.position.y + this.definition.height
        );
    }

    *pointsInRoom() {
        for (let x = this.position.x; x < this.position.x + this.definition.width; x++) {
            for (let y = this.position.y; y < this.position.y + this.definition.height; y++) {
                yield { x, y };
            }
        }
    }
}
