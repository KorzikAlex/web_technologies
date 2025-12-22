/**
 * @file RecordsManager.ts
 * @description Менеджер рекордов игроков, сохраняет и загружает данные из localStorage
 * @module Managers/RecordsManager
 */

/**
 * Интерфейс записи игрока
 */
export interface PlayerRecord {
    /**
     * Ник игрока
     */
    nick: string;
    /**
     * Очки игрока
     */
    score: number;
}

export class RecordsManager {
    private static readonly STORAGE_KEY: string = 'bomberman_players';
    private static readonly CURRENT_PLAYER_KEY: string = 'bomberman_current_player';

    /**
     * Получить всех игроков из localStorage
     */
    public static getPlayers(): PlayerRecord[] {
        const data: string | null = localStorage.getItem(this.STORAGE_KEY);
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
     * @param players массив записей игроков
     */
    private static savePlayers(players: PlayerRecord[]): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(players));
    }

    /**
     * Получить текущего игрока
     * @return запись текущего игрока или null если не установлен
     */
    public static getCurrentPlayer(): PlayerRecord | null {
        const nick: string | null = localStorage.getItem(this.CURRENT_PLAYER_KEY);
        if (!nick) {
            return null;
        }
        const players: PlayerRecord[] = this.getPlayers();
        return (
            players.find((p: PlayerRecord): boolean => {
                return p.nick === nick;
            }) || null
        );
    }

    /**
     * Установить текущего игрока (если не существует - создать)
     * @param nick ник игрока
     * @return запись текущего игрока
     */
    public static setCurrentPlayer(nick: string): PlayerRecord {
        const trimmedNick: string = nick.trim();
        if (!trimmedNick) {
            throw new Error('Ник не может быть пустым');
        }

        const players: PlayerRecord[] = this.getPlayers();
        let player: PlayerRecord | undefined = players.find((p: PlayerRecord): boolean => {
            return p.nick === trimmedNick;
        });

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
     * @param points количество очков для добавления
     */
    public static addScore(points: number): void {
        const currentPlayer: PlayerRecord | null = this.getCurrentPlayer();
        if (!currentPlayer) {
            console.warn('Нет активного игрока для добавления очков');
            return;
        }

        const players: PlayerRecord[] = this.getPlayers();
        const player: PlayerRecord | undefined = players.find((p: PlayerRecord): boolean => {
            return p.nick === currentPlayer.nick;
        });
        if (player) {
            player.score += points;
            this.savePlayers(players);
        }
    }

    /**
     * Установить очки текущему игроку
     * @param score новое количество очков
     */
    public static setScore(score: number): void {
        const currentPlayer: PlayerRecord | null = this.getCurrentPlayer();
        if (!currentPlayer) {
            console.warn('Нет активного игрока для установки очков');
            return;
        }

        const players: PlayerRecord[] = this.getPlayers();
        const player: PlayerRecord | undefined = players.find((p: PlayerRecord): boolean => {
            return p.nick === currentPlayer.nick;
        });
        if (player) {
            player.score = Math.max(0, score);
            this.savePlayers(players);
        }
    }

    /**
     * Получить таблицу лидеров (отсортированную по очкам)
     * @param limit максимальное количество записей (если не указано - все)
     */
    public static getLeaderboard(limit?: number): PlayerRecord[] {
        const players: PlayerRecord[] = this.getPlayers();
        const sorted: PlayerRecord[] = [...players].sort((a, b) => b.score - a.score);
        return limit ? sorted.slice(0, limit) : sorted;
    }

    /**
     * Получить список всех ников
     * @return массив никнеймов игроков
     */
    public static getAllNicks(): string[] {
        return this.getPlayers().map((p) => p.nick);
    }

    /**
     * Удалить игрока
     * @param nick ник игрока для удаления
     */
    public static deletePlayer(nick: string): void {
        const players: PlayerRecord[] = this.getPlayers();
        const filtered: PlayerRecord[] = players.filter((p: PlayerRecord): boolean => {
            return p.nick !== nick;
        });
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
