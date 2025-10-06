import { useEffect, useRef } from "react";
import { GameWorld } from "../model/gameworld";
import { tickFrame } from "../render";
import { TileType } from "../model/room";
import { ClosedDoor } from "../model/entities/door";
import { Segment } from "../model/entities/player";
import { Wall } from "../model/entities/wall";

function useFitCanvasToContainer(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }
        const canvas = canvasRef.current;
        const parentRect = canvas.parentElement?.getBoundingClientRect();
        canvas.width = parentRect?.width || 0;
        canvas.height = parentRect?.height || 0;

        const resizeObserver = new ResizeObserver(() => {
            const parentRect = canvas.parentElement?.getBoundingClientRect();
            canvas.width = parentRect?.width || 0;
            canvas.height = parentRect?.height || 0;
        });
        if (canvas.parentElement) {
            resizeObserver.observe(canvas.parentElement);
        }

        const onResize = () => {
            const parentRect = canvas.parentElement?.getBoundingClientRect();
            canvas.width = parentRect?.width || 0;
            canvas.height = parentRect?.height || 0;
        };
        window.addEventListener("resize", onResize, { passive: true });
        return () => {
            window.removeEventListener("resize", onResize);
            resizeObserver.disconnect();
        };
    }, []);
}

const minimapCamera = { x: 0, y: 0, scale: 1 };

const MINIMAP_GRID_SQUARE_SIZE = 10;

function drawMinimap(dt: number, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, gameWorld: GameWorld) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    const currentRoom = gameWorld.getRoomContainingPosition(gameWorld.player.position);
    if (currentRoom) {
        minimapCamera.x = (currentRoom.position.x + currentRoom.definition.width / 2) * MINIMAP_GRID_SQUARE_SIZE;
        minimapCamera.y = (currentRoom.position.y + currentRoom.definition.height / 2) * MINIMAP_GRID_SQUARE_SIZE;
    }
    // console.log(minimapCamera);

    context.save();
    context.translate(
        Math.round(canvas.width / 2 - minimapCamera.x * minimapCamera.scale),
        Math.round(canvas.height / 2 - minimapCamera.y * minimapCamera.scale)
    );
    context.scale(minimapCamera.scale, minimapCamera.scale);

    context.fillStyle = "#0a4540";
    const vistedRooms = gameWorld.getGameState("roomsVisited");
    gameWorld.rooms.forEach((room) => {
        if (!vistedRooms.has(room.id)) {
            return;
        }
        gameWorld.getEntitiesInRoom(room).forEach((entity) => {
            if (entity instanceof Wall) {
                context.fillRect(
                    (entity.position.x) * MINIMAP_GRID_SQUARE_SIZE,
                    (entity.position.y) * MINIMAP_GRID_SQUARE_SIZE,
                    MINIMAP_GRID_SQUARE_SIZE,
                    MINIMAP_GRID_SQUARE_SIZE
                );
            }
        });
    });
    gameWorld.entities.forEach((ents) => {
        ents.forEach((ent) => {
            if (ent instanceof ClosedDoor) {
                if (!vistedRooms.has(gameWorld.getRoomContainingPosition(ent.position)!.id)) {
                    return;
                }
                context.fillStyle = "#0a4540";
                context.fillRect(
                    ent.position.x * MINIMAP_GRID_SQUARE_SIZE,
                    ent.position.y * MINIMAP_GRID_SQUARE_SIZE,
                    MINIMAP_GRID_SQUARE_SIZE,
                    MINIMAP_GRID_SQUARE_SIZE
                );
            }
            if (ent instanceof Segment) {
                context.fillStyle = "#1c8d96";
                context.fillRect(
                    ent.position.x * MINIMAP_GRID_SQUARE_SIZE,
                    ent.position.y * MINIMAP_GRID_SQUARE_SIZE,
                    MINIMAP_GRID_SQUARE_SIZE,
                    MINIMAP_GRID_SQUARE_SIZE
                );
            }
        });
    });

    context.restore();
}

function useDrawLoop(canvasRef: React.RefObject<HTMLCanvasElement | null>, gameWorld: GameWorld) {
    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (!context) {
            throw new Error("Couldn't get 2D context");
        }

        let frameHandle: number;
        let lastTimestamp = performance.now();
        function animationFrame(timestamp: number) {
            frameHandle = requestAnimationFrame(animationFrame);

            const dt = timestamp - lastTimestamp;
            lastTimestamp = timestamp;

            drawMinimap(dt, canvas, context!, gameWorld);
        }

        frameHandle = requestAnimationFrame(animationFrame);

        return () => cancelAnimationFrame(frameHandle);
    }, [gameWorld]);
}

interface MinimapProps {
    gameWorld: GameWorld;
}
export function Minimap(props: MinimapProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useFitCanvasToContainer(canvasRef);

    useDrawLoop(canvasRef, props.gameWorld);

    return (
        <div className="MinimapContainer">
            <canvas ref={canvasRef} />
        </div>
    );
}
