import cloneDeep from "lodash.clonedeep";
import { Player } from "./entities/player";
import { TileEntity } from "./entities/tile";
import { Entity, Position } from "./entity";
import { defaultGameState, GameState } from "./gamestate";
import { RoomDefinition, RoomInstance } from "./room";
import { Wall } from "./entities/wall";
import { addPositions, Direction, getPositionInDirection } from "#src/direction.ts";

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
        const room = new RoomInstance(position, roomDefinition);
        this.rooms.add(room);
        let candidates: { x: number; y: number; direction?: number }[] = [];
        for (let x = position.x - 1; x <= position.x + roomDefinition.width; x++) {
            candidates.push({ x, y: position.y - 1, direction: Direction.North });
            candidates.push({ x, y: position.y + roomDefinition.height, direction: Direction.North });
        }
        for (let y = position.y - 1; y <= position.y + roomDefinition.height; y++) {
            candidates.push({ x: position.x - 1, y, direction: Direction.West });
            candidates.push({ x: position.x + roomDefinition.width, y, direction: Direction.West });
        }
        for (const pos of candidates) {
            if (this.getEntitiesAt(pos).size > 0) {
                continue;
            }
            const wall = new Wall(pos, this, pos.direction);
            this.addEntity(wall);
        }
        if (roomDefinition.initialSpawns) {
            roomDefinition.initialSpawns(this, room);
        }
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
