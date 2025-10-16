export interface IGettable<T> {
    getItem(id: number | string): Promise<T | null>;

    getItems(filter?: any): Promise<T[]>;
}