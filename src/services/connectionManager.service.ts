import { WebSocket } from 'ws';

class ConnectionManagerService {
    connections: WebSocket[] = [];
    connectionMap: Map<string, WebSocket> = new Map();

    public addNewConnection(ip: string, ws: WebSocket): void {
        if (this.connectionMap.has(ip)) return;
        this.connections.push(ws);
        this.connectionMap.set(ip, ws);
    }

    public removeConnection(ip: string, reason?: string): void {
        const removedConnection = this.connectionMap.get(ip);
        if (!removedConnection) return;
        if (removedConnection.OPEN) removedConnection.close(1000, reason);
        this.connections = this.connections.filter(ws => ws !== removedConnection);
        this.connectionMap.delete(ip);
    }
}

export const connectionManagerService = new ConnectionManagerService();
