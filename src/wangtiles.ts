import { Direction } from "./direction";

enum Corners {
    NorthEast = 1,
    SouthEast = 2,
    SouthWest = 4,
    NorthWest = 8,
}
function getValidTilesInDirection(wangIndex: number, direction: Direction) {
    let corners: [boolean, boolean];
    let opposites: [Corners, Corners];
    switch (direction) {
        case Direction.North:
            corners = [!!(wangIndex & Corners.NorthEast), !!(wangIndex & Corners.NorthWest)] as const;
            opposites = [Corners.SouthEast, Corners.SouthWest] as const;
            break;
        case Direction.East:
            corners = [!!(wangIndex & Corners.NorthEast), !!(wangIndex & Corners.SouthEast)] as const;
            opposites = [Corners.NorthWest, Corners.SouthWest] as const;
            break;
        case Direction.South:
            corners = [!!(wangIndex & Corners.SouthWest), !!(wangIndex & Corners.SouthEast)] as const;
            opposites = [Corners.NorthWest, Corners.NorthEast] as const;
            break;
        case Direction.West:
            corners = [!!(wangIndex & Corners.SouthWest), !!(wangIndex & Corners.NorthWest)] as const;
            opposites = [Corners.SouthEast, Corners.NorthEast] as const;
            break;
    }
    const validTiles = [];
    for (let i = 0; i < 16; i++) {
        if (corners[0] === !!(i & opposites[0]) && corners[1] === !!(i & opposites[1])) {
            validTiles.push(i);
        }
    }
    return new Set(validTiles);
}

function union<T>(setA: Set<T>, setB: Set<T>) {
    const c = new Set<T>();
    for (const item of setA) {
        if (setB.has(item)) {
            c.add(item);
        }
    }
    return c;
}

function generateWangMap() {
    return Array.from({ length: 16 }, (_, i) => ({
        [Direction.North]: getValidTilesInDirection(i, Direction.North),
        [Direction.East]: getValidTilesInDirection(i, Direction.East),
        [Direction.South]: getValidTilesInDirection(i, Direction.South),
        [Direction.West]: getValidTilesInDirection(i, Direction.West),
    }));
}
const wang = generateWangMap();
console.log(wang);

export function getValidWangTile(neighbors: { wangIndex: number; direction: Direction }[]) {
    let validTiles = new Set(Array.from({ length: 16 }, (_, i) => i));
    for (const neighbor of neighbors) {
        validTiles = union(validTiles, wang[neighbor.wangIndex][neighbor.direction]);
    }
    const options = [...validTiles];
    return options[Math.floor(Math.random() * options.length)];
}
