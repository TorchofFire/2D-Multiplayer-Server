import Matter from 'matter-js';
import { timeManagerService } from './services/timeManager.service';
import { mapService } from './services/map.service';
import { WebSocketServer } from 'ws';
import figlet from 'figlet';

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

const wss = new WebSocketServer({ host: '', port: 8080 });
console.log(`listening on ${`${wss.options.host}:${wss.options.port}`}`);

wss.on('connection', ws => {
    console.log('Client connected');

    ws.on('message', message => {
        console.log(`Received message: ${message}`);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const gameLoop = setInterval(() => {
    timeManagerService.logic();
    Matter.Engine.update(engine);

}, 1000 / 64);
