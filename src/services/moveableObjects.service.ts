import Matter from 'matter-js';
import { WSMovableObjectPacket } from '../types/WSPacket.type';
import { connectionManagerService } from './connectionManager.service';
import { timeManagerService } from './timeManager.service';

class MoveableObjectService {
    objects: Matter.Body[] = [];
    timeTillNextUpdate = 0;

    public sendObjectPackets(rate: number): void {
        this.timeTillNextUpdate -= timeManagerService.deltaTime;
        if (this.timeTillNextUpdate > 0) return;
        this.timeTillNextUpdate = rate;

        const packet: WSMovableObjectPacket = { moveableObjects: [] };
        for (const object of this.objects) {
            if (Math.abs(object.velocity.x) < 0.01 && Math.abs(object.velocity.y) < 0.01) {
                continue;
            }
            packet.moveableObjects.push({
                label: object.label,
                position: object.position,
                velocity: object.velocity
            });
        }

        this.broadcastObjectUpdate(packet);
    }

    private broadcastObjectUpdate(packet: WSMovableObjectPacket): void {
        for (const ws of connectionManagerService.connections) {
            ws.send(JSON.stringify(packet));
        }
    }
}

export const moveableObjectService = new MoveableObjectService();
