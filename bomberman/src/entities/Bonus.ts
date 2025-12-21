import { Entity } from './';
import type { IDrawable, IHaveName } from './interfaces';
import type { SpriteManager, GameManager } from '@/managers';

export type BonusType = 'Speed' | 'FastBomb' | 'BigBomb';

export class Bonus extends Entity implements IDrawable, IHaveName {
    name: string;
    bonusType: BonusType;
    spriteManager: SpriteManager;
    gameManager: GameManager<Bonus>;

    // Анимация мерцания
    private animationTimer: number;
    private isVisible: boolean;

    constructor(
        x: number,
        y: number,
        bonusType: BonusType,
        spriteManager: SpriteManager,
        gameManager: GameManager<Bonus>,
    ) {
        super(x, y, 16, 16);

        this.bonusType = bonusType;
        this.name = `Bonus_${bonusType}`;
        this.spriteManager = spriteManager;
        this.gameManager = gameManager;

        this.animationTimer = 0;
        this.isVisible = true;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        // Мерцание бонуса для привлечения внимания
        if (!this.isVisible) {
            return;
        }

        let spriteName: string;
        switch (this.bonusType) {
            case 'Speed':
                spriteName = 'bonus_speed';
                break;
            case 'FastBomb':
                spriteName = 'bonus_fastbomb';
                break;
            case 'BigBomb':
                spriteName = 'bonus_bigbomb';
                break;
        }

        this.spriteManager.drawSprite(ctx, spriteName, this.pos_x, this.pos_y);
    }

    update(): void {
        const deltaTime = 16.67; // ~60 FPS
        this.animationTimer += deltaTime;

        // Мерцание каждые 300мс
        if (this.animationTimer >= 300) {
            this.animationTimer = 0;
            this.isVisible = !this.isVisible;
        }
    }

    /**
     * Возвращает описание эффекта бонуса
     */
    getDescription(): string {
        switch (this.bonusType) {
            case 'Speed':
                return 'Скорость +20%';
            case 'FastBomb':
                return 'Максимум бомб: 3';
            case 'BigBomb':
                return 'Радиус взрыва +1';
        }
    }
}
