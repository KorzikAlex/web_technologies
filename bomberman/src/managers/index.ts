/**
 * @file src/managers/index.ts
 * @module Managers
 * @description Этот модуль экспортирует все менеджеры, используемые в игре.
 * @package Менеджеры игры
 */
export { MapManager } from './MapManager';
export { SpriteManager } from './SpriteManager';
export { EventsManager } from './EventsManager';
export { PhysicsManager } from './PhysicsManager';
export { GameManager } from './GameManager';
export type {
    GameOverCallback,
    NextLevelCallback,
    VictoryCallback,
    ScoreChangeCallback,
} from './GameManager';
export { RecordsManager } from './RecordsManager';
export { SoundManager } from './SoundManager';
