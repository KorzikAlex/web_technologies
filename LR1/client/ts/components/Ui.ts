import type {RecordStorageManager} from "./RecordStorageManager";

export class Ui {
    private scoreValue = document.getElementById("scoreValue") as HTMLSpanElement;
    private levelValue = document.getElementById("levelValue") as HTMLSpanElement;
    private nicknameValue = document.getElementById("username_value");
    private nicknameInput = document.getElementById("nickname_input");
    private startButton = document.getElementById("start_button");
    constructor() {

    }

    updateLevel(level: number) {
        this.levelValue.textContent = level.toString();
    }

    updateScore(score: number) {
        this.scoreValue.textContent = score.toString();
    }

    updateNickname(nickname: string) {
        this.nicknameValue!.textContent = nickname;
        (this.nicknameInput as HTMLInputElement).value = nickname;
    }
    getNickname() {
        return (this.nicknameInput as HTMLInputElement).value;
    }

    showLeaderboard(recordStorageManager: RecordStorageManager, nickname: string, score: number) {
    }
}