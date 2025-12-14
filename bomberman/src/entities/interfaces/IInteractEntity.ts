import type { Entity } from '@/entities';

export type IInteractEntity = {
    onTouchEntity<T extends Entity>(obj: T): void;
};
