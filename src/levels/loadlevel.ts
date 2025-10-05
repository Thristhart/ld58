import { loadImage } from "#src/images.ts";
import { Position } from "#src/model/entity.ts";
import { RoomDefinition, TileType } from "#src/model/room.ts";

/*
TODO:
zoo.png
*/

import basic from "./basic.png";
import plus from "./plus.png";
import basketball from "./basketball.png";
import c_shape from "./c_shape.png";
import LL from "./LL.png";
import canyon_1 from "./canyon_1.png";
import cubbies from "./cubbies.png";
import equalsmore from "./equalsmore.png";
import zoo from "./zoo.png";
import { ClosedDoor } from "#src/model/entities/door.ts";
import { addPositions, Direction } from "#src/direction.ts";

export const levelLoadPromise = Promise.all([
    loadLevel("basic", loadImage(basic)),
    loadLevel("plus", loadImage(plus)),
    loadLevel("basketball", loadImage(basketball)),
    loadLevel("c_shape", loadImage(c_shape)),
    loadLevel("LL", loadImage(LL)),
    loadLevel("canyon_1", loadImage(canyon_1)),
    loadLevel("cubbies", loadImage(cubbies)),
    loadLevel("equalsmore", loadImage(equalsmore)),
    loadLevel("zoo", loadImage(zoo)),
]);
export const levels: Record<string, RoomDefinition> = {};

function getTileTypeForColor(color: number) {
    switch (color) {
        case 0x000000:
            return TileType.Wall;
        case 0xff0000:
            return TileType.EnemySpawn;
        case 0x00ff00:
            return TileType.Door;
        case 0x0000ff:
            return TileType.FoodSpawn;
        default:
            return undefined;
    }
}

export function rotateRoomDefinition(roomDef: RoomDefinition): RoomDefinition {
    const rotatedLocations = new Map<Position, TileType>();
    for (const [location, tileType] of roomDef.locations) {
        const newLocation = {
            x: -(location.y - Math.floor(roomDef.height / 2)) + Math.floor(roomDef.width / 2),
            y: location.x - Math.floor(roomDef.width / 2) + Math.floor(roomDef.height / 2),
        };
        rotatedLocations.set(newLocation, tileType);
    }
    return { ...roomDef, locations: rotatedLocations };
}

export async function loadLevel(name: string, image: ReturnType<typeof loadImage>): Promise<RoomDefinition> {
    await image.promise;

    const canvas = new OffscreenCanvas(image.bitmap.width, image.bitmap.height);
    const context = canvas.getContext("2d")!;
    context.drawImage(image.bitmap, 0, 0, image.bitmap.width, image.bitmap.height);
    const imageData = context.getImageData(0, 0, image.bitmap.width, image.bitmap.height);
    const locations = new Map<Position, TileType>();
    for (let i = 0; i < imageData.data.length; i += 4) {
        let [r, g, b, _a] = imageData.data.slice(i);
        const x = (i / 4) % imageData.width;
        const y = Math.floor(i / 4 / imageData.width);
        // jesus christ, firefox
        if (r === 1) {
            r = 0;
        }
        if (g === 1) {
            g = 0;
        }
        if (b === 1) {
            b = 0;
        }
        const hex = (r << 16) + (g << 8) + b;
        const tile = getTileTypeForColor(hex);
        if (tile !== undefined) {
            locations.set({ x, y }, tile);
        }
    }

    const roomDef: RoomDefinition = {
        width: imageData.width,
        height: imageData.height,
        locations,
        name,
    };

    levels[name] = roomDef;
    levels[`${name}_rotate`] = { ...rotateRoomDefinition(roomDef), name: `${name}_rotate` };

    return roomDef;
}

function getValidRoomsForDoor(door: ClosedDoor) {
    const validRooms: RoomDefinition[] = [];
    const existingDoors = [...door.myRoom.definition.locations.entries()].filter(
        ([pos, type]) => type === TileType.Door
    );
    for (const level of Object.values(levels)) {
        const doors = [...level.locations.entries()].filter(([pos, type]) => type === TileType.Door);
        let hasMatchingDoors = false;
        switch (door.facing) {
            case Direction.North:
                hasMatchingDoors = existingDoors.some(([loc]) =>
                    doors.some(([otherLoc]) => loc.x === otherLoc.x && otherLoc.y === level.height - 1)
                );
                break;
            case Direction.East:
                hasMatchingDoors = existingDoors.some(([loc]) =>
                    doors.some(([otherLoc]) => loc.y === otherLoc.y && otherLoc.x === 0)
                );
                break;
            case Direction.South:
                hasMatchingDoors = existingDoors.some(([loc]) =>
                    doors.some(([otherLoc]) => loc.x === otherLoc.x && otherLoc.y === 0)
                );
                break;
            case Direction.West:
                hasMatchingDoors = existingDoors.some(([loc]) =>
                    doors.some(([otherLoc]) => loc.y === otherLoc.y && otherLoc.x === level.width - 1)
                );
                break;
        }
        if (hasMatchingDoors) {
            validRooms.push(level);
        }
    }

    return validRooms;
}

export function getRoomToGenerateForDoor(door: ClosedDoor) {
    const validRooms = getValidRoomsForDoor(door);
    return validRooms[Math.floor(Math.random() * validRooms.length)];
}
