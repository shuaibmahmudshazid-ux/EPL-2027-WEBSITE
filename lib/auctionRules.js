export const DEFAULT_TEAM_POINTS = 10000;
export const PLAYERS_PER_TIER = 5;

/**
 * Tournament Progressive Bid Increments:
 * - Till 1,000 PTS: +50 for each bid
 * - Till 2,000 PTS: +100 for each bid
 * - Till 3,000 PTS: +200 for each bid
 * - Till 4,000 PTS: +250 for each bid
 * - Above 4,000 PTS: +500 for each bid
 */
export const getBidIncrement = (currentBid) => {
  const bid = Number(currentBid) || 0;
  if (bid < 1000) return 50;
  if (bid < 2000) return 100;
  if (bid < 3000) return 200;
  if (bid < 4000) return 250;
  return 500;
};

/**
 * Calculates next minimum bid:
 * - If no bids yet: returns basePrice
 * - Otherwise: currentBid + progressive increment
 */
export const calculateNextBid = (currentBid, basePrice = 0) => {
  const effectiveBase = Number(basePrice) > 0 ? Number(basePrice) : 250;
  const curr = Number(currentBid) || 0;
  if (curr <= 0) {
    return effectiveBase;
  }
  return curr + getBidIncrement(curr);
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
  return Number(fallbackBasePrice) > 0 ? Number(fallbackBasePrice) : 250;
};
