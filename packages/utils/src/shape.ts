/**
 * this file defines pure geometric shapes
 *
 * for instance, a cubic bezier curve is specified by its four control points and
 * an ellipse is defined by its center, angle, semi major axis and semi minor axis
 * (but in semi-width and semi-height so it's more relevant to Excalidraw)
 *
 * the idea with pure shapes is so that we can provide collision and other geoemtric methods not depending on
 * the specifics of roughjs or elements in Excalidraw; instead, we can focus on the pure shapes themselves
 *
 * also included in this file are methods for converting an Excalidraw element or a Drawable from roughjs
 * to pure shapes
 */
import { pointsOnBezierCurves } from "points-on-curve";

import {
  invariant,
  DEFAULT_PROPORTIONAL_RADIUS,
  DEFAULT_ADAPTIVE_RADIUS,
  ROUNDNESS,
} from "@excalidraw/common";
import {
  curve,
  lineSegment,
  pointFrom,
  pointDistance,
  pointFromArray,
  pointFromVector,
  pointRotateRads,
  polygon,
  polygonFromPoints,
  PRECISION,
  segmentsIntersectAt,
  vector,
  vectorAdd,
  vectorFromPoint,
  vectorScale,
  type GlobalPoint,
  type LocalPoint,
} from "@excalidraw/math";

import { getElementAbsoluteCoords } from "@excalidraw/element/bounds";

import type {
  ElementsMap,
  ExcalidrawBindableElement,
  ExcalidrawDiamondElement,
  ExcalidrawElement,
  ExcalidrawEllipseElement,
  ExcalidrawEmbeddableElement,
  ExcalidrawFrameLikeElement,
  ExcalidrawFreeDrawElement,
  ExcalidrawIframeElement,
  ExcalidrawImageElement,
  ExcalidrawLinearElement,
  ExcalidrawRectangleElement,
  ExcalidrawSelectionElement,
  ExcalidrawTextElement,
} from "@excalidraw/element/types";
import type { Curve, LineSegment, Polygon, Radians } from "@excalidraw/math";

import type { Drawable, Op } from "roughjs/bin/core";

// a polyline (made up term here) is a line consisting of other line segments
// this corresponds to a straight line element in the editor but it could also
// be used to model other elements
export type Polyline<Point extends GlobalPoint | LocalPoint> =
  LineSegment<Point>[];

// a polycurve is a curve consisting of ther curves, this corresponds to a complex
// curve on the canvas
export type Polycurve<Point extends GlobalPoint | LocalPoint> = Curve<Point>[];

// an ellipse is specified by its center, angle, and its major and minor axes
// but for the sake of simplicity, we've used halfWidth and halfHeight instead
// in replace of semi major and semi minor axes
export type Ellipse<Point extends GlobalPoint | LocalPoint> = {
  center: Point;
  angle: Radians;
  halfWidth: number;
  halfHeight: number;
};

export type GeometricShape<Point extends GlobalPoint | LocalPoint> =
  | {
      type: "line";
      data: LineSegment<Point>;
    }
  | {
      type: "polygon";
      data: Polygon<Point>;
    }
  | {
      type: "curve";
      data: Curve<Point>;
    }
  | {
      type: "ellipse";
      data: Ellipse<Point>;
    }
  | {
      type: "polyline";
      data: Polyline<Point>;
    }
  | {
      type: "polycurve";
      data: Polycurve<Point>;
    };

type RectangularElement =
  | ExcalidrawRectangleElement
  | ExcalidrawDiamondElement
  | ExcalidrawFrameLikeElement
  | ExcalidrawEmbeddableElement
  | ExcalidrawImageElement
  | ExcalidrawIframeElement
  | ExcalidrawTextElement
  | ExcalidrawSelectionElement;

// polygon
export const getPolygonShape = <Point extends GlobalPoint | LocalPoint>(
  element: RectangularElement,
): GeometricShape<Point> => {
  const { angle, width, height, x, y } = element;

  const cx = x + width / 2;
  const cy = y + height / 2;

  const center: Point = pointFrom(cx, cy);

  let data: Polygon<Point>;

  if (element.type === "diamond") {
    data = polygon(
      pointRotateRads(pointFrom(cx, y), center, angle),
      pointRotateRads(pointFrom(x + width, cy), center, angle),
      pointRotateRads(pointFrom(cx, y + height), center, angle),
      pointRotateRads(pointFrom(x, cy), center, angle),
    );
  } else {
    data = polygon(
      pointRotateRads(pointFrom(x, y), center, angle),
      pointRotateRads(pointFrom(x + width, y), center, angle),
      pointRotateRads(pointFrom(x + width, y + height), center, angle),
      pointRotateRads(pointFrom(x, y + height), center, angle),
    );
  }

  return {
    type: "polygon",
    data,
  };
};

// return the selection box for an element, possibly rotated as well
export const getSelectionBoxShape = <Point extends GlobalPoint | LocalPoint>(
  element: ExcalidrawElement,
  elementsMap: ElementsMap,
  padding = 10,
) => {
  let [x1, y1, x2, y2, cx, cy] = getElementAbsoluteCoords(
    element,
    elementsMap,
    true,
  );

  x1 -= padding;
  x2 += padding;
  y1 -= padding;
  y2 += padding;

  //const angleInDegrees = angleToDegrees(element.angle);
  const center = pointFrom(cx, cy);
  const topLeft = pointRotateRads(pointFrom(x1, y1), center, element.angle);
  const topRight = pointRotateRads(pointFrom(x2, y1), center, element.angle);
  const bottomLeft = pointRotateRads(pointFrom(x1, y2), center, element.angle);
  const bottomRight = pointRotateRads(pointFrom(x2, y2), center, element.angle);

  return {
    type: "polygon",
    data: [topLeft, topRight, bottomRight, bottomLeft],
  } as GeometricShape<Point>;
};

// ellipse
export const getEllipseShape = <Point extends GlobalPoint | LocalPoint>(
  element: ExcalidrawEllipseElement,
): GeometricShape<Point> => {
  const { width, height, angle, x, y } = element;

  return {
    type: "ellipse",
    data: {
      center: pointFrom(x + width / 2, y + height / 2),
      angle,
      halfWidth: width / 2,
      halfHeight: height / 2,
    },
  };
};

export const getCurvePathOps = (shape: Drawable): Op[] => {
  // NOTE (mtolmacs): Temporary fix for extremely large elements
  if (!shape) {
    return [];
  }

  for (const set of shape.sets) {
    if (set.type === "path") {
      return set.ops;
    }
  }
  return shape.sets[0].ops;
};

// linear
export const getCurveShape = <Point extends GlobalPoint | LocalPoint>(
  roughShape: Drawable,
  startingPoint: Point = pointFrom(0, 0),
  angleInRadian: Radians,
  center: Point,
): GeometricShape<Point> => {
  const transform = (p: Point): Point =>
    pointRotateRads(
      pointFrom(p[0] + startingPoint[0], p[1] + startingPoint[1]),
      center,
      angleInRadian,
    );

  const ops = getCurvePathOps(roughShape);
  const polycurve: Polycurve<Point> = [];
  let p0 = pointFrom<Point>(0, 0);

  for (const op of ops) {
    if (op.op === "move") {
      const p = pointFromArray<Point>(op.data);
      invariant(p != null, "Ops data is not a point");
      p0 = transform(p);
    }
    if (op.op === "bcurveTo") {
      const p1 = transform(pointFrom<Point>(op.data[0], op.data[1]));
      const p2 = transform(pointFrom<Point>(op.data[2], op.data[3]));
      const p3 = transform(pointFrom<Point>(op.data[4], op.data[5]));
      polycurve.push(curve<Point>(p0, p1, p2, p3));
      p0 = p3;
    }
  }

  return {
    type: "polycurve",
    data: polycurve,
  };
};

const polylineFromPoints = <Point extends GlobalPoint | LocalPoint>(
  points: Point[],
): Polyline<Point> => {
  let previousPoint: Point = points[0];
  const polyline: LineSegment<Point>[] = [];

  for (let i = 1; i < points.length; i++) {
    const nextPoint = points[i];
    polyline.push(lineSegment<Point>(previousPoint, nextPoint));
    previousPoint = nextPoint;
  }

  return polyline;
};

export const getFreedrawShape = <Point extends GlobalPoint | LocalPoint>(
  element: ExcalidrawFreeDrawElement,
  center: Point,
  isClosed: boolean = false,
): GeometricShape<Point> => {
  const transform = (p: Point) =>
    pointRotateRads(
      pointFromVector(
        vectorAdd(vectorFromPoint(p), vector(element.x, element.y)),
      ),
      center,
      element.angle,
    );

  const polyline = polylineFromPoints(
    element.points.map((p) => transform(p as Point)),
  );

  return (
    isClosed
      ? {
          type: "polygon",
          data: polygonFromPoints(polyline.flat()),
        }
      : {
          type: "polyline",
          data: polyline,
        }
  ) as GeometricShape<Point>;
};

export const getClosedCurveShape = <Point extends GlobalPoint | LocalPoint>(
  element: ExcalidrawLinearElement,
  roughShape: Drawable,
  startingPoint: Point = pointFrom<Point>(0, 0),
  angleInRadian: Radians,
  center: Point,
): GeometricShape<Point> => {
  const transform = (p: Point) =>
    pointRotateRads(
      pointFrom(p[0] + startingPoint[0], p[1] + startingPoint[1]),
      center,
      angleInRadian,
    );

  if (element.roundness === null) {
    return {
      type: "polygon",
      data: polygonFromPoints(
        element.points.map((p) => transform(p as Point)) as Point[],
      ),
    };
  }

  const ops = getCurvePathOps(roughShape);

  const points: Point[] = [];
  let odd = false;
  for (const operation of ops) {
    if (operation.op === "move") {
      odd = !odd;
      if (odd) {
        points.push(pointFrom(operation.data[0], operation.data[1]));
      }
    } else if (operation.op === "bcurveTo") {
      if (odd) {
        points.push(pointFrom(operation.data[0], operation.data[1]));
        points.push(pointFrom(operation.data[2], operation.data[3]));
        points.push(pointFrom(operation.data[4], operation.data[5]));
      }
    } else if (operation.op === "lineTo") {
      if (odd) {
        points.push(pointFrom(operation.data[0], operation.data[1]));
      }
    }
  }

  const polygonPoints = pointsOnBezierCurves(points, 10, 5).map((p) =>
    transform(p as Point),
  ) as Point[];

  return {
    type: "polygon",
    data: polygonFromPoints<Point>(polygonPoints),
  };
};

const getCornerRadius = (
  x: number,
  element: Pick<ExcalidrawRectangleElement, "roundness">,
) => {
  if (
    element.roundness?.type === ROUNDNESS.PROPORTIONAL_RADIUS ||
    element.roundness?.type === ROUNDNESS.LEGACY
  ) {
    return x * DEFAULT_PROPORTIONAL_RADIUS;
  }

  if (element.roundness?.type === ROUNDNESS.ADAPTIVE_RADIUS) {
    const fixedRadiusSize = element.roundness?.value ?? DEFAULT_ADAPTIVE_RADIUS;

    const CUTOFF_SIZE = fixedRadiusSize / DEFAULT_PROPORTIONAL_RADIUS;

    if (x <= CUTOFF_SIZE) {
      return x * DEFAULT_PROPORTIONAL_RADIUS;
    }

    return fixedRadiusSize;
  }

  return 0;
};

// Check intersection of a line segment with a circle arc
const intersectCircleSegment = <Point extends LocalPoint | GlobalPoint>(
  segment: LineSegment<Point>,
  center: Point,
  radius: number,
  startAngle: number,
  endAngle: number,
): Point[] => {
  const [p1, p2] = segment;
  const cx = center[0];
  const cy = center[1];

  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  const fx = p1[0] - cx;
  const fy = p1[1] - cy;

  const a = dx * dx + dy * dy;
  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - radius * radius;

  let discriminant = b * b - 4 * a * c;

  if (discriminant < 0) {
    return [];
  }

  discriminant = Math.sqrt(discriminant);
  const t1 = (-b - discriminant) / (2 * a);
  const t2 = (-b + discriminant) / (2 * a);

  const intersections: Point[] = [];

  const checkIntersection = (t: number) => {
    if (t >= 0 && t <= 1) {
      const ix = p1[0] + t * dx;
      const iy = p1[1] + t * dy;

      // Check if point is within arc angles
      // Angle of point relative to center
      let angle = Math.atan2(iy - cy, ix - cx);
      if (angle < 0) {
        angle += 2 * Math.PI;
      }

      // Normalize angles to [0, 2PI]
      let sa = startAngle;
      let ea = endAngle;

      // Handle wrapping
      // We assume the arc is small (< PI), so checking if angle is between start and end is easier if we align them.
      // But typically for rounded rects we have standard quadrants.
      // Top-Left: PI to 1.5PI (3.14 to 4.71)
      // Top-Right: 1.5PI to 2PI (4.71 to 6.28) OR (-PI/2 to 0)
      // Bottom-Right: 0 to 0.5PI (0 to 1.57)
      // Bottom-Left: 0.5PI to PI (1.57 to 3.14)

      // Normalize angle to [0, 2PI)
      const normalizedAngle = (angle + 2 * Math.PI) % (2 * Math.PI);
      const normalizedStart = (sa + 2 * Math.PI) % (2 * Math.PI);
      const normalizedEnd = (ea + 2 * Math.PI) % (2 * Math.PI);

      if (normalizedStart < normalizedEnd) {
        if (
          normalizedAngle >= normalizedStart - PRECISION &&
          normalizedAngle <= normalizedEnd + PRECISION
        ) {
          intersections.push(pointFrom(ix, iy) as Point);
        }
      } else {
        // Crossing 0
        if (
          normalizedAngle >= normalizedStart - PRECISION ||
          normalizedAngle <= normalizedEnd + PRECISION
        ) {
          intersections.push(pointFrom(ix, iy) as Point);
        }
      }
    }
  };

  checkIntersection(t1);
  if (Math.abs(t1 - t2) > PRECISION) {
    checkIntersection(t2);
  }

  return intersections;
};

/**
 * Determine intersection of a rectangular shaped element and a
 * line segment.
 *
 * @param element The rectangular element to test against
 * @param segment The segment intersecting the element
 * @param gap Optional value to inflate the shape before testing
 * @returns An array of intersections
 */
export const segmentIntersectRectangleElement = <
  Point extends LocalPoint | GlobalPoint,
>(
  element: ExcalidrawBindableElement,
  segment: LineSegment<Point>,
  gap: number = 0,
): Point[] => {
  const { width, height, angle } = element;
  const x = element.x - gap;
  const y = element.y - gap;
  const w = width + 2 * gap;
  const h = height + 2 * gap;

  const center = pointFrom(x + w / 2, y + h / 2);

  // Rotate segment points around the rectangle center by -angle to align with axis-aligned rectangle
  const p1 = pointRotateRads(segment[0], center, -angle as Radians);
  const p2 = pointRotateRads(segment[1], center, -angle as Radians);
  const localSegment = lineSegment(p1, p2);

  let radius =
    getCornerRadius(Math.min(element.width, element.height), element) + gap;

  // Clamp radius to not exceed dimensions
  const maxRadius = Math.min(w / 2, h / 2);
  if (radius > maxRadius) {
    radius = maxRadius;
  }

  const intersections: Point[] = [];

  if (radius === 0) {
    // Sharp rectangle
    const bounds = [x, y, x + w, y + h];
    const rectSegments = [
      lineSegment(pointFrom(x, y), pointFrom(x + w, y)),
      lineSegment(pointFrom(x + w, y), pointFrom(x + w, y + h)),
      lineSegment(pointFrom(x + w, y + h), pointFrom(x, y + h)),
      lineSegment(pointFrom(x, y + h), pointFrom(x, y)),
    ];

    rectSegments.forEach((s) => {
      const p = segmentsIntersectAt(localSegment, s as LineSegment<Point>);
      if (p) {
        intersections.push(p as Point);
      }
    });
  } else {
    // Rounded rectangle
    const r = radius;

    // 4 Straight Segments
    const segments = [
      // Top
      lineSegment(pointFrom(x + r, y), pointFrom(x + w - r, y)),
      // Right
      lineSegment(pointFrom(x + w, y + r), pointFrom(x + w, y + h - r)),
      // Bottom
      lineSegment(pointFrom(x + w - r, y + h), pointFrom(x + r, y + h)),
      // Left
      lineSegment(pointFrom(x, y + h - r), pointFrom(x, y + r)),
    ];

    segments.forEach((s) => {
      const p = segmentsIntersectAt(localSegment, s as LineSegment<Point>);
      if (p) {
        // Only add if not already added (though precise duplicates are rare with floats, logic suggests disjoint parts)
        intersections.push(p as Point);
      }
    });

    // 4 Corner Arcs
    const arcs = [
      // Top-Left: center (x+r, y+r), angles PI to 1.5PI (180 to 270 deg)
      {
        center: pointFrom(x + r, y + r),
        startAngle: Math.PI,
        endAngle: 1.5 * Math.PI,
      },
      // Top-Right: center (x+w-r, y+r), angles 1.5PI to 2PI
      {
        center: pointFrom(x + w - r, y + r),
        startAngle: 1.5 * Math.PI,
        endAngle: 2 * Math.PI,
      },
      // Bottom-Right: center (x+w-r, y+h-r), angles 0 to 0.5PI
      {
        center: pointFrom(x + w - r, y + h - r),
        startAngle: 0,
        endAngle: 0.5 * Math.PI,
      },
      // Bottom-Left: center (x+r, y+h-r), angles 0.5PI to PI
      {
        center: pointFrom(x + r, y + h - r),
        startAngle: 0.5 * Math.PI,
        endAngle: Math.PI,
      },
    ];

    arcs.forEach((arc) => {
      const pts = intersectCircleSegment(
        localSegment,
        arc.center as Point,
        r,
        arc.startAngle,
        arc.endAngle,
      );
      intersections.push(...(pts as Point[]));
    });
  }

  // Rotate intersections back to global coordinates
  return intersections.map((p) =>
    pointRotateRads(p, center, angle),
  ) as Point[];
};

const distanceToEllipse = <Point extends LocalPoint | GlobalPoint>(
  p: Point,
  ellipse: Ellipse<Point>,
) => {
  const { angle, halfWidth, halfHeight, center } = ellipse;
  const a = halfWidth;
  const b = halfHeight;
  const translatedPoint = vectorAdd(
    vectorFromPoint(p),
    vectorScale(vectorFromPoint(center), -1),
  );
  const [rotatedPointX, rotatedPointY] = pointRotateRads(
    pointFromVector(translatedPoint),
    pointFrom(0, 0),
    -angle as Radians,
  );

  const px = Math.abs(rotatedPointX);
  const py = Math.abs(rotatedPointY);

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

  const [minX, minY] = [
    a * tx * Math.sign(rotatedPointX),
    b * ty * Math.sign(rotatedPointY),
  ];

  return pointDistance(
    pointFrom(rotatedPointX, rotatedPointY),
    pointFrom(minX, minY),
  );
};

export const pointOnEllipse = <Point extends LocalPoint | GlobalPoint>(
  point: Point,
  ellipse: Ellipse<Point>,
  threshold = PRECISION,
) => {
  return distanceToEllipse(point, ellipse) <= threshold;
};

export const pointInEllipse = <Point extends LocalPoint | GlobalPoint>(
  p: Point,
  ellipse: Ellipse<Point>,
) => {
  const { center, angle, halfWidth, halfHeight } = ellipse;
  const translatedPoint = vectorAdd(
    vectorFromPoint(p),
    vectorScale(vectorFromPoint(center), -1),
  );
  const [rotatedPointX, rotatedPointY] = pointRotateRads(
    pointFromVector(translatedPoint),
    pointFrom(0, 0),
    -angle as Radians,
  );

  return (
    (rotatedPointX / halfWidth) * (rotatedPointX / halfWidth) +
      (rotatedPointY / halfHeight) * (rotatedPointY / halfHeight) <=
    1
  );
};

export const ellipseAxes = <Point extends LocalPoint | GlobalPoint>(
  ellipse: Ellipse<Point>,
) => {
  const widthGreaterThanHeight = ellipse.halfWidth > ellipse.halfHeight;

  const majorAxis = widthGreaterThanHeight
    ? ellipse.halfWidth * 2
    : ellipse.halfHeight * 2;
  const minorAxis = widthGreaterThanHeight
    ? ellipse.halfHeight * 2
    : ellipse.halfWidth * 2;

  return {
    majorAxis,
    minorAxis,
  };
};

export const ellipseFocusToCenter = <Point extends LocalPoint | GlobalPoint>(
  ellipse: Ellipse<Point>,
) => {
  const { majorAxis, minorAxis } = ellipseAxes(ellipse);

  return Math.sqrt(majorAxis ** 2 - minorAxis ** 2);
};

export const ellipseExtremes = <Point extends LocalPoint | GlobalPoint>(
  ellipse: Ellipse<Point>,
) => {
  const { center, angle } = ellipse;
  const { majorAxis, minorAxis } = ellipseAxes(ellipse);

  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const sqSum = majorAxis ** 2 + minorAxis ** 2;
  const sqDiff = (majorAxis ** 2 - minorAxis ** 2) * Math.cos(2 * angle);

  const yMax = Math.sqrt((sqSum - sqDiff) / 2);
  const xAtYMax =
    (yMax * sqSum * sin * cos) /
    (majorAxis ** 2 * sin ** 2 + minorAxis ** 2 * cos ** 2);

  const xMax = Math.sqrt((sqSum + sqDiff) / 2);
  const yAtXMax =
    (xMax * sqSum * sin * cos) /
    (majorAxis ** 2 * cos ** 2 + minorAxis ** 2 * sin ** 2);
  const centerVector = vectorFromPoint(center);

  return [
    vectorAdd(vector(xAtYMax, yMax), centerVector),
    vectorAdd(vectorScale(vector(xAtYMax, yMax), -1), centerVector),
    vectorAdd(vector(xMax, yAtXMax), centerVector),
    vectorAdd(vector(xMax, yAtXMax), centerVector),
  ];
};
