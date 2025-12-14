import { PRECISION } from "./utils";

import type {
  Degrees,
  GlobalPoint,
  LocalPoint,
  PolarCoords,
  Radians,
} from "./types";

// TODO: Simplify with modulo and fix for angles beyond 4*Math.PI and - 4*Math.PI
export function normalizeRadians(angle: Radians): Radians {
  // Normalize to [0, 2PI)
  return ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) as Radians;
}

/**
 * Return the polar coordinates for the given cartesian point represented by
 * (x, y) for the center point 0,0 where the first number returned is the radius,
 * the second is the angle in radians.
 */
export function cartesianToPolar<P extends GlobalPoint | LocalPoint>([
  x,
  y,
]: P): PolarCoords {
  return [Math.hypot(x, y), normalizeRadians(Math.atan2(y, x) as Radians)];
}

// Alias for backward compatibility if needed, but preferable to use standard naming
export const cartesian2Polar = cartesianToPolar;

export function degreesToRadians(degrees: Degrees): Radians {
  return ((degrees * Math.PI) / 180) as Radians;
}

export function radiansToDegrees(radians: Radians): Degrees {
  return ((radians * 180) / Math.PI) as Degrees;
}

/**
 * Determines if the provided angle is a right angle (multiple of 90 degrees).
 *
 * @param angle The angle to measure
 * @returns TRUE if the provided angle is a multiple of 90 degrees (0, PI/2, PI, 3PI/2...)
 */
export function isRightAngle(angle: Radians): boolean {
  // Checks if sin(2*angle) is close to 0.
  // sin(2*0) = 0
  // sin(2*PI/2) = sin(PI) = 0
  // sin(2*PI) = 0
  return Math.abs(Math.sin(2 * angle)) < PRECISION;
}

// Alias for backward compatibility
export const isRightAngleRads = isRightAngle;
