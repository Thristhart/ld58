import { Entity, Position } from "./entity";

type PositionString = `${number},${number}`;
export class GameWorld {
    private entities: Map<PositionString, Entity[]>;

    constructor() {
        this.entities = new Map<PositionString, Entity[]>();
    }

    getEntitiesNear(position: Position, distance: number) {
        const result: Entity[] = [];
        for (let x = position.x - distance; x++; x < position.x + distance) {
            for (let y = position.y - distance; y++; y < position.y + distance) {
                result.concat(...this.getEntitiesAt({ x, y }));
            }
        }
        return result;
    }

    getEntitiesAt(position: Position) {
        return this.entities.get(`${position.x},${position.y}`) ?? [];
    }

    addEntity(entity: Entity) {
        const posStr = `${entity.position.x},${entity.position.y}` as const;
        const entitiesAtPos = this.entities.get(posStr) ?? [];
        entitiesAtPos.push(entity);
        this.entities.set(posStr, entitiesAtPos);
    }

    static isPointWithinBox(point: Position, box: { x: number; y: number; w: number; h: number }) {
        return point.x >= box.x && point.x <= box.x + box.w && point.y >= box.y && point.y <= box.y + box.h;
    }
}
