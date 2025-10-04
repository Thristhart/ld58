import { GRID_SQUARE_SIZE } from "#src/constants.ts";
import { Direction, getPositionInDirection } from "#src/direction.ts";
import { Entity, Position } from "../entity";
import { Enemy } from "./enemy";
import { Segment } from "./player";
import { Wall } from "./wall";
import { loadImage } from "#src/images.ts";

import bulletImageUrl from "#src/assets/bullet.png";
import { GameWorld } from "../gameworld";
const bulletImage = loadImage(bulletImageUrl);

export class Bullet extends Entity {
    timeSinceMove = 0;
    timePerMove = 200;
    numEnemyPierce = 0;
    numSegmentPierce = 0;
    bulletSize = 8;

    constructor(position: Position, gameWorld: GameWorld, facing: Direction) {
        super(position, gameWorld, facing);
    }

    moveForward() {
        const nextPosition = getPositionInDirection(this.position, this.facing);
        const entitiesAtPos = this.gameWorld.getEntitiesAt(nextPosition);
        for (const entity of entitiesAtPos) {
            if (entity instanceof Enemy) {
                entity.die();
                if (!this.numEnemyPierce) {
                    this.removeBullet();
                    return;
                } else {
                    this.numEnemyPierce--;
                }
            }
            if (entity instanceof Segment) {
                if (!this.numEnemyPierce) {
                    this.removeBullet();
                    return;
                } else {
                    this.numSegmentPierce--;
                }
            }
            if (entity instanceof Wall) {
                this.removeBullet();
                return;
            }
        }

        this.gameWorld.moveEntity(this, nextPosition);
    }
    removeBullet() {
        this.gameWorld.removeEntity(this);
    }
    think(dt: number): void {
        this.timeSinceMove += dt;
        if (this.timeSinceMove > this.timePerMove) {
            this.timeSinceMove = 0;
            this.moveForward();
        }
    }
    draw(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
        context.drawImage(
            bulletImage,
            this.position.x * GRID_SQUARE_SIZE + (GRID_SQUARE_SIZE - this.bulletSize) / 2,
            this.position.y * GRID_SQUARE_SIZE + (GRID_SQUARE_SIZE - this.bulletSize) / 2,
            this.bulletSize,
            this.bulletSize
        );
    }
}
