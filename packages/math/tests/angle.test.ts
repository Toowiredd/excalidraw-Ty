import { normalizeRadians } from "../src/angle";
import type { Radians } from "../src/types";

describe("normalizeRadians", () => {
  it("should normalize angles within [0, 2π)", () => {
    expect(normalizeRadians(0 as Radians)).toBeCloseTo(0);
    expect(normalizeRadians(Math.PI as Radians)).toBeCloseTo(Math.PI);
    expect(normalizeRadians((2 * Math.PI - 0.0001) as Radians)).toBeCloseTo(2 * Math.PI - 0.0001);
  });

  it("should normalize negative angles", () => {
    expect(normalizeRadians((-Math.PI) as Radians)).toBeCloseTo(Math.PI);
    expect(normalizeRadians((-2 * Math.PI) as Radians)).toBeCloseTo(0);
    expect(normalizeRadians((-3 * Math.PI) as Radians)).toBeCloseTo(Math.PI);
    expect(normalizeRadians((-4 * Math.PI) as Radians)).toBeCloseTo(0);
    expect(normalizeRadians((-5 * Math.PI) as Radians)).toBeCloseTo(Math.PI);
  });

  it("should normalize angles >= 2π", () => {
    expect(normalizeRadians((2 * Math.PI) as Radians)).toBeCloseTo(0);
    expect(normalizeRadians((3 * Math.PI) as Radians)).toBeCloseTo(Math.PI);
    expect(normalizeRadians((4 * Math.PI) as Radians)).toBeCloseTo(0);
    expect(normalizeRadians((5 * Math.PI) as Radians)).toBeCloseTo(Math.PI);
  });
});
