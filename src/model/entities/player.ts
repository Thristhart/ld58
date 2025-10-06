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
import { drawRotatedImage } from "#src/drawRotatedImage.ts";
import { loadImage } from "#src/images.ts";
import { Entity, Position } from "../entity";
import { GameWorld } from "../gameworld";
import { Pickup } from "./pickup";

import headImageUrl from "#src/assets/snake/head.png";
import segmentCurveImageUrl from "#src/assets/snake/segment_curve.png";
import segmentStraightImageUrl from "#src/assets/snake/segment_straight.png";
import segmentTailImageUrl from "#src/assets/snake/tail.png";
import fleshHeadImageUrl from "#src/assets/snake/flesh_head.png";
import fleshSegmentCurveImageUrl from "#src/assets/snake/flesh_segment_curve.png";
import fleshSegmentStraightImageUrl from "#src/assets/snake/flesh_segment_straight.png";
import fleshSegmentTailImageUrl from "#src/assets/snake/flesh_tail.png";
import { Bullet } from "./bullet";
import { Enemy } from "./enemy";
import { Upgrade, UpgradeType } from "./upgrade";
import { Wall } from "./wall";
import { bgm, chomp, cuteAnimalDie } from "#src/audio.ts";
const headImage = loadImage(headImageUrl);
const segmentStraightImage = loadImage(segmentStraightImageUrl);
const segmentCurveImage = loadImage(segmentCurveImageUrl);
const segmentTailImage = loadImage(segmentTailImageUrl);
const fleshHeadImage = loadImage(fleshHeadImageUrl);
const fleshSegmentCurveImage = loadImage(fleshSegmentCurveImageUrl);
const fleshSegmentStraightImage = loadImage(fleshSegmentStraightImageUrl);
const fleshSegmentTailImage = loadImage(fleshSegmentTailImageUrl);

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
    parent: Player | undefined;
    segmentType: SegmentType = SegmentType.Straight;
    ammoType: AmmoType = AmmoType.Basic;
    fireBulletAfter = 0;

    constructor(position: Position, gameWorld: GameWorld, facing: Direction, ammoType: AmmoType) {
        super(position, gameWorld, facing);
        this.ammoType = ammoType;
    }

    die() {
        // a segment died... disconnect everything behind it
        const myIndexInPlayer = this.gameWorld.player.otherSegments.indexOf(this);
        if (myIndexInPlayer != -1) {
            const disconnected = this.gameWorld.player.otherSegments.splice(myIndexInPlayer);
            disconnected.forEach((segment) => (segment.parent = undefined));
        }
        this.gameWorld.removeEntity(this);
    }

    think(dt: number): void {
        if (this.fireBulletAfter > 0) {
            this.fireBulletAfter -= dt;
            if (this.fireBulletAfter <= 0) {
                this.addBullet();
            }
        }
    }

    addBullet() {
        if (this.segmentType === SegmentType.Head || this.segmentType === SegmentType.Tail) return;

        if (this.ammoType === AmmoType.Basic || this.ammoType === AmmoType.Dual) {
            const bulletDirection = perpendicularDirection(this.facing);
            const newPosition = getPositionInDirection(this.position, bulletDirection);
            if (this.gameWorld.isPositionEmpty(newPosition, Enemy)) {
                const bullet = new Bullet(this.position, this.gameWorld, bulletDirection, this);
                this.gameWorld.addEntity(bullet);
            }
        }

        if (this.ammoType === AmmoType.Dual) {
            const bulletDirection = reversePerpendicularDirection(this.facing);
            const newPosition = getPositionInDirection(this.position, bulletDirection);
            if (this.gameWorld.isPositionEmpty(newPosition, Enemy)) {
                const bullet = new Bullet(this.position, this.gameWorld, bulletDirection, this);
                this.gameWorld.addEntity(bullet);
            }
        }
    }

    draw(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
        let segmentCountForFlesh = this.parent?.otherSegments.length ?? 0;

        const fleshPercentage = Math.min(1, Math.max(segmentCountForFlesh - 25, 0) / 10);
        if (this.segmentType === SegmentType.Head) {
            context.globalAlpha = fleshPercentage;
            drawRotatedImage(context, fleshHeadImage.bitmap, this.position, (Math.PI / 2) * this.facing);

            context.globalAlpha = 1 - fleshPercentage;
            drawRotatedImage(context, headImage.bitmap, this.position, (Math.PI / 2) * this.facing);
        } else if (this.segmentType === SegmentType.Straight) {
            context.globalAlpha = fleshPercentage;
            drawRotatedImage(context, fleshSegmentStraightImage.bitmap, this.position, (Math.PI / 2) * this.facing);

            context.globalAlpha = 1 - fleshPercentage;
            drawRotatedImage(context, segmentStraightImage.bitmap, this.position, (Math.PI / 2) * this.facing);
        } else if (this.segmentType === SegmentType.LeftCurve) {
            context.globalAlpha = fleshPercentage;
            drawRotatedImage(context, fleshSegmentCurveImage.bitmap, this.position, (Math.PI / 2) * (this.facing - 1));

            context.globalAlpha = 1 - fleshPercentage;
            drawRotatedImage(context, segmentCurveImage.bitmap, this.position, (Math.PI / 2) * (this.facing - 1));
        } else if (this.segmentType === SegmentType.RightCurve) {
            let direction = this.facing - 1;
            if (this.facing === Direction.East) {
                direction -= 2;
            }
            if (this.facing === Direction.West) {
                direction -= 2;
            }
            context.globalAlpha = fleshPercentage;
            drawRotatedImage(context, fleshSegmentCurveImage.bitmap, this.position, (Math.PI / 2) * direction, true);

            context.globalAlpha = 1 - fleshPercentage;
            drawRotatedImage(context, segmentCurveImage.bitmap, this.position, (Math.PI / 2) * direction, true);
        } else if (this.segmentType === SegmentType.Tail) {
            context.globalAlpha = fleshPercentage;
            drawRotatedImage(context, fleshSegmentTailImage.bitmap, this.position, (Math.PI / 2) * this.facing);

            context.globalAlpha = 1 - fleshPercentage;
            drawRotatedImage(context, segmentTailImage.bitmap, this.position, (Math.PI / 2) * this.facing);
        }
        context.globalAlpha = 1;
    }
}

export class Player extends Segment {
    otherSegments: Segment[];
    timeSinceBullet = 0;
    timePerBullet = 1000;

    constructor(position: Position, gameWorld: GameWorld, facing: Direction) {
        super(position, gameWorld, facing, AmmoType.None);
        this.otherSegments = [];
        this.segmentType = SegmentType.Head;
        this.parent = this;
    }

    die() {
        this.gameWorld.setGameState("isPaused", true);
        this.gameWorld.setGameState("dead", true);
        bgm.stop();
    }

    think(dt: number): void {
        // this.timeSinceBullet += dt;
        // if (this.timeSinceBullet > this.timePerBullet) {
        //     this.timeSinceBullet = 0;
        //     this.otherSegments.forEach((segment, index) => {
        //         if (segment.segmentType !== SegmentType.Tail) {
        //             segment.fireBulletAfter = index * 3;
        //         }
        //     });
        // }
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
        newSegment.parent = this;
        this.otherSegments.push(newSegment);
        this.gameWorld.addEntity(newSegment);
        newSegment.segmentType = SegmentType.Tail;
    }
    tryMove(direction: Direction) {
        let isMovingRooms = false;
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
                // eating you
                entity.die();
                chomp();
                cuteAnimalDie();
                this.addSegment();
            } else if (entity instanceof Segment || entity instanceof Wall) {
                if (!(entity === this.gameWorld.player.otherSegments.at(-1))) {
                    if (this.gameWorld.getGameState("dying") || this.facing !== direction) {
                        this.die();
                    } else {
                        this.gameWorld.setGameState("dying", true);
                        return isMovingRooms;
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
            isMovingRooms = true;
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

        if (this.gameWorld.getGameState("dead")) {
            throw 322;
        }
        return isMovingRooms;
    }
}
