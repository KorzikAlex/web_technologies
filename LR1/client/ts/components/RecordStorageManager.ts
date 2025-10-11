import {LocalStorageManager} from "./LocalStorageManager";

export class RecordStorageManager extends LocalStorageManager {
    saveRecord(nickname: string, score: number): void {
        let data = JSON.parse(this.read("scores")) || {};
        if (!data[nickname] || data[nickname].score < score) {
            data[nickname] = { score: score, time: Date.now() };
        }
        this.store("scores", JSON.stringify(data));
    }

    getTopPlayers(limit = 5) {
        return this.getSortedPlayers().slice(0, limit);
    }

    getSortedPlayers() {
        let data = JSON.parse(this.read("scores")) || {};
        return Object.entries(data)
            .map(([nickname, {score, time}]) => ({nickname, score, time}))
            .sort((a, b) => b.score - a.score || a.time - b.time);
    }

}