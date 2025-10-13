import type {RecordStorageManager} from "./RecordStorageManager";
import type {ScoreRec} from "../types";

export class Ui {
    private spanScoreValue: HTMLSpanElement;
    private spanLevelValue: HTMLSpanElement;
    private nicknameValue = document.getElementById("username_value");
    private nicknameInput = document.getElementById("nickname_input");
    private startButton = document.getElementById("start_button");
    constructor(spanScoreValue: HTMLSpanElement, spanLevelValue: HTMLSpanElement) {
        this.spanScoreValue = spanScoreValue;
        this.spanLevelValue = spanLevelValue;
        this.updateScore(0);
        this.updateLevel(1);
    }

    updateLevel(level: number) {
        this.spanLevelValue.textContent = level.toString();
    }

    updateScore(score: number) {
        this.spanScoreValue.textContent = score.toString();
    }

    updateNickname(nickname: string) {
        this.nicknameValue!.textContent = nickname;
        (this.nicknameInput as HTMLInputElement).value = nickname;
    }
    getNickname() {
        return (this.nicknameInput as HTMLInputElement).value;
    }

    showLeaderboard(recordStorageManager: RecordStorageManager, nickname: string, score: number) {
        const sortedPlayers: Record<string, ScoreRec> = recordStorageManager.getSortedPlayers();
        this.leaderboardBody.innerHTML = ''; // Очищаем предыдущие записи

        let rank = 1;
        for (const playerNickname in sortedPlayers) {
            const record = sortedPlayers[playerNickname]!;
            const row = document.createElement('tr');

            // Выделяем текущий результат игрока
            if (playerNickname === nickname && record.score === score) {
                row.classList.add('table-success');
            }

            const rankCell = document.createElement('th');
            rankCell.scope = 'row';
            rankCell.textContent = String(rank++);

            const nameCell = document.createElement('td');
            nameCell.textContent = playerNickname;

            const scoreCell = document.createElement('td');
            scoreCell.textContent = String(record.score);

            const dateCell = document.createElement('td');
            dateCell.textContent = new Date(record.date).toLocaleDateString();

            row.appendChild(rankCell);
            row.appendChild(nameCell);
            row.appendChild(scoreCell);
            row.appendChild(dateCell);

            this.leaderboardBody.appendChild(row);
        }

        this.leaderboardModal.show();
    }
}