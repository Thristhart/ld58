import { GRID_SQUARE_SIZE, DOOR_PADDING } from "./constants";
import { Position } from "./model/entity";

export function drawRotatedImage(
    context: CanvasRenderingContext2D,
    image: CanvasImageSource,
    position: Position,
    angle: number,
    flip?: boolean
) {
    context.save();
    context.translate(
        position.x * GRID_SQUARE_SIZE + GRID_SQUARE_SIZE / 2,
        position.y * GRID_SQUARE_SIZE + GRID_SQUARE_SIZE / 2
    );
    if (flip) {
        context.scale(-1, 1);
    }
    context.rotate(angle);
    context.drawImage(image, -GRID_SQUARE_SIZE / 2, -GRID_SQUARE_SIZE / 2, GRID_SQUARE_SIZE + 1, GRID_SQUARE_SIZE + 1);
    context.restore();
}
export function drawRotatedImageOffGrid(
    context: CanvasRenderingContext2D,
    image: CanvasImageSource,
    position: Position,
    width: number,
    height: number,
    angle: number,
    flip?: boolean
) {
    context.save();
    context.translate(position.x, position.y);
    if (flip) {
        context.scale(-1, 1);
    }
    context.rotate(angle);
    context.drawImage(image, -width / 2, -height / 2, width, height);
    context.restore();
}

export function drawDoorText(context: CanvasRenderingContext2D, position: Position, angle: number, text: string) {
    context.save();
    context.translate(
        position.x * GRID_SQUARE_SIZE + GRID_SQUARE_SIZE / 2,
        position.y * GRID_SQUARE_SIZE + GRID_SQUARE_SIZE / 2
    );
    context.rotate(angle);
    context.fillStyle = "white";
    context.font = "bold 36px Germania One";
    const textWidth = context.measureText(text).width;
    context.fillText(text, -(textWidth / 2), GRID_SQUARE_SIZE / 2 - DOOR_PADDING);
    context.restore();
}
