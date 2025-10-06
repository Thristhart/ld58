import { Howl } from "howler";

import bgmUrl from "#src/assets/sounds/bgm_final_loop.mp3";

export const bgm = new Howl({ src: bgmUrl, loop: true });
