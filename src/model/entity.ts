import { GRID_SQUARE_SIZE } from "#src/constants.ts";

export class Entity {
    position: Position;
    direction: EntityDirection;

    constructor(position: Position, direction: EntityDirection = EntityDirection.North) {
        this.position = position;
        this.direction = direction;
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
