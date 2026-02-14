/**
 * IST (Indian Standard Time) related date utilities
 * IST is UTC + 5:30
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/**
 * Returns the start of the day in IST for the given date, represented as a Date object.
 * The returned Date object will point to 00:00:00 IST of that day.
 * 
 * Example:
 * Input (UTC): 2026-02-14T15:00:00Z (Feb 14, 8:30 PM IST)
 * Output (UTC): 2026-02-13T18:30:00Z (Feb 14, 00:00:00 IST)
 * 
 * Example 2:
 * Input (UTC): 2026-02-14T20:00:00Z (Feb 15, 1:30 AM IST)
 * Output (UTC): 2026-02-14T18:30:00Z (Feb 15, 00:00:00 IST)
 */
export function getStartOfISTDay(date: Date = new Date()): Date {
    // 1. Get current time in UTC milliseconds
    const now = date.getTime();

    // 2. Add IST offset to shift "IST time" into the UTC slot
    const istTime = new Date(now + IST_OFFSET_MS);

    // 3. Zero out the time components to get start of day
    istTime.setUTCHours(0, 0, 0, 0);

    // 4. Subtract the offset to get back to the actual UTC timestamp of that IST start-of-day
    return new Date(istTime.getTime() - IST_OFFSET_MS);
}

/**
 * Returns the "current" date in IST (time components ignored/irrelevant if just checking date).
 * Useful for display or non-strict checking.
 */
export function getISTDate(date: Date = new Date()): Date {
    return new Date(date.getTime() + IST_OFFSET_MS);
}
