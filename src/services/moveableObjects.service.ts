import Matter from 'matter-js';
import { WSMovableObjectPacket } from '../types/WSPacket.type';
import { connectionManagerService } from './connectionManager.service';

class MoveableObjectService {
    objects: Matter.Body[] = [];

    public sendObjectPackets(): void {
        for (const object of this.objects) {
            // if (Math.abs(object.velocity.x) > 0.1 || Math.abs(object.velocity.y) > 0.1) {
            // put logic in here if too many packets are being sent out
            // }
            const packet = {
                moveableObjectlabel: object.label,
                position: object.position,
                velocity: object.velocity
            };
            this.broadcastObjectUpdate(packet);
        }
    }

    private broadcastObjectUpdate(packet: WSMovableObjectPacket): void {
        for (const ws of connectionManagerService.connections) {
            ws.send(JSON.stringify(packet));
        }
    }
}

export const moveableObjectService = new MoveableObjectService();
