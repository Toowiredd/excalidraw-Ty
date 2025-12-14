import {
  vectorCross,
  vectorFromPoint,
  type GlobalPoint,
  type LocalPoint,
} from "@excalidraw/math";

import type { Bounds } from "@excalidraw/element/bounds";

export type LineSegment<P extends LocalPoint | GlobalPoint> = [P, P];

export function getBBox<P extends LocalPoint | GlobalPoint>(
  line: LineSegment<P>,
): Bounds {
  return [
    Math.min(line[0][0], line[1][0]),
    Math.min(line[0][1], line[1][1]),
    Math.max(line[0][0], line[1][0]),
    Math.max(line[0][1], line[1][1]),
  ];
}

export function doBBoxesIntersect(a: Bounds, b: Bounds): boolean {
  return a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1];
}

const EPSILON = 0.000001;

/**
 * Checks if a point is colinear with a line segment.
 * Warning: This does not check if the point is *on* the segment, only if it lies on the infinite line defined by the segment.
 */
export function isPointOnLine<P extends GlobalPoint | LocalPoint>(
  line: LineSegment<P>,
  point: P,
): boolean {
  const vecA = vectorFromPoint(line[1], line[0]);
  const vecB = vectorFromPoint(point, line[0]);

  const crossProduct = vectorCross(vecA, vecB);

  return Math.abs(crossProduct) < EPSILON;
}

export function isPointRightOfLine<P extends GlobalPoint | LocalPoint>(
  line: LineSegment<P>,
  point: P,
): boolean {
  const vecA = vectorFromPoint(line[1], line[0]);
  const vecB = vectorFromPoint(point, line[0]);

  return vectorCross(vecA, vecB) < 0;
}

export function isLineSegmentTouchingOrCrossingLine<
  P extends GlobalPoint | LocalPoint,
>(segmentA: LineSegment<P>, segmentB: LineSegment<P>): boolean {
  return (
    isPointOnLine(segmentA, segmentB[0]) ||
    isPointOnLine(segmentA, segmentB[1]) ||
    (isPointRightOfLine(segmentA, segmentB[0])
      ? !isPointRightOfLine(segmentA, segmentB[1])
      : isPointRightOfLine(segmentA, segmentB[1]))
  );
}

// https://martin-thoma.com/how-to-check-if-two-line-segments-intersect/
export function doLineSegmentsIntersect<P extends GlobalPoint | LocalPoint>(
  segmentA: LineSegment<P>,
  segmentB: LineSegment<P>,
): boolean {
  return (
    doBBoxesIntersect(getBBox(segmentA), getBBox(segmentB)) &&
    isLineSegmentTouchingOrCrossingLine(segmentA, segmentB) &&
    isLineSegmentTouchingOrCrossingLine(segmentB, segmentA)
  );
}
