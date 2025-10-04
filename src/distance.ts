import { Position } from "./model/entity";

export function getRandomPositionNear(position: Position, distanceInner: number, distanceOuter: number) {
    const deltaDistance = distanceOuter - distanceInner;
    let deltaX = Math.floor(Math.random() * deltaDistance * 2) - deltaDistance;
    let deltaY = Math.floor(Math.random() * deltaDistance * 2) - deltaDistance;
    if (deltaX > 0) {
        deltaX += distanceInner;
    } else {
        deltaX -= distanceInner;
    }

    if (deltaY > 0) {
        deltaY += distanceInner;
    } else {
        deltaY -= distanceInner;
    }
    return { x: position.x + deltaX, y: position.y + deltaY };
}
