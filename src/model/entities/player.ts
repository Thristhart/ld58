import { Entity, EntityDirection, Position } from "../entity";

export class Segment extends Entity {
    constructor(position: Position, facing: EntityDirection) {
        super(position, facing);
    }
}

export class Player extends Segment {
    otherSegments: Entity[];

    constructor(position: Position, facing: EntityDirection) {
        super(position, facing);
        this.otherSegments = [];
    }

    addSegment() {
        let lastSegment;
        if (this.otherSegments.length > 0) {
            lastSegment = this.otherSegments[this.otherSegments.length - 1];
        } else {
            lastSegment = this;
        }
        let newPosition;
        switch (lastSegment.facing) {
            case EntityDirection.North:
                newPosition = { x: lastSegment.position.x, y: lastSegment.position.y - 1 };
                break;
            case EntityDirection.East:
                newPosition = { x: lastSegment.position.x - 1, y: lastSegment.position.y };
                break;
            case EntityDirection.South:
                newPosition = { x: lastSegment.position.x, y: lastSegment.position.y + 1 };
                break;
            case EntityDirection.West:
                newPosition = { x: lastSegment.position.x + 1, y: lastSegment.position.y - 1 };
                break;
        }
        const newSegment = new Segment(lastSegment.position, lastSegment.facing);
        this.otherSegments.push(newSegment);
        //TODO: access gameworld from here and add the new segment.
    }
}
