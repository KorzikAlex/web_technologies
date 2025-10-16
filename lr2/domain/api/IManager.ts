import type {ISavable} from "./ISavable";
import type {IDeletable} from "./IDeletable";
import type {IGettable} from "./IGettable";

export interface IManager<T> extends ISavable, IDeletable, IGettable<T> {
    addItem(): void;

    addItems(): void;

    updateItem(): void;

    updateItems(): void;

    loadItem(): void;

    loadItems(): void;
}