import { WSMessagePacket } from '../types/WSPacket.type';
import { connectionManagerService } from './connectionManager.service';

class MessageService {

    public broadcastMessage(sender: string, msg: string): void {
        const packet: WSMessagePacket = { username: sender, message: msg };
        for (const ws of connectionManagerService.connections) {
            ws.send(JSON.stringify(packet));
        }
    }
}

export const messageService = new MessageService();
