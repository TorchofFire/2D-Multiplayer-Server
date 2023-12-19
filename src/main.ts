import Matter from 'matter-js';
import { timeManagerService } from './services/timeManager.service';
import { mapService } from './services/map.service';
import { WebSocketServer } from 'ws';
import figlet from 'figlet';
import { WSPlayerPacket } from './types/WSPacket.type';
import { connectionManagerService } from './services/connectionManager.service';
import { playersService } from './services/players.service';
require('dotenv').config();

console.log('starting server...');

figlet.text('Multiplayer Server', { font: 'Big', whitespaceBreak: true }, (err, data) => {
    if (err) return;
    console.log(data);
    console.log('Version 0.0.1 | by Torch');
});

const engine = Matter.Engine.create();
export const world = engine.world;
engine.gravity.y = 0.5;

mapService.createLevel();

const wss = new WebSocketServer({ host: process.env.IP, port: Number(process.env.PORT) });
console.log(`listening on ${`${wss.options.host}:${wss.options.port}`}`);

wss.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress;
    console.log(`Client connected | IP: ${ip}`);
    if (!ip) {
        ws.close();
        return;
    }
    connectionManagerService.addNewConnection(ip, ws);
    playersService.newPlayer(ip);

    ws.on('message', message => {
        const packet = JSON.parse(`${message}`) as WSPlayerPacket;
        playersService.updatePlayer(ip, packet);
    });

    ws.on('close', () => {
        connectionManagerService.removeConnection(ip);
        playersService.removePlayer(ip);
        console.log('Client disconnected');
    });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const gameLoop = setInterval(() => {
    timeManagerService.logic();
    Matter.Engine.update(engine);

}, 1000 / 64);
