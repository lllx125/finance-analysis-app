export type Ticker = {
    symbol: string;
    data: DailyData[];
};

export type DailyData = {
    Date: Date;
    Price: number;
};
