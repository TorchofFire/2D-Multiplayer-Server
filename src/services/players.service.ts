import Matter from 'matter-js';
import Character from '../objects/character';
import { WSPlayerPacket } from '../types/WSPacket.type';
import { connectionManagerService } from './connectionManager.service';
import { world } from '../main';

class PlayersService {
    players: Character[] = [];
    playersMap: Map<string, Character> = new Map();

    public newPlayer(ip: string): void {
        if (this.playersMap.has(ip)) return;
        const player = new Character(0, 500);
        this.players.push(player);
        this.playersMap.set(ip, player);
        Matter.World.add(world, player.body);
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
        Matter.Body.setPosition(player.body, { x: packet.positionX, y: packet.positionY });
        Matter.Body.setVelocity(player.body, packet.velocity);
        this.broadcastPlayerUpdate(packet, ip);
    }

    private broadcastPlayerUpdate(packet: WSPlayerPacket, ignoreIp: string): void {
        const ignoreConnection = connectionManagerService.connectionMap.get(ignoreIp);
        const connections = connectionManagerService.connections.filter(ws => ws !== ignoreConnection);
        for (const ws of connections) {
            ws.send(JSON.stringify(packet));
        }
    }

    public correctPlayers(): void {
        for (const player of this.players) {
            Matter.Body.setAngle(player.body, 0);
        }
    }
}

export const playersService = new PlayersService();
