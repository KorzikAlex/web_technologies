export interface IFeedManager {
    addPost(userId: number, content: string): void;

    getFeed(userId: number): string[];
}

export class FeedManager implements IFeedManager {
    private userFeeds: Record<number, string[]> = {};

    addPost(userId: number, content: string): void {
        if (!this.userFeeds[userId]) {
            this.userFeeds[userId] = [];
        }
        this.userFeeds[userId].unshift(content); // Добавляем запись в начало ленты
    }

    getFeed(userId: number): string[] {
        return this.userFeeds[userId] || [];
    }
}

export default FeedManager;