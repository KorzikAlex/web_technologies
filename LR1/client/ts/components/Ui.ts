import type {RecordStorageManager} from "./RecordStorageManager";
import type {ScoreRec} from "../utils/types";

declare const bootstrap: any;

export class Ui {
    private spanScoreValue: HTMLSpanElement;
    private spanLevelValue: HTMLSpanElement;
    private leaderboardBody: HTMLTableSectionElement;
    private leaderboardModalElement: HTMLElement;
    private leaderboardModal: any;

    constructor(spanScoreValue: HTMLSpanElement, spanLevelValue: HTMLSpanElement) {
        this.spanScoreValue = spanScoreValue;
        this.spanLevelValue = spanLevelValue;
        this.updateScore(0);
        this.updateLevel(1);

        this.leaderboardBody = document.getElementById('leaderboardBody') as HTMLTableSectionElement;
        this.leaderboardModalElement = document.getElementById('leaderboardModal') as HTMLElement;
        // Создаем экземпляр модального окна Bootstrap
        this.leaderboardModal = new bootstrap.Modal(this.leaderboardModalElement);
    }

    updateLevel(level: number): void {
        this.spanLevelValue.textContent = level.toString();
    }

    updateScore(score: number): void {
        this.spanScoreValue.textContent = score.toString();
    }

    showLeaderboard(recordStorageManager: RecordStorageManager, nickname: string, score: number) {
        const sortedPlayers: Record<string, ScoreRec> = recordStorageManager.getSortedPlayers();
        this.leaderboardBody.innerHTML = ''; // Очищаем предыдущие записи

        let rank: number = 1;
        for (const playerNickname in sortedPlayers) {
            const record: ScoreRec = sortedPlayers[playerNickname]!;
            const row: HTMLTableRowElement = document.createElement('tr');

            // Выделяем текущий результат игрока, если он есть в таблице
            if (playerNickname === nickname && record.score === score) {
                row.classList.add('table-success');
            }

            const rankCell: HTMLTableCellElement = document.createElement('th');
            rankCell.scope = 'row';
            rankCell.textContent = String(rank++);

            const nameCell: HTMLTableCellElement = document.createElement('td');
            nameCell.textContent = playerNickname;

            const scoreCell: HTMLTableCellElement = document.createElement('td');
            scoreCell.textContent = String(record.score);

            const dateCell: HTMLTableCellElement = document.createElement('td');
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