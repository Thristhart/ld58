import { useEffect, useRef } from "react";
import "./canvas.css";

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

export function Canvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useFitCanvasToWindow(canvasRef);

    return <canvas ref={canvasRef} />;
}
