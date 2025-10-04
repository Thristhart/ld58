import { Player } from "./entities/player";
import { TileEntity } from "./entities/tile";
import { Entity, Position } from "./entity";
import { defaultGameState, GameState } from "./gamestate";

type PositionString = `${number},${number}`;
export class GameWorld {
    private entities: Map<PositionString, Set<Entity>>;
    public player!: Player;
    private gameState: GameState = defaultGameState;
    private stateChangeSubscriptions = new Map<string, Set<() => void>>();

    constructor() {
        this.entities = new Map<PositionString, Set<Entity>>();
    }

    public subscribeToStateChange<K extends keyof GameState>(property: K, onStoreChange: () => void) {
        const setSubscriptions = this.stateChangeSubscriptions.get(property) ?? new Set();
        setSubscriptions.add(onStoreChange);
        this.stateChangeSubscriptions.set(property, setSubscriptions);
    }

    public unsubscribeFromStateChange<K extends keyof GameState>(property: K, onStoreChange: () => void) {
        this.stateChangeSubscriptions.get(property)?.delete(onStoreChange);
    }

    public getGameState<K extends keyof GameState>(property: K): GameState[K] {
        return this.gameState[property];
    }

    public setGameState<K extends keyof GameState>(property: K, value: GameState[K]): void {
        this.gameState[property] = value;
        this.stateChangeSubscriptions.get(property)?.forEach((callback) => callback());
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
        return this.entities.get(`${position.x},${position.y}`) ?? new Set();
    }

    addEntity(entity: Entity) {
        const posStr = `${entity.position.x},${entity.position.y}` as const;
        const entitiesAtPos = this.entities.get(posStr) ?? new Set<Entity>();
        entitiesAtPos.add(entity);
        this.entities.set(posStr, entitiesAtPos);
    }

    moveEntity(entity: Entity, newPosition: Position) {
        const posStr = `${entity.position.x},${entity.position.y}` as const;
        const entitiesAtPos = this.entities.get(posStr);
        if (entitiesAtPos) {
            entitiesAtPos.delete(entity);
        }

        const newPosStr = `${newPosition.x},${newPosition.y}` as const;
        const entitiesAtNewPos = this.entities.get(newPosStr) ?? new Set<Entity>();
        entitiesAtNewPos.add(entity);
        this.entities.set(newPosStr, entitiesAtNewPos);

        entity.position = newPosition;
    }

    removeEntity(entity: Entity) {
        this.getEntitiesAt(entity.position).delete(entity);
        this.cleanEntities();
    }

    getRandomEmptyPositionNearPlayer() {
        const distance = 3;
        while (true) {
            const candidate = {
                x: this.player.position.x - distance + Math.floor(distance * 2 * Math.random()),
                y: this.player.position.y - distance + Math.floor(distance * 2 * Math.random()),
            };
            const entitiesAtPos = this.getEntitiesAt(candidate);
            let notTileEntity = false;
            for (const entity of entitiesAtPos.values()) {
                if (!(entity instanceof TileEntity)) {
                    notTileEntity = true;
                    continue;
                }
            }
            if (notTileEntity) {
                continue;
            }
            return candidate;
        }
    }

    private cleanEntities() {
        this.entities.forEach((value, key) => {
            if (value.size === 0) {
                this.entities.delete(key);
            }
        });
    }

    static isPointWithinBox(point: Position, box: { x: number; y: number; w: number; h: number }) {
        return point.x >= box.x && point.x <= box.x + box.w && point.y >= box.y && point.y <= box.y + box.h;
    }
}
