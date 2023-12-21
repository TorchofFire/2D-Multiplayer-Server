import readline from 'readline';
import { messageService } from './message.service';
import { chalkNeutral } from '../helpers';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: ''
});

class ServerCommandService {
    public init(): void {
        rl.on('line', line => {
            this.parseCommand(line.trim());
        });
    }

    private parseCommand(command: string): void {
        const [action, ...args] = command.split(' ');
        if (action === 'say') {
            this.sayCommand(args.join(' '));
        }
        // add help
    }

    private sayCommand(message: string): void {
        messageService.broadcastMessage('Server', message);
        console.log(chalkNeutral(`[Server]: ${message}`));
    }
}

export const serverCommandService = new ServerCommandService();
