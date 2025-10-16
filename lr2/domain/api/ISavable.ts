export interface ISavable {
    saveItem<T>(item: T): Promise<void>;

    saveItems<T>(items: T[]): Promise<void>;
}