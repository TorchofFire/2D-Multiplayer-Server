import Matter from 'matter-js';
import { timeManagerService } from './services/timeManager.service';
import { mapService } from './services/map.service';
import { WebSocketServer } from 'ws';
import figlet from 'figlet';
import { connectionManagerService } from './services/connectionManager.service';
import { playersService } from './services/players.service';
import chalk from 'chalk';
import { isPlayerPacket } from './types/WSPacket.type';
import { moveableObjectService } from './services/moveableObjects.service';
require('dotenv').config();

console.log('starting server...');

figlet.text('Multiplayer Server', { font: 'Big', whitespaceBreak: true }, (err, data) => {
    if (err) return;
    console.log(chalk.blue(data));
    console.log(chalk.blueBright('Version 0.0.1 | by Torch'));
});

const engine = Matter.Engine.create();
export const world = engine.world;
engine.gravity.y = 0.5;

mapService.createLevel();

const wss = new WebSocketServer({ host: process.env.IP, port: Number(process.env.PORT) });
console.log(`listening on ${`${wss.options.host}:${wss.options.port}`}`);

wss.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress;
    console.log(chalk.greenBright(`Client connected | IP: ${ip}`));
    if (!ip) {
        ws.close();
        return;
    }
    connectionManagerService.addNewConnection(ip, ws);
    playersService.newPlayer(ip);

    ws.on('message', message => {
        const packet = JSON.parse(`${message}`);
        if (isPlayerPacket(packet)) playersService.updatePlayer(ip, packet);
    });

    ws.on('close', () => {
        connectionManagerService.removeConnection(ip);
        playersService.removePlayer(ip);
        console.log(chalk.redBright(`Client Disconnected | IP: ${ip}`));
    });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const gameLoop = setInterval(() => {
    timeManagerService.logic();
    playersService.correctPlayers();
    moveableObjectService.sendObjectPackets();
    Matter.Engine.update(engine, timeManagerService.deltaTime * 2500);

}, 1000 / 64);
