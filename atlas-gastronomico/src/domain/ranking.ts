/**
 * Bayesian average rating.
 *   score = (v/(v+m))*R + (m/(v+m))*C
 * R = recipe average, v = recipe vote count,
 * m = min votes to "trust", C = global mean rating.
 */
export function computeBayesian(
  ratingAvg: number,
  ratingCount: number,
  m: number,
  C: number,
): number {
  const v = ratingCount;
  if (v + m === 0) return C;
  return (v / (v + m)) * ratingAvg + (m / (v + m)) * C;
}
