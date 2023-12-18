import moment from 'moment';

class TimeManagerService {

    deltaTime = 0.006;
    lastTimeStamp = moment().valueOf();

    public logic(): void {
        this.deltaTime = (moment().valueOf() - this.lastTimeStamp) / 1000;
        this.lastTimeStamp = moment().valueOf();
    }
}

export const timeManagerService = new TimeManagerService();
