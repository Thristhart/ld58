import cloneDeep from "lodash.clonedeep";
import { Player } from "./entities/player";
import { TileEntity } from "./entities/tile";
import { Entity, Position } from "./entity";
import { defaultGameState, GameState } from "./gamestate";
import { RoomDefinition, RoomInstance, TileType } from "./room";
import { Wall } from "./entities/wall";
import { addPositions, Direction, getPositionInDirection, getRandomDirection } from "#src/direction.ts";
import { ClosedDoor } from "./entities/door";
import { WingedEnemy } from "./entities/wingedenemy";
import { Pickup } from "./entities/pickup";

type PositionString = `${number},${number}`;
export class GameWorld {
    private entities: Map<PositionString, Set<Entity>>;
    public player!: Player;
    private gameState: GameState = cloneDeep(defaultGameState);
    private stateChangeSubscriptions = new Map<string, Set<() => void>>();
    public rooms = new Set<RoomInstance>();

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

    public addPoint(delta: number): void {
        this.gameState["points"] = this.gameState.points + delta;
        this.stateChangeSubscriptions.get("points")?.forEach((callback) => callback());
    }

    public createRoom(roomDefinition: RoomDefinition, position: Position) {
        const room = new RoomInstance(position, roomDefinition, this.rooms.size);
        this.rooms.add(room);
        room.definition.locations.forEach((tileType, location) => {
            const pos = addPositions(position, location);
            // No matter what, don't splat stuff on existing tiles
            if (!this.isPositionEmpty(pos)) {
                return;
            }
            if (tileType === TileType.Wall) {
                let facing = Direction.North;
                if (location.x === 0) {
                    facing = Direction.West;
                }
                if (location.x === room.definition.width - 1) {
                    facing = Direction.East;
                }
                const wall = new Wall(pos, this, facing);
                this.addEntity(wall);
            }
            if (tileType === TileType.Door) {
                let facing = Direction.North;
                if (location.x === 0) {
                    facing = Direction.West;
                }
                if (location.x === room.definition.width - 1) {
                    facing = Direction.East;
                }
                if (location.y === room.definition.height - 1) {
                    facing = Direction.South;
                }
                const door = new ClosedDoor(pos, this, 8, room, facing);
                this.addEntity(door);
            }
            // if (tileType === TileType.EnemySpawn) {
            //     const enemySpawnRand = Math.floor(Math.random() * 100);
            //     if (enemySpawnRand < this.gameState.enemyChanceMultiplier) {
            //         const enemy = new WingedEnemy(pos, this, getRandomDirection());
            //         this.addEntity(enemy);
            //     }
            // }
            if (tileType === TileType.FoodSpawn) {
                const foodSpawnRand = Math.floor(Math.random() * 100);
                if (foodSpawnRand < this.gameState.foodChanceMultiplier) {
                    const food = new Pickup(pos, this, Direction.North);
                    this.addEntity(food);
                }
            }
        });
        return room;
    }

    public getRoomContainingPosition(position: Position) {
        for (const room of this.rooms) {
            if (room.containsPoint(position)) {
                return room;
            }
        }
        return undefined;
    }

    public getEmptyPositionNear(position: Position) {
        if (this.isPositionEmpty(position)) {
            return position;
        }
        // could be smarter about this... but fuck it, this is probably fine
        const north = getPositionInDirection(position, Direction.North);
        if (this.isPositionEmpty(north)) {
            return north;
        }
        const east = getPositionInDirection(position, Direction.East);
        if (this.isPositionEmpty(east)) {
            return east;
        }
        const south = getPositionInDirection(position, Direction.South);
        if (this.isPositionEmpty(south)) {
            return south;
        }
        const west = getPositionInDirection(position, Direction.West);
        if (this.isPositionEmpty(west)) {
            return west;
        }
        // ... this is a bug waiting to happen. meh. game jams
        return position;
    }

    public getRoomSpawnPosition(roomRelativePosition: Position, room: RoomInstance) {
        return this.getEmptyPositionNear(addPositions(room.position, roomRelativePosition));
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
    getEntitiesInRoom(room: RoomInstance) {
        const entities = [];
        for (const pos of room.pointsInRoom()) {
            entities.push(...this.getEntitiesAt(pos));
        }
        return entities;
    }
    isPositionEmpty(position: Position) {
        const entitiesAtPos = this.getEntitiesAt(position);
        for (const entity of entitiesAtPos.values()) {
            if (!(entity instanceof TileEntity)) {
                return false;
            }
        }
        return true;
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
        const currentRoom = this.getRoomContainingPosition(this.player.position);
        let attemptCount = 0;
        while (attemptCount++ < 100) {
            const candidate = {
                x: this.player.position.x - distance + Math.floor(distance * 2 * Math.random()),
                y: this.player.position.y - distance + Math.floor(distance * 2 * Math.random()),
            };
            if (currentRoom) {
                if (!currentRoom.containsPoint(candidate)) {
                    continue;
                }
            }
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
        // uh, couldn't find a spot? just slap it on the player, screw it
        return { ...this.player.position };
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
