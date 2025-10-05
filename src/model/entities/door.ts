import closedDoorImageUrl from "#src/assets/door_closed.png";
import openDoorImageUrl from "#src/assets/door_open.png";
import { drawDoorText, drawRotatedImage } from "#src/drawRotatedImage.ts";
import { loadImage } from "#src/images.ts";
import { Position } from "../entity";
import { TileEntity } from "./tile";
import { Wall } from "./wall";
import { GameWorld } from "../gameworld";
import { Direction, getPositionInDirection } from "../../direction";
import { RoomInstance } from "../room";
import { getRoomToGenerateForDoor, levels } from "#src/levels/loadlevel.ts";

const openDoorImage = loadImage(openDoorImageUrl);
const closedDoorImage = loadImage(closedDoorImageUrl);

export class OpenDoor extends TileEntity {
    draw(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
        drawRotatedImage(context, openDoorImage.bitmap, this.position, (Math.PI / 2) * this.facing);
    }
}
export class ClosedDoor extends Wall {
    openRequirements: number;
    myRoom: RoomInstance;
    createdNextRoom: boolean = false;

    constructor(
        position: Position,
        gameWorld: GameWorld,
        openRequirements: number,
        myRoom: RoomInstance,
        facing: Direction = Direction.North
    ) {
        super(position, gameWorld, facing);
        this.myRoom = myRoom;
        this.openRequirements = openRequirements;
    }

    draw(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
        drawRotatedImage(context, closedDoorImage.bitmap, this.position, (Math.PI / 2) * this.facing);
        drawDoorText(
            context,
            this.position,
            (this.openRequirements - this.gameWorld.player.otherSegments.length).toString()
        );
    }

    think(dt: number) {
        if (this.gameWorld.player.otherSegments.length + 1 > this.openRequirements && !this.createdNextRoom) {
            const pointInNewRoom = getPositionInDirection(this.position, this.facing);
            if (!this.gameWorld.getRoomContainingPosition(pointInNewRoom)) {
                const newRoom = getRoomToGenerateForDoor(this);
                let newRoomPosition: Position;
                switch (this.facing) {
                    case Direction.North:
                        newRoomPosition = { x: this.myRoom.position.x, y: this.myRoom.position.y - newRoom.height + 1 };
                        break;
                    case Direction.East:
                        newRoomPosition = {
                            x: this.myRoom.position.x + this.myRoom.definition.width - 1,
                            y: this.myRoom.position.y,
                        };
                        break;
                    case Direction.South:
                        newRoomPosition = {
                            x: this.myRoom.position.x,
                            y: this.myRoom.position.y + this.myRoom.definition.height - 1,
                        };
                        break;
                    case Direction.West:
                        newRoomPosition = { x: this.myRoom.position.x - newRoom.width + 1, y: this.myRoom.position.y };
                        break;
                }
                this.gameWorld.createRoom(newRoom, newRoomPosition);
            }
            this.createdNextRoom = true;

            this.gameWorld.addEntity(this.makeOpen());
            this.gameWorld.removeEntity(this);
        }
    }

    makeOpen() {
        return new OpenDoor(this.position, this.gameWorld, this.facing);
    }
}
