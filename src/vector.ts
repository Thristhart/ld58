import { Direction } from "./direction";

export interface Vector {
    x: number;
    y: number;
}
export function normalizeVector(vector: Vector): Vector {
    const l = length(vector);
    if (l === 0) {
        return { x: 0, y: 0 };
    }
    return {
        x: vector.x / l,
        y: vector.y / l,
    };
}

export function getVectorFromDirection(direction: Direction): Vector {
    switch (direction) {
        case Direction.North:
            return { x: 0, y: -1 };
        case Direction.East:
            return { x: 1, y: 0 };
        case Direction.South:
            return { x: 0, y: 1 };
        case Direction.West:
            return { x: -1, y: 0 };
    }
}

export function lengthSquared(vector: Vector) {
    return vector.x * vector.x + vector.y * vector.y;
}

export function length(vector: Vector) {
    return Math.sqrt(lengthSquared(vector));
}

export function scaleMut(vector: Vector, scalar: number) {
    vector.x *= scalar;
    vector.y *= scalar;
    return vector;
}
export function scale(vector: Vector, scalar: number) {
    return { x: vector.x * scalar, y: vector.y * scalar };
}

export function roundMut(vector: Vector) {
    vector.x = Math.round(vector.x);
    vector.y = Math.round(vector.y);
}

export function isEqual(a: Vector, b: Vector) {
    return a.x === b.x && a.y === b.y;
}

export function addMut(a: Vector, b: Vector) {
    a.x += b.x;
    a.y += b.y;
}

export function add(a: Vector, b: Vector) {
    return { x: a.x + b.x, y: a.y + b.y };
}

export function copyMut(a: Vector, b: Vector) {
    a.x = b.x;
    a.y = b.y;
}

export function getDirectionAngle(vector: Vector) {
    let a = Math.atan2(vector.y, vector.x);
    while (a < 0) {
        a += Math.PI * 2;
    }
    while (a > Math.PI * 2) {
        a -= Math.PI * 2;
    }
    return a;
}

export function subtract(a: Vector, b: Vector) {
    return {
        x: a.x - b.x,
        y: a.y - b.y,
    };
}

export function dot(a: Vector, b: Vector) {
    return a.x * b.x + a.y * b.y;
}

export function angleBetweenPoints(a: Vector, b: Vector) {
    return getDirectionAngle(subtract(a, b));
}

function alwaysPositiveMod(n: number, mod: number) {
    return ((n % mod) + mod) % mod;
}

export function angleDistance(current: number, target: number) {
    let diff = alwaysPositiveMod(target - current, Math.PI * 2);
    if (diff > Math.PI) {
        diff = -(Math.PI * 2 - diff);
    }
    return diff;
}
