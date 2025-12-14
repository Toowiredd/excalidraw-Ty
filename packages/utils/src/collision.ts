import {
  lineSegment,
  pointFrom,
  polygonIncludesPoint,
  pointOnLineSegment,
  pointOnPolygon,
  polygonFromPoints,
  type GlobalPoint,
  type LocalPoint,
  type Polygon,
} from "@excalidraw/math";

import type { Curve } from "@excalidraw/math";

import { pointInEllipse, pointOnEllipse } from "./shape";

import type { Polycurve, Polyline, GeometricShape } from "./shape";

// check if the given point is considered on the given shape's border
export function isPointOnShape<Point extends GlobalPoint | LocalPoint>(
  point: Point,
  shape: GeometricShape<Point>,
  tolerance = 0,
): boolean {
  // get the distance from the given point to the given element
  // check if the distance is within the given epsilon range
  switch (shape.type) {
    case "polygon":
      return pointOnPolygon(point, shape.data, tolerance);
    case "ellipse":
      return pointOnEllipse(point, shape.data, tolerance);
    case "line":
      return pointOnLineSegment(point, shape.data, tolerance);
    case "polyline":
      return pointOnPolyline(point, shape.data, tolerance);
    case "curve":
      return pointOnCurve(point, shape.data, tolerance);
    case "polycurve":
      return pointOnPolycurve(point, shape.data, tolerance);
    default:
      throw Error(`Shape type ${(shape as any).type} is not implemented`);
  }
}

// check if the given point is considered inside the element's border
export function isPointInShape<Point extends GlobalPoint | LocalPoint>(
  point: Point,
  shape: GeometricShape<Point>,
): boolean {
  switch (shape.type) {
    case "polygon":
      return polygonIncludesPoint(point, shape.data);
    case "line":
      return false;
    case "curve":
      return false;
    case "ellipse":
      return pointInEllipse(point, shape.data);
    case "polyline": {
      const polygon = polygonFromPoints(shape.data.flat());
      return polygonIncludesPoint(point, polygon);
    }
    case "polycurve": {
      return false;
    }
    default:
      throw Error(`Shape type ${(shape as any).type} is not implemented`);
  }
}

// check if the given element is in the given bounds
export function isPointInBounds<Point extends GlobalPoint | LocalPoint>(
  point: Point,
  bounds: Polygon<Point>,
): boolean {
  return polygonIncludesPoint(point, bounds);
}

function pointOnPolycurve<Point extends LocalPoint | GlobalPoint>(
  point: Point,
  polycurve: Polycurve<Point>,
  tolerance: number,
): boolean {
  return polycurve.some((curve) => pointOnCurve(point, curve, tolerance));
}

function cubicBezierEquation<Point extends LocalPoint | GlobalPoint>(
  curve: Curve<Point>,
) {
  const [p0, p1, p2, p3] = curve;
  // B(t) = p0 * (1-t)^3 + 3p1 * t * (1-t)^2 + 3p2 * t^2 * (1-t) + p3 * t^3
  return (t: number, idx: number) => {
    const oneMinusT = 1 - t;
    return (
      Math.pow(oneMinusT, 3) * p0[idx] +
      3 * t * Math.pow(oneMinusT, 2) * p1[idx] +
      3 * Math.pow(t, 2) * oneMinusT * p2[idx] +
      p3[idx] * Math.pow(t, 3)
    );
  };
}

function polyLineFromCurve<Point extends LocalPoint | GlobalPoint>(
  curve: Curve<Point>,
  segments = 10,
): Polyline<Point> {
  const equation = cubicBezierEquation(curve);
  let startingPoint = [equation(0, 0), equation(0, 1)] as Point;
  const lineSegments: Polyline<Point> = [];
  let t = 0;
  const increment = 1 / segments;

  for (let i = 0; i < segments; i++) {
    t += increment;
    // Cap t at 1 to avoid floating point errors
    if (t > 1) {
      t = 1;
    }

    const nextPoint: Point = pointFrom(equation(t, 0), equation(t, 1));
    lineSegments.push(lineSegment(startingPoint, nextPoint));
    startingPoint = nextPoint;
  }

  return lineSegments;
}

export function pointOnCurve<Point extends LocalPoint | GlobalPoint>(
  point: Point,
  curve: Curve<Point>,
  threshold: number,
): boolean {
  return pointOnPolyline(point, polyLineFromCurve(curve), threshold);
}

export function pointOnPolyline<Point extends LocalPoint | GlobalPoint>(
  point: Point,
  polyline: Polyline<Point>,
  threshold = 10e-5,
): boolean {
  return polyline.some((line) => pointOnLineSegment(point, line, threshold));
}
