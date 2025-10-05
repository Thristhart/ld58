import { GRID_SQUARE_SIZE } from "#src/constants.ts";
import { Direction, getPositionInDirection } from "#src/direction.ts";
import { Entity, Position } from "../entity";
import { Enemy } from "./enemy";
import { Segment } from "./player";
import { Wall } from "./wall";
import { loadImage } from "#src/images.ts";

import bulletImageUrl from "#src/assets/bullet.png";
import { GameWorld } from "../gameworld";
import { add, getDirectionAngle, getVectorFromDirection, scale, Vector } from "#src/vector.ts";
import { drawRotatedImageOffGrid } from "#src/drawRotatedImage.ts";
const bulletImage = loadImage(bulletImageUrl);

export class Bullet extends Entity {
    numEnemyPierce = 0;
    numSegmentPierce = 0;
    bulletSize = 12;
    segmentPierceCooldown = 150;

    // in pixels-per-millisecond
    speed = 1;
    velocity: Vector;
    bulletPosition: Vector;
    emitter: Entity;

    constructor(position: Position, gameWorld: GameWorld, facing: Direction, emitter: Entity) {
        super(position, gameWorld, facing);
        this.velocity = getVectorFromDirection(facing);
        this.bulletPosition = scale(this.position, GRID_SQUARE_SIZE);
        this.emitter = emitter;
    }

    moveForward(dt: number) {
        this.bulletPosition = add(this.bulletPosition, scale(this.velocity, dt * this.speed));

        const nextPosition = {
            x: Math.round(this.bulletPosition.x / GRID_SQUARE_SIZE),
            y: Math.round(this.bulletPosition.y / GRID_SQUARE_SIZE),
        };
        const entitiesAtPos = this.gameWorld.getEntitiesAt(nextPosition);
        for (const entity of entitiesAtPos) {
            if (entity === this.emitter) {
                continue;
            }
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
                if (this.segmentPierceCooldown > 0) {
                    continue;
                }
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
        if (this.segmentPierceCooldown > 0) {
            this.segmentPierceCooldown -= dt;
        }
        this.moveForward(dt);
    }
    draw(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
        drawRotatedImageOffGrid(
            context,
            bulletImage.bitmap,
            {
                x: this.bulletPosition.x + (GRID_SQUARE_SIZE - this.bulletSize) / 2,
                y: this.bulletPosition.y + (GRID_SQUARE_SIZE - this.bulletSize * 2) / 2,
            },
            this.bulletSize,
            this.bulletSize * 2,
            getDirectionAngle(this.velocity) - Math.PI / 2
        );
    }
}
