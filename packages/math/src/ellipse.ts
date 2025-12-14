import {
  pointFrom,
  pointDistance,
  pointFromVector,
  pointsEqual,
} from "./point";
import { PRECISION } from "./utils";
import {
  vector,
  vectorAdd,
  vectorDot,
  vectorFromPoint,
  vectorScale,
} from "./vector";

import type {
  Ellipse,
  GlobalPoint,
  Line,
  LineSegment,
  LocalPoint,
} from "./types";

/**
 * Construct an Ellipse object from the parameters
 *
 * @param center The center of the ellipse
 * @param halfWidth Half of the width of a non-slanted version of the ellipse
 * @param halfHeight Half of the height of a non-slanted version of the ellipse
 * @returns The constructed Ellipse object
 */
export function ellipse<Point extends GlobalPoint | LocalPoint>(
  center: Point,
  halfWidth: number,
  halfHeight: number,
): Ellipse<Point> {
  return {
    center,
    halfWidth,
    halfHeight,
  } as Ellipse<Point>;
}

/**
 * Determines if a point is inside or on the ellipse outline
 *
 * @param p The point to test
 * @param ellipse The ellipse to compare against
 * @returns TRUE if the point is inside or on the outline of the ellipse
 */
export function ellipseIncludesPoint<Point extends GlobalPoint | LocalPoint>(
  p: Point,
  ellipse: Ellipse<Point>,
): boolean {
  const { center, halfWidth, halfHeight } = ellipse;
  const normalizedX = (p[0] - center[0]) / halfWidth;
  const normalizedY = (p[1] - center[1]) / halfHeight;

  return normalizedX * normalizedX + normalizedY * normalizedY <= 1;
}

/**
 * Tests whether a point lies on the outline of the ellipse within a given
 * tolerance
 *
 * @param point The point to test
 * @param ellipse The ellipse to compare against
 * @param threshold The distance to consider a point close enough to be "on" the outline
 * @returns TRUE if the point is on the ellise outline
 */
export function ellipseTouchesPoint<Point extends GlobalPoint | LocalPoint>(
  point: Point,
  ellipse: Ellipse<Point>,
  threshold = PRECISION,
): boolean {
  return ellipseDistanceFromPoint(point, ellipse) <= threshold;
}

/**
 * Determine the shortest euclidean distance from a point to the
 * outline of the ellipse
 *
 * @param p The point to consider
 * @param ellipse The ellipse to calculate the distance to
 * @returns The eucledian distance
 */
export function ellipseDistanceFromPoint<
  Point extends GlobalPoint | LocalPoint,
>(
  p: Point,
  ellipse: Ellipse<Point>,
): number {
  const { halfWidth, halfHeight, center } = ellipse;
  const a = halfWidth;
  const b = halfHeight;

  // Translate point to ellipse center
  const px = Math.abs(p[0] - center[0]);
  const py = Math.abs(p[1] - center[1]);

  let tx = 0.707;
  let ty = 0.707;

  for (let i = 0; i < 3; i++) {
    const x = a * tx;
    const y = b * ty;

    const ex = ((a * a - b * b) * tx ** 3) / a;
    const ey = ((b * b - a * a) * ty ** 3) / b;

    const rx = x - ex;
    const ry = y - ey;

    const qx = px - ex;
    const qy = py - ey;

    const r = Math.hypot(ry, rx);
    const q = Math.hypot(qy, qx);

    tx = Math.min(1, Math.max(0, ((qx * r) / q + ex) / a));
    ty = Math.min(1, Math.max(0, ((qy * r) / q + ey) / b));
    const t = Math.hypot(ty, tx);
    tx /= t;
    ty /= t;
  }

  const minX = a * tx * Math.sign(p[0] - center[0]) + center[0];
  const minY = b * ty * Math.sign(p[1] - center[1]) + center[1];

  return pointDistance(p, pointFrom<Point>(minX, minY));
}

/**
 * Calculate a maximum of two intercept points for a line going throug an
 * ellipse.
 */
export function ellipseSegmentInterceptPoints<
  Point extends GlobalPoint | LocalPoint,
>(e: Readonly<Ellipse<Point>>, s: Readonly<LineSegment<Point>>): Point[] {
  const rx = e.halfWidth;
  const ry = e.halfHeight;

  // Transform segment to unit circle space relative to ellipse center
  const dir = vectorFromPoint(s[1], s[0]);
  const diff = vector(s[0][0] - e.center[0], s[0][1] - e.center[1]);
  const mDir = vector(dir[0] / (rx * rx), dir[1] / (ry * ry));
  const mDiff = vector(diff[0] / (rx * rx), diff[1] / (ry * ry));

  const a = vectorDot(dir, mDir);
  const b = vectorDot(dir, mDiff);
  const c = vectorDot(diff, mDiff) - 1.0;
  const d = b * b - a * c;

  const intersections: Point[] = [];

  if (d > 0) {
    const sqrtD = Math.sqrt(d);
    const t_a = (-b - sqrtD) / a;
    const t_b = (-b + sqrtD) / a;

    if (0 <= t_a && t_a <= 1) {
      intersections.push(
        pointFrom(
          s[0][0] + (s[1][0] - s[0][0]) * t_a,
          s[0][1] + (s[1][1] - s[0][1]) * t_a,
        ),
      );
    }

    if (0 <= t_b && t_b <= 1) {
      intersections.push(
        pointFrom(
          s[0][0] + (s[1][0] - s[0][0]) * t_b,
          s[0][1] + (s[1][1] - s[0][1]) * t_b,
        ),
      );
    }
  } else if (Math.abs(d) < PRECISION) {
    const t = -b / a;
    if (0 <= t && t <= 1) {
      intersections.push(
        pointFrom(
          s[0][0] + (s[1][0] - s[0][0]) * t,
          s[0][1] + (s[1][1] - s[0][1]) * t,
        ),
      );
    }
  }

  return intersections;
}

export function ellipseLineIntersectionPoints<
  Point extends GlobalPoint | LocalPoint,
>(
  { center, halfWidth, halfHeight }: Ellipse<Point>,
  [g, h]: Line<Point>,
): Point[] {
  const [cx, cy] = center;
  const x1 = g[0] - cx;
  const y1 = g[1] - cy;
  const x2 = h[0] - cx;
  const y2 = h[1] - cy;

  const hw2 = halfWidth * halfWidth;
  const hh2 = halfHeight * halfHeight;

  const dx = x2 - x1;
  const dy = y2 - y1;

  const a = (dx * dx) / hw2 + (dy * dy) / hh2;
  const b = 2 * ((x1 * dx) / hw2 + (y1 * dy) / hh2);
  const c = (x1 * x1) / hw2 + (y1 * y1) / hh2 - 1;

  const delta = b * b - 4 * a * c;

  if (delta < 0) {
    return [];
  }

  const sqrtDelta = Math.sqrt(delta);
  const t1 = (-b + sqrtDelta) / (2 * a);
  const t2 = (-b - sqrtDelta) / (2 * a);

  const candidates = [
    pointFrom<Point>(x1 + t1 * dx + cx, y1 + t1 * dy + cy),
    pointFrom<Point>(x1 + t2 * dx + cx, y1 + t2 * dy + cy),
  ].filter((p) => !isNaN(p[0]) && !isNaN(p[1]));

  if (candidates.length === 2 && pointsEqual(candidates[0], candidates[1])) {
    return [candidates[0]];
  }

  return candidates;
}
