import { PRECISION } from "./utils";

import type {
  Degrees,
  GlobalPoint,
  LocalPoint,
  PolarCoords,
  Radians,
} from "./types";

const TWO_PI = 2 * Math.PI;

/**
 * Normalizes an angle to be within the range [0, 2π).
 * Uses modulo arithmetic to handle angles outside the standard range,
 * including negative angles and angles larger than 4π.
 */
export const normalizeRadians = (angle: Radians): Radians => {
  // ((a % n) + n) % n ensures the result is always positive and within [0, n)
  return (((angle % TWO_PI) + TWO_PI) % TWO_PI) as Radians;
};

/**
 * Return the polar coordinates for the given cartesian point represented by
 * (x, y) for the center point 0,0 where the first number returned is the radius,
 * the second is the angle in radians.
 */
export const cartesian2Polar = <P extends GlobalPoint | LocalPoint>([
  x,
  y,
]: P): PolarCoords => [
  Math.hypot(x, y),
  normalizeRadians(Math.atan2(y, x) as Radians),
];

export function degreesToRadians(degrees: Degrees): Radians {
  return ((degrees * Math.PI) / 180) as Radians;
}

export function radiansToDegrees(degrees: Radians): Degrees {
  return ((degrees * 180) / Math.PI) as Degrees;
}

/**
 * Determines if the provided angle is a right angle.
 *
 * @param rads The angle to measure
 * @returns TRUE if the provided angle is a right angle
 */
export function isRightAngleRads(rads: Radians): boolean {
  return Math.abs(Math.sin(2 * rads)) < PRECISION;
}
