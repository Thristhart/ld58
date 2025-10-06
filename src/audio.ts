import { Howl } from "howler";

import bgmUrl from "#src/assets/sounds/bgm_final_loop.mp3";

export const bgm = new Howl({ src: bgmUrl, loop: true });

import chomp1Url from "#src/assets/sounds/chomp_1.mp3";
import chomp2Url from "#src/assets/sounds/chomp_2.mp3";
import chomp3Url from "#src/assets/sounds/chomp_3.mp3";
import chomp4Url from "#src/assets/sounds/chomp_4.mp3";
import chomp5Url from "#src/assets/sounds/chomp_5.mp3";
import chomp6Url from "#src/assets/sounds/chomp_6.mp3";

const chomps = [
    new Howl({ src: chomp1Url, rate: 1.5 }),
    new Howl({ src: chomp2Url, rate: 1.5 }),
    new Howl({ src: chomp3Url, rate: 1.5 }),
    new Howl({ src: chomp4Url, rate: 1.5 }),
    new Howl({ src: chomp5Url, rate: 1.5 }),
    new Howl({ src: chomp6Url, rate: 1.5 }),
];

export function chomp() {
    chomps[Math.floor(Math.random() * chomps.length)].play();
}

import cuteAnimalDying1Url from "#src/assets/sounds/cute_animal_dying_1.mp3";
import cuteAnimalDying2Url from "#src/assets/sounds/cute_animal_dying_2.mp3";
import cuteAnimalDying3Url from "#src/assets/sounds/cute_animal_dying_3.mp3";

const cuteDeath = [
    new Howl({ src: cuteAnimalDying1Url, rate: 1.5 }),
    new Howl({ src: cuteAnimalDying2Url, rate: 1.5 }),
    new Howl({ src: cuteAnimalDying3Url, rate: 1.5 }),
];

export function cuteAnimalDie() {
    cuteDeath[Math.floor(Math.random() * cuteDeath.length)].play();
}
