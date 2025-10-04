import { Entity, Position } from "./entity";

export class GameWorld {
    entities: Map<Position, Entity>;

    constructor() {
        this.entities = new Map<Position, Entity>();
    }

    getEntitiesNear(position: Position, distance: number) {
        const result = new Map<Position, Entity>();
        for (const [key, value] of this.entities) {
            if (
                GameWorld.isPointWithinBox(key, {
                    x: position.x - distance,
                    y: position.y - distance,
                    w: distance * 2,
                    h: distance * 2,
                })
            ) {
                result.set(key, value);
            }
        }
        return result;
    }

    static isPointWithinBox(point: Position, box: { x: number; y: number; w: number; h: number }) {
        return point.x >= box.x && point.x <= box.x + box.w && point.y >= box.y && point.y <= box.y + box.h;
    }
}
