import type { Entity } from '@/entities';
import type { GameManager, MapManager } from './';
import type { IDrawable } from '@/entities/interfaces';

export type SoundClip = {
    path: string;
    buffer: AudioBuffer | null;
    loaded: boolean;
    play: (volume: number, loop: boolean) => void;
};

export class SoundManager {
    clips: {
        [key: string]: SoundClip;
    };
    context: AudioContext;
    gainNode: GainNode;
    loaded: boolean;

    gameManager: GameManager<Entity & IDrawable>;
    mapManager: MapManager;

    constructor(gameManager: GameManager<Entity & IDrawable>, mapManager: MapManager) {
        this.context = new AudioContext();
        this.clips = {};
        this.gainNode = this.context.createGain();
        this.gainNode.connect(this.context.destination);
        this.loaded = false;
        this.gameManager = gameManager;
        this.mapManager = mapManager;
    }

    load(path: string, callback: (clip: SoundClip) => void): void {
        if (this.clips[path]) {
            callback(this.clips[path]);
            return;
        }

        const clip: SoundClip = {
            path: path,
            buffer: null,
            loaded: false,
            play: (volume: number, loop: boolean): void => {
                this.play(path, { looping: loop ? loop : false, volume: volume ? volume : 1 });
            },
        };

        this.clips[path] = clip;
        const request = new XMLHttpRequest();
        request.open('GET', path, true);
        request.responseType = 'arraybuffer';
        request.onload = (): void => {
            this.context.decodeAudioData(request.response, (buffer: AudioBuffer): void => {
                clip.buffer = buffer;
                clip.loaded = true;
                callback(clip);
            });
        };
        request.send();
    }

    loadArray(array: string[]): void {
        for (let i: number = 0; i < array.length; i++) {
            this.load(array[i], (): void => {
                if (array.length === Object.keys(this.clips).length) {
                    for (const sd in this.clips) {
                        if (!this.clips[sd].loaded) {
                            return;
                        }
                    }
                    this.loaded = true;
                }
            });
        }
    }

    play(path: string, settings?: { looping: boolean; volume: number }): boolean {
        if (!this.loaded) {
            setTimeout((): void => {
                this.play(path, settings);
            }, 1000);
            return false;
        }

        const looping: boolean = settings?.looping || false;
        const volume: number = settings?.volume || 1;

        const sd: SoundClip = this.clips[path];

        if (sd === null) {
            return false;
        }

        const sound: AudioBufferSourceNode = this.context.createBufferSource();
        sound.buffer = sd.buffer;
        sound.connect(this.gainNode);
        sound.loop = looping;
        this.gainNode.gain.value = volume;
        sound.start(0);
        return true;
    }

    /**
     * Воспроизводит звук и вызывает callback после его окончания
     */
    playWithCallback(path: string, callback: () => void, settings?: { volume: number }): void {
        if (!this.loaded) {
            setTimeout((): void => {
                this.playWithCallback(path, callback, settings);
            }, 1000);
            return;
        }

        const volume: number = settings?.volume || 1;
        const sd: SoundClip = this.clips[path];

        if (sd === null || !sd.buffer) {
            callback();
            return;
        }

        const sound: AudioBufferSourceNode = this.context.createBufferSource();
        sound.buffer = sd.buffer;
        sound.connect(this.gainNode);
        sound.loop = false;
        this.gainNode.gain.value = volume;
        sound.onended = callback;
        sound.start(0);
    }

    playWorldSound(path: string, x: number, y: number): void {
        if (this.gameManager.player === null) {
            return;
        }

        const viewSize: number = Math.max(this.mapManager.view.w, this.mapManager.view.h) * 0.8;
        const dx: number = this.gameManager.player.pos_x - x;
        const dy: number = this.gameManager.player.pos_y - y;
        const distance: number = Math.sqrt(dx * dx + dy * dy);

        let norm: number = distance / viewSize;

        if (norm > 1) {
            norm = 1;
        }
        const volume: number = 1 - norm;

        if (!volume) {
            return;
        }

        this.play(path, { looping: false, volume: volume });
    }

    toogleMute(): void {
        this.gainNode.gain.value = this.gainNode.gain.value > 0 ? 0 : 1;
    }

    stopAll(): void {
        this.gainNode?.disconnect();
        this.gainNode = this.context?.createGain();
        this.gainNode?.connect(this.context.destination);
    }
}
