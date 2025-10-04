import { Entity } from "../entity";

export class Enemy extends Entity {
    die() {
        this.gameWorld.addPoint(1);
        this.gameWorld.removeEntity(this);
    }
}
