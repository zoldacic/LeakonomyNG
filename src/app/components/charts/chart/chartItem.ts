export class ChartItem {
    date: Date;
    close: number;

    constructor(date: Date, close: number) {
        this.date = date;
        this.close = close;
    }
}