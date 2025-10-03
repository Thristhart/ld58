import { useEffect, useRef } from "react";
import "./canvas.css";
import { drawFrame } from "./render";

function useFitCanvasToWindow(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const onResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", onResize, { passive: true });
        return () => {
            window.removeEventListener("resize", onResize);
        };
    }, []);
}

function useDrawLoop(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
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

            drawFrame(dt, canvas, context!);
        }

        frameHandle = requestAnimationFrame(animationFrame);

        return () => cancelAnimationFrame(frameHandle);
    }, []);
}

export function Canvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useFitCanvasToWindow(canvasRef);

    useDrawLoop(canvasRef);

    return <canvas ref={canvasRef} />;
}
