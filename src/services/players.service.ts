import Matter from 'matter-js';
import Character from '../objects/character';
import { WSPlayerDisconnectPacket, WSPlayerPacket } from '../types/WSPacket.type';
import { connectionManagerService } from './connectionManager.service';
import { world } from '../main';
import chalk from 'chalk';

class PlayersService {
    players: Character[] = [];
    playersMap: Map<string, Character> = new Map();

    public newPlayer(ip: string): void {
        if (this.playersMap.has(ip)) return;
        const player = new Character(0, 500);
        this.players.push(player);
        this.playersMap.set(ip, player);
        Matter.World.add(world, player.body);
        console.log(chalk.greenBright(`Client connected | IP: ${ip}`));
    }

    public removePlayer(ip: string): void {
        const removedPlayer = this.playersMap.get(ip);
        if (!removedPlayer) return;
        this.players = this.players.filter(ws => ws !== removedPlayer);
        this.playersMap.delete(ip);
        Matter.World.remove(world, removedPlayer.body);
        this.broadcastPlayerLeave({ username: removedPlayer.username! });
        console.log(chalk.redBright(`Client Disconnected | IP: ${ip} | username: ${removedPlayer.username}`));
    }

    public updatePlayer(ip: string, packet: WSPlayerPacket): void {
        const player = this.playersMap.get(ip);
        if (!player) {
            this.newPlayer(ip);
            return;
        }
        player.username = packet.username;
        Matter.Body.setPosition(player.body, packet.position);
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

    private broadcastPlayerLeave(packet: WSPlayerDisconnectPacket): void {
        for (const ws of connectionManagerService.connections) {
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
