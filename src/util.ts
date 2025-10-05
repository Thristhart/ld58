export function lerp(t: number, a: number, b: number) {
    return (1 - t) * a + t * b;
}
