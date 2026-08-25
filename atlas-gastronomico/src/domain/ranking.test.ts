import { describe, it, expect } from "vitest";
import { computeBayesian } from "./ranking";

describe("computeBayesian", () => {
  const m = 20;   // min votes threshold
  const C = 4.0;  // global mean

  it("pulls a low-vote perfect score toward the global mean", () => {
    // 1 vote of 5.0 should NOT beat a well-established 4.8
    const fewVotes = computeBayesian(5.0, 1, m, C);
    const manyVotes = computeBayesian(4.8, 200, m, C);
    expect(manyVotes).toBeGreaterThan(fewVotes);
  });

  it("approaches the raw average as vote count grows", () => {
    const score = computeBayesian(4.8, 100000, m, C);
    expect(score).toBeCloseTo(4.8, 2);
  });

  it("returns the global mean when there are zero votes", () => {
    expect(computeBayesian(0, 0, m, C)).toBeCloseTo(C, 5);
  });
});
