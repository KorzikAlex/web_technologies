export interface IFriendsManager {
    addFriend(userId: number, friendId: number): void;

    removeFriend(userId: number, friendId: number): void;

    getFriendsList(userId: number): number[];
}

export class FriendsManager implements IFriendsManager {
    addFriend(userId: number, friendId: number): void {
        // Логика добавления друга
    }

    removeFriend(userId: number, friendId: number): void {
        // Логика удаления друга
    }

    getFriendsList(userId: number): number[] {
        // Логика получения списка друзей
        return [];
    }
}

export default FriendsManager;