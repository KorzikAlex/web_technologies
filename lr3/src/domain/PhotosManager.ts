import fs from 'fs/promises';
import path from 'path';
import type {Photo, PhotoStatus} from '../models/Photo';
import {fileURLToPath} from "node:url";

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

export class PhotosManager {
    private readonly dataPath: string = path.resolve(__dirname, '../data/', 'photos.json');


    /**
     * Поиск пользователя по заданному ключу и значению
     * @param key Ключ для поиска
     * @param value Значение для поиска
     * @private
     * @returns {Promise<User | null>} Пользователь или null, если не найден
     */
    private async getPhotosBy<K extends keyof Photo>(
        key: K,
        value: Photo[K]
    ): Promise<Photo[] | null> {
        const photos: Photo[] = await this.getAllPhotos();
        return photos.filter((p: Photo): boolean => p[key] === value) ?? null;
    }

    async getPhotosByUserId(userId: number): Promise<Photo[]> {
        return this.getPhotosBy('userId', userId);
    }

    async updatePhotoStatus(photoId: number, status: PhotoStatus): Promise<Photo | null> {
        const photos: Photo[] = await this.getAllPhotos();
        const index: number = photos.findIndex((p: Photo): boolean => p.id === photoId);
        if (index === -1) {
            return null;
        }

        photos[index].status = status;
        await this.savePhotos(photos);
        return photos[index];
    }

    private async getAllPhotos(): Promise<Photo[]> {
        const data: string = await fs.readFile(this.dataPath, 'utf-8');
        return JSON.parse(data);
    }

    private async savePhotos(photos: Photo[]): Promise<void> {
        await fs.writeFile(this.dataPath, JSON.stringify(photos, null, 4));
    }
}

export const photosManager: PhotosManager = new PhotosManager();
