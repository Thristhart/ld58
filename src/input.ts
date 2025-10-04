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
}
function onKeyUp(event: KeyboardEvent) {
    if (isSupportedInput(event.key.toLowerCase())) {
        InputState.delete(event.key.toLowerCase() as Input);
    }
}

document.body.addEventListener("keydown", onKeyDown);
document.body.addEventListener("keyup", onKeyUp);
window.addEventListener("blur", () => InputState.clear());
