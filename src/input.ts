import { updateInputs } from "./gameloop";

const inputs = ["w", "a", "s", "d"] as const;

function isSupportedInput(input: string): input is Input {
    return inputs.includes(input as Input);
}

export type Input = (typeof inputs)[number];

export const InputState = new Set<Input>();

function onKeyDown(event: KeyboardEvent) {
    if (isSupportedInput(event.key.toLowerCase())) {
        InputState.add(event.key.toLowerCase() as Input);
    }
    if (event.key === "ArrowLeft") {
        InputState.add("a");
    }
    if (event.key === "ArrowRight") {
        InputState.add("d");
    }
    if (event.key === "ArrowUp") {
        InputState.add("w");
    }
    if (event.key === "ArrowDown") {
        InputState.add("s");
    }
    updateInputs();
}
function onKeyUp(event: KeyboardEvent) {
    if (isSupportedInput(event.key.toLowerCase())) {
        InputState.delete(event.key.toLowerCase() as Input);
    }
    if (event.key === "ArrowLeft") {
        InputState.delete("a");
    }
    if (event.key === "ArrowRight") {
        InputState.delete("d");
    }
    if (event.key === "ArrowUp") {
        InputState.delete("w");
    }
    if (event.key === "ArrowDown") {
        InputState.delete("s");
    }
}

document.body.addEventListener("keydown", onKeyDown);
document.body.addEventListener("keyup", onKeyUp);
window.addEventListener("blur", () => InputState.clear());
