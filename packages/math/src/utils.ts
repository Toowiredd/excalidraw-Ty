export const PRECISION = 10e-5;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function round(
  value: number,
  precision: number,
  func: "round" | "floor" | "ceil" = "round",
): number {
  const multiplier = Math.pow(10, precision);

  return Math[func]((value + Number.EPSILON) * multiplier) / multiplier;
}

export function roundToStep(
  value: number,
  step: number,
  func: "round" | "floor" | "ceil" = "round",
): number {
  const factor = 1 / step;
  return Math[func](value * factor) / factor;
}

export function average(a: number, b: number): number {
  return (a + b) / 2;
}

export function isFiniteNumber(value: any): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function isCloseTo(
  a: number,
  b: number,
  precision = PRECISION,
): boolean {
  return Math.abs(a - b) < precision;
}
