import { loadImage } from "#src/images.ts";
import { Entity, Position } from "../entity";
import {
    Direction,
    getDirectionBetweenTwoPositions,
    getPositionInDirection,
    getRelativeDirectionBetweenTwoDirections,
    perpendicularDirection,
    RelativeDirection,
    reverseDirection,
    reversePerpendicularDirection,
} from "#src/direction.ts";
import { GameWorld } from "../gameworld";
import { drawRotatedImage } from "#src/drawRotatedImage.ts";
import { Pickup } from "./pickup";

import headImageUrl from "#src/assets/snake/head.png";
const headImage = loadImage(headImageUrl);
import segmentStraightImageUrl from "#src/assets/snake/segment_straight.png";
const segmentStraightImage = loadImage(segmentStraightImageUrl);
import segmentCurveImageUrl from "#src/assets/snake/segment_curve.png";
const segmentCurveImage = loadImage(segmentCurveImageUrl);
import segmentTailImageUrl from "#src/assets/snake/tail.png";
import { Wall } from "./wall";
import { Buzzsaw } from "./buzzsaw";
import { Bullet } from "./bullet";
import { Upgrade, UpgradeType } from "./upgrade";
import { Enemy } from "./enemy";
const segmentTailImage = loadImage(segmentTailImageUrl);

enum AmmoType {
    None = "None",
    Basic = "Basic",
    Dual = "Dual",
}

enum SegmentType {
    Head = "Head",
    Straight = "Straight",
    LeftCurve = "LeftCurve",
    RightCurve = "RightCurve",
    Tail = "Tail",
}
export class Segment extends Entity {
    segmentType: SegmentType = SegmentType.Straight;
    ammoType: AmmoType = AmmoType.Basic;
    timeSinceBullet = 0;
    timePerBullet = 1000;

    constructor(position: Position, gameWorld: GameWorld, facing: Direction, ammoType: AmmoType) {
        super(position, gameWorld, facing);
        this.ammoType = ammoType;
    }

    die() {
        // a segment died... disconnect everything behind it
        const myIndexInPlayer = this.gameWorld.player.otherSegments.indexOf(this);
        if (myIndexInPlayer != -1) {
            this.gameWorld.player.otherSegments.splice(myIndexInPlayer);
        }
        this.gameWorld.removeEntity(this);
    }

    think(dt: number): void {
        this.timeSinceBullet += dt;
        if (this.timeSinceBullet > this.timePerBullet) {
            this.timeSinceBullet = 0;
            this.addBullet();
        }
    }

    addBullet() {
        if (this.segmentType === SegmentType.Head || this.segmentType === SegmentType.Tail) return;

        if (this.ammoType === AmmoType.Basic || this.ammoType === AmmoType.Dual) {
            const bulletDirection = perpendicularDirection(this.facing);
            const newPosition = getPositionInDirection(this.position, bulletDirection);
            const bullet = new Bullet(newPosition, this.gameWorld, bulletDirection);
            this.gameWorld.addEntity(bullet);
        }

        if (this.ammoType === AmmoType.Dual) {
            const bulletDirection = reversePerpendicularDirection(this.facing);
            const newPosition = getPositionInDirection(this.position, bulletDirection);
            const bullet = new Bullet(newPosition, this.gameWorld, bulletDirection);
            this.gameWorld.addEntity(bullet);
        }
    }

    draw(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
        if (this.segmentType === SegmentType.Head) {
            drawRotatedImage(context, headImage.bitmap, this.position, (Math.PI / 2) * this.facing);
        } else if (this.segmentType === SegmentType.Straight) {
            drawRotatedImage(context, segmentStraightImage.bitmap, this.position, (Math.PI / 2) * this.facing);
        } else if (this.segmentType === SegmentType.LeftCurve) {
            drawRotatedImage(context, segmentCurveImage.bitmap, this.position, (Math.PI / 2) * (this.facing - 1));
        } else if (this.segmentType === SegmentType.RightCurve) {
            let direction = this.facing - 1;
            if (this.facing === Direction.East) {
                direction -= 2;
            }
            if (this.facing === Direction.West) {
                direction -= 2;
            }
            drawRotatedImage(context, segmentCurveImage.bitmap, this.position, (Math.PI / 2) * direction, true);
        } else if (this.segmentType === SegmentType.Tail) {
            drawRotatedImage(context, segmentTailImage.bitmap, this.position, (Math.PI / 2) * this.facing);
        }
    }
}

export class Player extends Segment {
    otherSegments: Segment[];

    constructor(position: Position, gameWorld: GameWorld, facing: Direction) {
        super(position, gameWorld, facing, AmmoType.None);
        this.otherSegments = [];
        this.segmentType = SegmentType.Head;
    }

    die() {
        this.gameWorld.setGameState("isPaused", true);
        this.gameWorld.setGameState("dead", true);
    }
    addSegment(upgradeType?: UpgradeType) {
        let lastSegment;
        if (this.otherSegments.length > 0) {
            lastSegment = this.otherSegments[this.otherSegments.length - 1];
            lastSegment.segmentType = SegmentType.Straight;
        } else {
            lastSegment = this;
        }
        const newPosition = getPositionInDirection(lastSegment.position, reverseDirection(lastSegment.facing));

        let ammoType = AmmoType.Basic;
        if (upgradeType === UpgradeType.DualAmmo) {
            ammoType = AmmoType.Dual;
        }
        const newSegment = new Segment(newPosition, this.gameWorld, lastSegment.facing, ammoType);
        this.otherSegments.push(newSegment);
        this.gameWorld.addEntity(newSegment);
        newSegment.segmentType = SegmentType.Tail;
    }
    tryMove(direction: Direction) {
        const nextPosition = getPositionInDirection(this.position, direction);

        const entitiesAtPos = this.gameWorld.getEntitiesAt(nextPosition);
        for (const entity of entitiesAtPos) {
            if (entity instanceof Pickup) {
                entity.consume(this);
                this.gameWorld.removeEntity(entity);
            } else if (entity instanceof Upgrade) {
                entity.consume(this);
                this.gameWorld.removeEntity(entity);
            } else if (entity instanceof Enemy) {
                this.die();
            } else if (entity instanceof Segment || entity instanceof Wall) {
                if (!(entity === this.gameWorld.player.otherSegments.at(-1))) {
                    if (this.gameWorld.getGameState("dying") || this.facing !== direction) {
                        this.die();
                    } else {
                        this.gameWorld.setGameState("dying", true);
                        return;
                    }
                }
            }
        }

        this.gameWorld.setGameState("dying", false);
        let lastPosition = nextPosition;
        let nextType = SegmentType.Head;

        const currentRoom = this.gameWorld.getRoomContainingPosition(this.position);
        const nextRoom = this.gameWorld.getRoomContainingPosition(nextPosition);
        if (currentRoom?.id !== nextRoom?.id && nextRoom?.id !== undefined) {
            this.gameWorld.setGameState("roomsVisited", this.gameWorld.getGameState("roomsVisited").add(nextRoom.id));
            this.gameWorld.setGameState("currentRoom", nextRoom);
        }

        const segments = [this, ...this.otherSegments];
        for (const segment of segments) {
            const next = lastPosition;
            const newFacing = getDirectionBetweenTwoPositions(segment.position, next);
            const relativeDirection = getRelativeDirectionBetweenTwoDirections(segment.facing, newFacing);
            segment.segmentType = nextType;
            if (relativeDirection === RelativeDirection.Left) {
                nextType = SegmentType.LeftCurve;
            } else if (relativeDirection === RelativeDirection.Right) {
                nextType = SegmentType.RightCurve;
            } else {
                nextType = SegmentType.Straight;
            }

            segment.facing = newFacing;
            lastPosition = { ...segment.position };
            this.gameWorld.moveEntity(segment, next);
        }
        if (segments.length > 1) {
            const tail = segments[segments.length - 1];
            const beforeTail = segments[segments.length - 2];
            tail.segmentType = SegmentType.Tail;
            tail.facing = beforeTail.facing;
        }
    }
}
