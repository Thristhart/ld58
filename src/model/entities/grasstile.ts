import { Direction, getPositionInDirection, reverseDirection } from "#src/direction.ts";
import { getValidWangTile } from "#src/wangtiles.ts";
import { Position } from "../entity";
import { GameWorld } from "../gameworld";
import { TileEntity } from "./tile";
import { loadImage } from "#src/images.ts";

import grassTileImageUrl from "#src/assets/grass_wang_tile.png";
import { GRID_SQUARE_SIZE } from "#src/constants.ts";
const grassTileImage = loadImage(grassTileImageUrl);

export class GrassTile extends TileEntity {
    /* 0 - 15 */
    wangTile: number;
    hasSpread = false;
    constructor(position: Position, gameWorld: GameWorld, wangTile: number) {
        super(position, gameWorld);
        this.wangTile = wangTile;
    }

    think(dt: number): void {
        if (!this.hasSpread) {
            this.spread();
        }
    }

    spread() {
        GrassTile.createGrassTileAtPositionIfNoTiles(this.position, this.gameWorld, this.wangTile, Direction.North);
        GrassTile.createGrassTileAtPositionIfNoTiles(this.position, this.gameWorld, this.wangTile, Direction.East);
        GrassTile.createGrassTileAtPositionIfNoTiles(this.position, this.gameWorld, this.wangTile, Direction.South);
        GrassTile.createGrassTileAtPositionIfNoTiles(this.position, this.gameWorld, this.wangTile, Direction.West);
        this.hasSpread = true;
    }

    draw(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
        context.drawImage(
            grassTileImage.bitmap,
            this.wangTile * 32,
            0,
            32,
            32,
            this.position.x * GRID_SQUARE_SIZE,
            this.position.y * GRID_SQUARE_SIZE,
            GRID_SQUARE_SIZE + 1,
            GRID_SQUARE_SIZE + 1
        );
    }

    static createGrassTileAtPositionIfNoTiles(
        fromPosition: Position,
        gameWorld: GameWorld,
        baseWangTile: number,
        direction: Direction
    ) {
        const targetPosition = getPositionInDirection(fromPosition, direction);
        const entities = gameWorld.getEntitiesAt(targetPosition);
        if (![...entities].some((e) => e instanceof TileEntity)) {
            const neighbors: { wangIndex: number; direction: Direction }[] = [{ wangIndex: baseWangTile, direction }];
            [Direction.North, Direction.East, Direction.South, Direction.West].map((dir) => {
                const neighborPosition = getPositionInDirection(targetPosition, dir);
                const neighborEntities = gameWorld.getEntitiesAt(neighborPosition);
                const grassTileNeighbor = [...neighborEntities].find((n) => n instanceof GrassTile);
                if (grassTileNeighbor) {
                    neighbors.push({ wangIndex: grassTileNeighbor.wangTile, direction: reverseDirection(dir) });
                }
            });
            const newWangIndex = getValidWangTile(neighbors);
            const newTile = new GrassTile(targetPosition, gameWorld, newWangIndex);
            gameWorld.addEntity(newTile);
        }
    }
}
