export interface PlayerRecord {
    nick: string;
    score: number;
}

export class RecordsManager {
    private static readonly STORAGE_KEY = 'bomberman_players';
    private static readonly CURRENT_PLAYER_KEY = 'bomberman_current_player';

    /**
     * Получить всех игроков из localStorage
     */
    public static getPlayers(): PlayerRecord[] {
        const data = localStorage.getItem(this.STORAGE_KEY);
        if (!data) {
            return [];
        }
        try {
            return JSON.parse(data) as PlayerRecord[];
        } catch {
            return [];
        }
    }

    /**
     * Сохранить всех игроков в localStorage
     */
    private static savePlayers(players: PlayerRecord[]): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(players));
    }

    /**
     * Получить текущего игрока
     */
    public static getCurrentPlayer(): PlayerRecord | null {
        const nick = localStorage.getItem(this.CURRENT_PLAYER_KEY);
        if (!nick) {
            return null;
        }
        const players = this.getPlayers();
        return players.find((p) => p.nick === nick) || null;
    }

    /**
     * Установить текущего игрока (если не существует - создать)
     */
    public static setCurrentPlayer(nick: string): PlayerRecord {
        const trimmedNick = nick.trim();
        if (!trimmedNick) {
            throw new Error('Ник не может быть пустым');
        }

        const players = this.getPlayers();
        let player = players.find((p) => p.nick === trimmedNick);

        if (!player) {
            // Создать нового игрока
            player = { nick: trimmedNick, score: 0 };
            players.push(player);
            this.savePlayers(players);
        }

        localStorage.setItem(this.CURRENT_PLAYER_KEY, trimmedNick);
        return player;
    }

    /**
     * Добавить очки текущему игроку
     */
    public static addScore(points: number): void {
        const currentPlayer = this.getCurrentPlayer();
        if (!currentPlayer) {
            console.warn('Нет активного игрока для добавления очков');
            return;
        }

        const players = this.getPlayers();
        const player = players.find((p) => p.nick === currentPlayer.nick);
        if (player) {
            player.score += points;
            this.savePlayers(players);
        }
    }

    /**
     * Установить очки текущему игроку
     */
    public static setScore(score: number): void {
        const currentPlayer = this.getCurrentPlayer();
        if (!currentPlayer) {
            console.warn('Нет активного игрока для установки очков');
            return;
        }

        const players = this.getPlayers();
        const player = players.find((p) => p.nick === currentPlayer.nick);
        if (player) {
            player.score = Math.max(0, score);
            this.savePlayers(players);
        }
    }

    /**
     * Получить таблицу лидеров (отсортированную по очкам)
     */
    public static getLeaderboard(limit?: number): PlayerRecord[] {
        const players = this.getPlayers();
        const sorted = [...players].sort((a, b) => b.score - a.score);
        return limit ? sorted.slice(0, limit) : sorted;
    }

    /**
     * Получить список всех ников
     */
    public static getAllNicks(): string[] {
        return this.getPlayers().map((p) => p.nick);
    }

    /**
     * Удалить игрока
     */
    public static deletePlayer(nick: string): void {
        const players = this.getPlayers();
        const filtered = players.filter((p) => p.nick !== nick);
        this.savePlayers(filtered);

        // Если удалили текущего игрока - сбросить
        if (this.getCurrentPlayer()?.nick === nick) {
            localStorage.removeItem(this.CURRENT_PLAYER_KEY);
        }
    }

    /**
     * Очистить все рекорды
     */
    public static clearAll(): void {
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem(this.CURRENT_PLAYER_KEY);
    }
}
