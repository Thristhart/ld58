import { use, useEffect, useRef } from "react";
import "./canvas.css";
import { drawFrame } from "./render";
import { GameWorld } from "./model/gameworld";
import { imageLoadPromise } from "./images";
import { levelLoadPromise } from "./levels/loadlevel";

function useFitCanvasToWindow(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }
        const canvas = canvasRef.current;
        const parentRect = canvas.parentElement?.getBoundingClientRect();
        canvas.width = parentRect?.width || 0;
        canvas.height = parentRect?.height || 0;

        const onResize = () => {
            const parentRect = canvas.parentElement?.getBoundingClientRect();
            canvas.width = parentRect?.width || 0;
            canvas.height = parentRect?.height || 0;
        };
        window.addEventListener("resize", onResize, { passive: true });
        return () => {
            window.removeEventListener("resize", onResize);
        };
    }, []);
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

            drawFrame(dt, canvas, context!, gameWorld);
        }

        frameHandle = requestAnimationFrame(animationFrame);

        return () => cancelAnimationFrame(frameHandle);
    }, [gameWorld]);
}

interface CanvasProps {
    gameWorld: GameWorld;
}
export function Canvas(props: CanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useFitCanvasToWindow(canvasRef);

    useDrawLoop(canvasRef, props.gameWorld);

    return <canvas ref={canvasRef} />;
}
