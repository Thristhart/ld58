import { Entity, Position } from "./entity";

type PositionString = `${number},${number}`;
export class GameWorld {
    private entities: Map<PositionString, Set<Entity>>;

    constructor() {
        this.entities = new Map<PositionString, Set<Entity>>();
    }

    getEntitiesNear(position: Position, distance: number) {
        return this.getEntitiesInArea({
            x: position.x - distance,
            y: position.y - distance,
            w: distance * 2,
            h: distance * 2,
        });
    }
    getEntitiesInArea(box: { x: number; y: number; w: number; h: number }) {
        const result: Entity[] = [];
        for (let x = box.x; x <= box.x + box.w; x++) {
            for (let y = box.y; y <= box.y + box.h; y++) {
                result.push(...this.getEntitiesAt({ x, y }));
            }
        }
        return result;
    }

    getEntitiesAt(position: Position) {
        return this.entities.get(`${position.x},${position.y}`) ?? [];
    }

    addEntity(entity: Entity) {
        const posStr = `${entity.position.x},${entity.position.y}` as const;
        const entitiesAtPos = this.entities.get(posStr) ?? new Set<Entity>();
        entitiesAtPos.add(entity);
        this.entities.set(posStr, entitiesAtPos);
    }

    static isPointWithinBox(point: Position, box: { x: number; y: number; w: number; h: number }) {
        return point.x >= box.x && point.x <= box.x + box.w && point.y >= box.y && point.y <= box.y + box.h;
    }
}
