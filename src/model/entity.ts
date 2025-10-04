import { GRID_SQUARE_SIZE } from "#src/constants.ts";

export class Entity {
    position: Position;
    facing: EntityDirection;

    constructor(position: Position, facing: EntityDirection = EntityDirection.North) {
        this.position = position;
        this.facing = facing;
    }

    draw(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
        context.fillRect(this.position.x, this.position.y, GRID_SQUARE_SIZE, GRID_SQUARE_SIZE);
    }
}

export enum EntityDirection {
    North,
    East,
    South,
    West,
}

export interface Position {
    x: number;
    y: number;
}
