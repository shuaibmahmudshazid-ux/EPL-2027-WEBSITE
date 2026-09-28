export const DEFAULT_TEAM_POINTS = 50000;
export const BID_THRESHOLD = 10000;
export const BID_STEP_LOW = 500;
export const BID_STEP_HIGH = 2000;
export const PLAYERS_PER_TIER = 5;

/**
 * Calculates next minimum bid:
 * - If no bids yet: returns basePrice (or minimum 500)
 * - If current bid < 10,000: raises by 500
 * - If current bid >= 10,000: raises by 2,000
 */
export const calculateNextBid = (currentBid, basePrice = 0) => {
  const effectiveBase = Number(basePrice) > 0 ? Number(basePrice) : 500;
  if (!currentBid || currentBid <= 0) {
    return effectiveBase;
  }
  if (currentBid < BID_THRESHOLD) {
    return currentBid + BID_STEP_LOW;
  }
  return currentBid + BID_STEP_HIGH;
};

/**
 * Calculates base price for the 5th player in a tier:
 * Average of the 3rd and 4th bidded/sold players' prices.
 */
export const calculateFifthPlayerBasePrice = (price3, price4, fallbackBasePrice = 0) => {
  const p3 = Number(price3);
  const p4 = Number(price4);

  const hasP3 = !isNaN(p3) && p3 > 0;
  const hasP4 = !isNaN(p4) && p4 > 0;

  if (hasP3 && hasP4) {
    return Math.round((p3 + p4) / 2);
  }
  if (hasP3) return p3;
  if (hasP4) return p4;
  return Number(fallbackBasePrice) > 0 ? Number(fallbackBasePrice) : 500;
};
