import wingedEnemyUrl from "#src/assets/salamander_food.png";
import { chomp } from "#src/audio.ts";
import { GRID_SQUARE_SIZE } from "#src/constants.ts";
import { arePositionsEqual, getPositionInDirection, getRandomDirection, reverseDirection } from "#src/direction.ts";
import { loadImage } from "#src/images.ts";
import { Bullet } from "./bullet";
import { OpenDoor } from "./door";
import { Enemy } from "./enemy";
import { Player, Segment } from "./player";
import { Wall } from "./wall";
const wingedEnemyImage = loadImage(wingedEnemyUrl);

export class WingedEnemy extends Enemy {
    timeSinceMove = 0;
    timePerMove = 400;

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
                        chomp();
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
