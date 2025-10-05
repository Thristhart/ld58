import { loadImage } from "#src/images.ts";
import { Position } from "#src/model/entity.ts";
import { RoomDefinition, TileType } from "#src/model/room.ts";
import basicLevelUrl from "./basic.png";

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

export async function loadLevel(name: string, image: ReturnType<typeof loadImage>): Promise<RoomDefinition> {
    await image.promise;

    const canvas = new OffscreenCanvas(image.bitmap.width, image.bitmap.height);
    const context = canvas.getContext("2d")!;
    context.drawImage(image.bitmap, 0, 0, image.bitmap.width, image.bitmap.height);
    const imageData = context.getImageData(0, 0, image.bitmap.width, image.bitmap.height);
    const locations = new Map<Position, TileType>();
    for (let i = 0; i < imageData.data.length; i += 4) {
        const [r, g, b, _a] = imageData.data.slice(i);
        const x = (i / 4) % imageData.width;
        const y = Math.floor(i / 4 / imageData.width);
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

export const levelLoadPromise = Promise.all([loadLevel("basic", loadImage(basicLevelUrl))]);
