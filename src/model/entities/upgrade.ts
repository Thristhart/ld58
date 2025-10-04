import { Player } from "./player";
import { Entity, Position } from "../entity";
import { Pickup } from "./pickup";
import { loadImage } from "#src/images.ts";

import dualUpgradeUrl from "#src/assets/dual_upgrade.png";
import { GRID_SQUARE_SIZE } from "#src/constants.ts";
import { GameWorld } from "../gameworld";
const dualUpgrade = loadImage(dualUpgradeUrl);

export enum UpgradeType {
    DualAmmo = "DualAmmo",
}

export class Upgrade extends Entity {
    upgradeType = UpgradeType.DualAmmo;
    timeoutCount = 0;
    upgradeTimeout = 10000;

    constructor(pos: Position, gameWorld: GameWorld, upgradeType: UpgradeType) {
        super(pos, gameWorld);
        this.upgradeType = upgradeType;
    }

    think(dt: number): void {
        this.timeoutCount += dt;
        if (this.timeoutCount > this.upgradeTimeout) {
            this.gameWorld.removeEntity(this);
        }
    }
    consume(consumer: Entity) {
        if (consumer instanceof Player) {
            consumer.addSegment(this.upgradeType);
        }
    }
    draw(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
        context.drawImage(
            dualUpgrade,
            this.position.x * GRID_SQUARE_SIZE,
            this.position.y * GRID_SQUARE_SIZE,
            GRID_SQUARE_SIZE,
            GRID_SQUARE_SIZE
        );
    }
}
