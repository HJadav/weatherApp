

export const GOOGLE_PLACES_API_KEY = 'AIzaSyCji4dII_1_GPrdqcXtcTrjf5U-DONnhXM';

export const formattedPastDate = () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 7);
    return pastDate.toISOString().split('T')[0];
}
export const formattedCurrentDate = () => {
    const current = new Date();
    return current.toISOString().split('T')[0];
}
export const formattedNextDay = () => {
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.toISOString().split('T')[0];
};
export const formattedNextDate = () => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 7);
    return nextDate.toISOString().split('T')[0];
}