/**
 * @file RecordStorageManager.ts
 * @fileOverview Класс RecordStorageManager для управления рекордами игроков в локальном хранилище.
 * @author Korzik
 * @license MIT
 * @copyright 2025
 * @module RecordStorageManager
 */
import {LocalStorageManager} from "./LocalStorageManager";
import type {ScoreRec} from "../utils/types";

/**
 * Класс RecordStorageManager отвечает за сохранение и получение рекордов игроков в локальном хранилище.
 * @class RecordStorageManager
 * @extends LocalStorageManager
 */
export class RecordStorageManager extends LocalStorageManager {
    /**
     * Сохраняет рекорд игрока в локальное хранилище.
     * @param nickname
     * @param score
     */
    saveRecord(nickname: string, score: number): void {
        let records: Record<string, ScoreRec> = JSON.parse(localStorage.getItem("records") || "{}"); // Получаем текущие рекорды из localStorage

        // Если рекорд для данного никнейма не существует или новый счет выше существующего, обновляем рекорд
        if (!records[nickname] || records[nickname].score < score) {
            records[nickname] = {score: score, date: Date.now()}; // Обновляем или добавляем новый рекорд
            this.store("records", JSON.stringify(records)); // Сохраняем обновленные рекорды обратно в localStorage
        }
    }

    /**
     * Возвращает отсортированный список рекордов игроков по убыванию счета.
     * @returns Отсортированный объект с рекордами игроков
     */
    getSortedPlayers(): Record<string, ScoreRec> {
        let records: Record<string, ScoreRec> = JSON.parse(localStorage.getItem("records") || "{}"); // Получаем текущие рекорды из localStorage

        return Object.fromEntries(
            Object.entries(records).sort(([, a], [, b]) => b.score - a.score)
        );
    }
}