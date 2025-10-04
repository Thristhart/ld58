import { GRID_SQUARE_SIZE } from "#src/constants.ts";
import { GameWorld } from "./gameworld";
import { Direction } from "#src/direction.ts";

export class Entity {
    position: Position;
    facing: Direction;
    gameWorld: GameWorld;

    constructor(position: Position, gameWorld: GameWorld, facing: Direction = Direction.North) {
        this.position = position;
        this.gameWorld = gameWorld;
        this.facing = facing;
    }

    draw(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
        context.fillRect(
            this.position.x * GRID_SQUARE_SIZE,
            this.position.y * GRID_SQUARE_SIZE,
            GRID_SQUARE_SIZE,
            GRID_SQUARE_SIZE
        );
    }
}

export interface Position {
    x: number;
    y: number;
}
