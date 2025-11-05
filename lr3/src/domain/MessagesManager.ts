import fs from 'fs/promises';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface IMessage {
    senderId: number;
    receiverId: number;
    content: string;
    timestamp: string;
}


export class MessagesManager {
    private readonly dataPath: string = path.resolve(__dirname, '../data/', 'messages.json');

    private async loadMessages(): Promise<IMessage[]> {
        try {
            const data: string = await fs.readFile(this.dataPath, 'utf-8');
            return JSON.parse(data);
        } catch {
            return [];
        }
    }

    private async saveMessages(messages: IMessage[]): Promise<void> {
        await fs.writeFile(this.dataPath, JSON.stringify(messages, null, 4));
    }

    async sendMessage(senderId: number, receiverId: number, content: string): Promise<void> {
        const messages: IMessage[] = await this.loadMessages();
        const message: IMessage = {
            senderId,
            receiverId,
            content,
            timestamp: new Date().toISOString()
        };
        messages.push(message);
        await this.saveMessages(messages);
    }

    async getMessagesBetweenUsers(userId1: number, userId2: number): Promise<IMessage[]> {
        const messages: IMessage[] = await this.loadMessages();
        return messages.filter(
            (msg: IMessage): boolean =>
                (msg.senderId === userId1 && msg.receiverId === userId2) ||
                (msg.senderId === userId2 && msg.receiverId === userId1)
        ).sort((a: IMessage, b: IMessage): number => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }
}

export const messagesManager = new MessagesManager();
