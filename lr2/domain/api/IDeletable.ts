export interface IDeletable {
    deleteItem(id: number | string): Promise<void>;

    deleteItems(ids: Array<number | string>): Promise<void>;
}