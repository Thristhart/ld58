import { GRID_SQUARE_SIZE } from "./constants";
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
