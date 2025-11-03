export interface IMessage {
    senderId: number;
    receiverId: number;
    content: string;
    timestamp: Date;
}

export interface IMessagesManager {
    sendMessage(senderId: number, receiverId: number, content: string): void;

    getMessagesBetweenUsers(userId1: number, userId2: number): IMessage[];
}

export class MessagesManager implements IMessagesManager {
    private messages: IMessage[] = [];

    sendMessage(senderId: number, receiverId: number, content: string): void {
        const message: IMessage = {
            senderId,
            receiverId,
            content,
            timestamp: new Date()
        };
        this.messages.push(message);
    }

    getMessagesBetweenUsers(userId1: number, userId2: number): IMessage[] {
        return this.messages.filter(
            msg =>
                (msg.senderId === userId1 && msg.receiverId === userId2) ||
                (msg.senderId === userId2 && msg.receiverId === userId1)
        );
    }
}

export default MessagesManager;