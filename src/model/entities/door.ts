import closedDoorImageUrl from "#src/assets/door_closed.png";
import openDoorImageUrl from "#src/assets/door_open.png";
import { drawDoorText, drawRotatedImage } from "#src/drawRotatedImage.ts";
import { loadImage } from "#src/images.ts";
import { Position } from "../entity";
import { TileEntity } from "./tile";
import { Wall } from "./wall";
import { GameWorld } from "../gameworld";
import { Direction } from "../../direction";

const openDoorImage = loadImage(openDoorImageUrl);
const closedDoorImage = loadImage(closedDoorImageUrl);

export class OpenDoor extends TileEntity {
    draw(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
        drawRotatedImage(context, openDoorImage.bitmap, this.position, (Math.PI / 2) * this.facing);
    }
}
export class ClosedDoor extends Wall {
    openRequirements: number;

    constructor(
        position: Position,
        gameWorld: GameWorld,
        openRequirements: number,
        facing: Direction = Direction.North
    ) {
        super(position, gameWorld, facing);
        this.openRequirements = openRequirements;
    }

    draw(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
        drawRotatedImage(context, closedDoorImage.bitmap, this.position, (Math.PI / 2) * this.facing);
        drawDoorText(context, this.position, this.openRequirements.toString());
    }

    think(dt: number) {
        if (this.gameWorld.player.otherSegments.length + 1 > this.openRequirements) {
            this.gameWorld.addEntity(this.makeOpen());
            this.gameWorld.removeEntity(this);
        }
    }

    makeOpen() {
        return new OpenDoor(this.position, this.gameWorld, this.facing);
    }
}
