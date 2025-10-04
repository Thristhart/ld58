import { xor } from "lodash";

export class Entity {
    position: { x: number; y: number };
    direction: EntityDirection;

    constructor(position: { x: number; y: number }, direction: EntityDirection = EntityDirection.North) {
        this.position = position;
        this.direction = direction;
    }
}

export enum EntityDirection {
    North,
    East,
    South,
    West,
}

export class Position {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}
