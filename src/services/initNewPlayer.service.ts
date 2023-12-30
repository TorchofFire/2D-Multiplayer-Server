import { WebSocket } from 'ws';
import { WSPlayerPacket, WSInitPacket, WSHandShakePacket } from '../types/WSPacket.type';
import { connectionManagerService } from './connectionManager.service';
import { moveableObjectService } from './moveableObjects.service';
import { playersService } from './players.service';
import { serverVersion } from '../main';

class InitNewPlayerService {
    public handshake(ip: string, ws: WebSocket, packet: WSHandShakePacket): void {
        if (packet.version !== serverVersion && packet.version !== 'unknown') {
            ws.close(1000, `Version mismatch. Server is on version ${serverVersion}. You are on ${packet.version}.`);
            return;
        }
        if (playersService.playersMap.has(packet.username)) {
            ws.close(1000, `The name ${packet.username}, is already taken.`);
            return;
        }
        connectionManagerService.addNewConnection(ip, ws);
        playersService.newPlayer(ip);
        const objects: { label: string; position: Matter.Vector; velocity: Matter.Vector }[] = [];
        for (const object of moveableObjectService.objects) {
            objects.push({
                label: object.label,
                position: object.position,
                velocity: object.velocity
            });
        }
        const players: WSPlayerPacket[] = [];
        for (const player of playersService.players) {
            players.push({
                position: player.body.position,
                username: player.username || 'unknown',
                velocity: player.body.velocity
            });
        }
        const initPacket: WSInitPacket = {
            moveableObjects: objects,
            players: players
        };
        ws.send(JSON.stringify(initPacket));
    }
}

export const initNewPlayerService = new InitNewPlayerService();
