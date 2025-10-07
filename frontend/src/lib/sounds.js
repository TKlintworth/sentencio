import { Howl } from 'howler';

const sounds = {
    drop: new Howl({
        src: ['/sounds/drop1.wav'],
        volume: 0.5
    })
};

export function playSound(name) {
    if (sounds[name]) {
        sounds[name].rate(0.9 + Math.random() * 0.2);
        sounds[name].play();
    }
}