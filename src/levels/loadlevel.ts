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

export function rotateRoomDefinition(roomDef: RoomDefinition) {
    const rotatedLocations = new Map<Position, TileType>();
    for (const [location, tileType] of roomDef.locations) {
        rotatedLocations.set({ x: location.y, y: location.x }, tileType);
    }
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
    };

    levels[name] = roomDef;

    return roomDef;
}
