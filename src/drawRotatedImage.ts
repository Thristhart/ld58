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
    context.drawImage(image, -GRID_SQUARE_SIZE / 2, -GRID_SQUARE_SIZE / 2, GRID_SQUARE_SIZE, GRID_SQUARE_SIZE);
    context.restore();
}

export function drawDoorText(context: CanvasRenderingContext2D, position: Position, text: string) {
    context.save();
    context.translate(
        position.x * GRID_SQUARE_SIZE + GRID_SQUARE_SIZE / 2,
        position.y * GRID_SQUARE_SIZE + GRID_SQUARE_SIZE / 2
    );
    context.fillStyle = "black";
    context.font = "bold 48px serif";
    const textWidth = context.measureText(text).width;
    context.fillText(text, -(textWidth / 2), GRID_SQUARE_SIZE / 2 - DOOR_PADDING, GRID_SQUARE_SIZE - DOOR_PADDING * 2);
    context.restore();
}
