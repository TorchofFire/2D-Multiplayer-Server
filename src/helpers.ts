import chalk from 'chalk';

export function degreeToRadian(degree: number): number {
    return degree * (Math.PI / 180);
}

export function chalkDanger(msg: string | undefined): string {
    return chalk.redBright(msg);
}
export function chalkSuccess(msg: string | undefined): string {
    return chalk.greenBright(msg);
}
export function chalkImportant(msg: string | undefined): string {
    return chalk.blueBright(msg);
}
export function chalkNeutral(msg: string | undefined): string {
    return chalk.cyanBright(msg);
}
