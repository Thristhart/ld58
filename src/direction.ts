import { Position } from "./model/entity";

export enum Direction {
    North,
    East,
    South,
    West,
}
export enum RelativeDirection {
    Forward,
    Left,
    Right,
    Backwards,
}

export function getPositionInDirection(position: Position, direction: Direction) {
    switch (direction) {
        case Direction.North:
            return { x: position.x, y: position.y - 1 };
        case Direction.East:
            return { x: position.x + 1, y: position.y };
        case Direction.South:
            return { x: position.x, y: position.y + 1 };
        case Direction.West:
            return { x: position.x - 1, y: position.y };
    }
}

export function reverseDirection(direction: Direction) {
    switch (direction) {
        case Direction.North:
            return Direction.South;
        case Direction.East:
            return Direction.West;
        case Direction.South:
            return Direction.North;
        case Direction.West:
            return Direction.East;
    }
}

export function perpendicularDirection(direction: Direction) {
    switch (direction) {
        case Direction.North:
            return Direction.West;
        case Direction.East:
            return Direction.North;
        case Direction.South:
            return Direction.East;
        case Direction.West:
            return Direction.South;
    }
}

// assumes they're 1 away, but mostly works otherwise
export function getDirectionBetweenTwoPositions(from: Position, to: Position) {
    if (from.x < to.x) {
        return Direction.East;
    }
    if (from.x > to.x) {
        return Direction.West;
    }
    if (from.y > to.y) {
        return Direction.North;
    }
    if (from.y < to.y) {
        return Direction.South;
    }

    // default to north if they're the same point
    return Direction.North;
}

export function getRelativeDirectionBetweenTwoDirections(from: Direction, to: Direction): RelativeDirection {
    switch (from) {
        case Direction.North:
            switch (to) {
                case Direction.North:
                    return RelativeDirection.Forward;
                case Direction.East:
                    return RelativeDirection.Right;
                case Direction.West:
                    return RelativeDirection.Left;
                case Direction.South:
                    return RelativeDirection.Backwards;
            }
        case Direction.East:
            switch (to) {
                case Direction.North:
                    return RelativeDirection.Left;
                case Direction.East:
                    return RelativeDirection.Forward;
                case Direction.West:
                    return RelativeDirection.Backwards;
                case Direction.South:
                    return RelativeDirection.Right;
            }
        case Direction.South:
            switch (to) {
                case Direction.North:
                    return RelativeDirection.Backwards;
                case Direction.East:
                    return RelativeDirection.Left;
                case Direction.West:
                    return RelativeDirection.Right;
                case Direction.South:
                    return RelativeDirection.Forward;
            }
        case Direction.West:
            switch (to) {
                case Direction.North:
                    return RelativeDirection.Right;
                case Direction.East:
                    return RelativeDirection.Backwards;
                case Direction.West:
                    return RelativeDirection.Forward;
                case Direction.South:
                    return RelativeDirection.Left;
            }
    }
}
