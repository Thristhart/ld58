import { loadImage } from "#src/images.ts";
import { Position } from "#src/model/entity.ts";
import { RoomDefinition, TileType } from "#src/model/room.ts";
import { ClosedDoor } from "#src/model/entities/door.ts";
import { Direction } from "#src/direction.ts";

/*
TODO:
corners up
corners out
boxes1
corners in
corners mixed
boxes 2
*/

import basic from "./basic.png";
import basketball from "./basketball.png";
import boxes1 from "./boxes1.png";
import boxes2 from "./boxes2.png";
import c_shape from "./c_shape.png";
import canyon_1 from "./canyon_1.png";
import corners_in from "./corners_in.png";
import corners_mixes from "./corners_mixes.png";
import corners_out from "./corners_out.png";
import corners_up from "./corners_up.png";
import cubbies from "./cubbies.png";
import equalsmore from "./equalsmore.png";
import letmein from "./letmein.png";
import LL from "./LL.png";
import plus from "./plus.png";
import zoo from "./zoo.png";

export const levelLoadPromise = Promise.all([
    loadLevel("basic", loadImage(basic)),
    loadLevel("basketball", loadImage(basketball)),
    loadLevel("boxes1", loadImage(boxes1)),
    loadLevel("boxes2", loadImage(boxes2)),
    loadLevel("c_shape", loadImage(c_shape)),
    loadLevel("canyon_1", loadImage(canyon_1)),
    loadLevel("corners_in", loadImage(corners_in)),
    loadLevel("corners_mixes", loadImage(corners_mixes)),
    loadLevel("corners_out", loadImage(corners_out)),
    loadLevel("corners_up", loadImage(corners_up)),
    loadLevel("cubbies", loadImage(cubbies)),
    loadLevel("equalsmore", loadImage(equalsmore)),
    loadLevel("letmein", loadImage(letmein)),
    loadLevel("LL", loadImage(LL)),
    loadLevel("plus", loadImage(plus)),
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
        case 0xffff00:
            return TileType.ForceEnemy;
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
        // jesus christ, firefox!
        if (r < 128) {
            r = 0;
        } else {
            r = 255;
        }
        if (g < 128) {
            g = 0;
        } else {
            g = 255;
        }
        if (b < 128) {
            b = 0;
        } else {
            b = 255;
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
