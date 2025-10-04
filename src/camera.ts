export const camera = { x: 0, y: 0, scale: parseFloat(localStorage.getItem("scale") ?? "1") };

// @ts-ignore
window.DEBUG_camera = camera;
