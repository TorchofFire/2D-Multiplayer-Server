import Character from '../objects/character';
import { WSPlayerPacket } from '../types/WSPacket.type';
import { connectionManagerService } from './connectionManager.service';

class PlayersService {
    players: Character[] = [];
    playersMap: Map<string, Character> = new Map();

    public newPlayer(ip: string): void {
        if (this.playersMap.has(ip)) return;
        const player = new Character(0, 500);
        this.players.push(player);
        this.playersMap.set(ip, player);
    }

    public removePlayer(ip: string): void {
        const removedPlayer = this.playersMap.get(ip);
        if (!removedPlayer) return;
        this.players = this.players.filter(ws => ws !== removedPlayer);
        this.playersMap.delete(ip);
    }

    public updatePlayer(ip: string, packet: WSPlayerPacket): void {
        const player = this.playersMap.get(ip);
        if (!player) {
            this.newPlayer(ip);
            return;
        }
        player.username = packet.username;
        player.body.position.x = packet.positionX;
        player.body.position.y = packet.positionY;
        player.movement = packet.keypresses;
        this.broadcastPlayerUpdate(packet, ip);
    }

    private broadcastPlayerUpdate(packet: WSPlayerPacket, ignoreIp: string): void {
        const ignoreConnection = connectionManagerService.connectionMap.get(ignoreIp);
        const connections = connectionManagerService.connections.filter(ws => ws !== ignoreConnection);
        for (const ws of connections) {
            ws.send(JSON.stringify(packet));
        }
    }
}

export const playersService = new PlayersService();
