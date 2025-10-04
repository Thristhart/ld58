import { Entity } from "../entity";

export class Enemy extends Entity {
    points = 1;
    die() {
        this.gameWorld.addPoint(this.points);
        this.gameWorld.removeEntity(this);
    }
}
