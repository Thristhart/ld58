import { arePositionsEqual, getPositionInDirection, getRandomDirection, reverseDirection } from "#src/direction.ts";
import { Enemy } from "./enemy";
import { Wall } from "./wall";
import { loadImage } from "#src/images.ts";

import wingedEnemyUrl from "#src/assets/salamander_food.png";
import { drawRotatedImage } from "#src/drawRotatedImage.ts";
import { Player, Segment } from "./player";
import { GRID_SQUARE_SIZE } from "#src/constants.ts";
import { OpenDoor } from "./door";
import { Bullet } from "./bullet";
const wingedEnemyImage = loadImage(wingedEnemyUrl);

export class WingedEnemy extends Enemy {
    timeSinceMove = 0;
    timePerMove = 200;

    moveForward() {
        const nextPosition = getPositionInDirection(this.position, this.facing);
        const entitiesAtPos = this.gameWorld.getEntitiesAt(nextPosition);
        for (const entity of entitiesAtPos) {
            if (entity instanceof Wall || entity instanceof OpenDoor) {
                this.facing = reverseDirection(this.facing);
                return;
            }
            if (entity instanceof Segment) {
                if (entity.segmentType === "Head") {
                    // they're eating me
                    if (arePositionsEqual(this.position, getPositionInDirection(entity.position, entity.facing))) {
                        this.die();
                        (entity as Player).addSegment();
                        return;
                    } else {
                        // bonk
                        entity.die();
                    }
                } else {
                    entity.die();
                }
            }
            if (entity instanceof Bullet) {
                this.die();
                if (!entity.numEnemyPierce) {
                    entity.removeBullet();
                    return;
                } else {
                    entity.numEnemyPierce--;
                }
            }
            if (entity instanceof Enemy) {
                this.facing = getRandomDirection();
            }
        }

        this.gameWorld.moveEntity(this, nextPosition);
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
            wingedEnemyImage,
            this.position.x * GRID_SQUARE_SIZE,
            this.position.y * GRID_SQUARE_SIZE,
            GRID_SQUARE_SIZE,
            GRID_SQUARE_SIZE
        );
    }
}
