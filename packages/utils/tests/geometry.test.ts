import {
  pointFrom,
  lineSegment,
  polygon,
  pointOnLineSegment,
  pointOnPolygon,
  polygonIncludesPoint,
  segmentsIntersectAt,
} from "@excalidraw/math";

import type {
  GlobalPoint,
  LineSegment,
  Polygon,
  Radians,
} from "@excalidraw/math";

import {
  pointInEllipse,
  pointOnEllipse,
  type Ellipse,
  segmentIntersectRectangleElement,
} from "../src/shape";
import type { ExcalidrawRectangleElement } from "@excalidraw/element/types";

describe("point and line", () => {
  // const l: Line<GlobalPoint> = line(point(1, 0), point(1, 2));

  // it("point on left or right of line", () => {
  //   expect(pointLeftofLine(point(0, 1), l)).toBe(true);
  //   expect(pointLeftofLine(point(1, 1), l)).toBe(false);
  //   expect(pointLeftofLine(point(2, 1), l)).toBe(false);

  //   expect(pointRightofLine(point(0, 1), l)).toBe(false);
  //   expect(pointRightofLine(point(1, 1), l)).toBe(false);
  //   expect(pointRightofLine(point(2, 1), l)).toBe(true);
  // });

  const s: LineSegment<GlobalPoint> = lineSegment(
    pointFrom(1, 0),
    pointFrom(1, 2),
  );

  it("point on the line", () => {
    expect(pointOnLineSegment(pointFrom(0, 1), s)).toBe(false);
    expect(pointOnLineSegment(pointFrom(1, 1), s, 0)).toBe(true);
    expect(pointOnLineSegment(pointFrom(2, 1), s)).toBe(false);
  });
});

describe("point and polygon", () => {
  const poly: Polygon<GlobalPoint> = polygon(
    pointFrom(10, 10),
    pointFrom(50, 10),
    pointFrom(50, 50),
    pointFrom(10, 50),
  );

  it("point on polygon", () => {
    expect(pointOnPolygon(pointFrom(30, 10), poly)).toBe(true);
    expect(pointOnPolygon(pointFrom(50, 30), poly)).toBe(true);
    expect(pointOnPolygon(pointFrom(30, 50), poly)).toBe(true);
    expect(pointOnPolygon(pointFrom(10, 30), poly)).toBe(true);
    expect(pointOnPolygon(pointFrom(30, 30), poly)).toBe(false);
    expect(pointOnPolygon(pointFrom(30, 70), poly)).toBe(false);
  });

  it("point in polygon", () => {
    const poly: Polygon<GlobalPoint> = polygon(
      pointFrom(0, 0),
      pointFrom(2, 0),
      pointFrom(2, 2),
      pointFrom(0, 2),
    );
    expect(polygonIncludesPoint(pointFrom(1, 1), poly)).toBe(true);
    expect(polygonIncludesPoint(pointFrom(3, 3), poly)).toBe(false);
  });
});

describe("point and ellipse", () => {
  const ellipse: Ellipse<GlobalPoint> = {
    center: pointFrom(0, 0),
    angle: 0 as Radians,
    halfWidth: 2,
    halfHeight: 1,
  };

  it("point on ellipse", () => {
    [
      pointFrom(0, 1),
      pointFrom(0, -1),
      pointFrom(2, 0),
      pointFrom(-2, 0),
    ].forEach((p) => {
      expect(pointOnEllipse(p, ellipse)).toBe(true);
    });
    expect(pointOnEllipse(pointFrom(-1.4, 0.7), ellipse, 0.1)).toBe(true);
    expect(pointOnEllipse(pointFrom(-1.4, 0.71), ellipse, 0.01)).toBe(true);

    expect(pointOnEllipse(pointFrom(1.4, 0.7), ellipse, 0.1)).toBe(true);
    expect(pointOnEllipse(pointFrom(1.4, 0.71), ellipse, 0.01)).toBe(true);

    expect(pointOnEllipse(pointFrom(1, -0.86), ellipse, 0.1)).toBe(true);
    expect(pointOnEllipse(pointFrom(1, -0.86), ellipse, 0.01)).toBe(true);

    expect(pointOnEllipse(pointFrom(-1, -0.86), ellipse, 0.1)).toBe(true);
    expect(pointOnEllipse(pointFrom(-1, -0.86), ellipse, 0.01)).toBe(true);

    expect(pointOnEllipse(pointFrom(-1, 0.8), ellipse)).toBe(false);
    expect(pointOnEllipse(pointFrom(1, -0.8), ellipse)).toBe(false);
  });

  it("point in ellipse", () => {
    [
      pointFrom(0, 1),
      pointFrom(0, -1),
      pointFrom(2, 0),
      pointFrom(-2, 0),
    ].forEach((p) => {
      expect(pointInEllipse(p, ellipse)).toBe(true);
    });

    expect(pointInEllipse(pointFrom(-1, 0.8), ellipse)).toBe(true);
    expect(pointInEllipse(pointFrom(1, -0.8), ellipse)).toBe(true);

    expect(pointInEllipse(pointFrom(-1, 1), ellipse)).toBe(false);
    expect(pointInEllipse(pointFrom(-1.4, 0.8), ellipse)).toBe(false);
  });
});

describe("line and line", () => {
  const lineA: LineSegment<GlobalPoint> = lineSegment(
    pointFrom(1, 4),
    pointFrom(3, 4),
  );
  const lineB: LineSegment<GlobalPoint> = lineSegment(
    pointFrom(2, 1),
    pointFrom(2, 7),
  );
  const lineC: LineSegment<GlobalPoint> = lineSegment(
    pointFrom(1, 8),
    pointFrom(3, 8),
  );
  const lineD: LineSegment<GlobalPoint> = lineSegment(
    pointFrom(1, 8),
    pointFrom(3, 8),
  );
  const lineE: LineSegment<GlobalPoint> = lineSegment(
    pointFrom(1, 9),
    pointFrom(3, 9),
  );
  const lineF: LineSegment<GlobalPoint> = lineSegment(
    pointFrom(1, 2),
    pointFrom(3, 4),
  );
  const lineG: LineSegment<GlobalPoint> = lineSegment(
    pointFrom(0, 1),
    pointFrom(2, 3),
  );

  it("intersection", () => {
    expect(segmentsIntersectAt(lineA, lineB)).toEqual([2, 4]);
    expect(segmentsIntersectAt(lineA, lineC)).toBe(null);
    expect(segmentsIntersectAt(lineB, lineC)).toBe(null);
    expect(segmentsIntersectAt(lineC, lineD)).toBe(null); // Line overlapping line is not intersection!
    expect(segmentsIntersectAt(lineE, lineD)).toBe(null);
    expect(segmentsIntersectAt(lineF, lineG)).toBe(null);
  });
});

// Mock minimal element
const createMockElement = (
  overrides: Partial<ExcalidrawRectangleElement> = {},
): ExcalidrawRectangleElement => {
  return {
    type: "rectangle",
    x: 100,
    y: 100,
    width: 100,
    height: 100,
    angle: 0,
    roundness: null,
    backgroundColor: "transparent",
    strokeColor: "black",
    strokeWidth: 1,
    fillStyle: "solid",
    opacity: 100,
    roughness: 1,
    seed: 1,
    version: 1,
    versionNonce: 1,
    isDeleted: false,
    groupIds: [],
    frameId: null,
    boundElements: null,
    updated: 1,
    link: null,
    locked: false,
    strokeStyle: "solid",
    index: null,
    ...overrides,
  } as unknown as ExcalidrawRectangleElement;
};

describe("segmentIntersectRectangleElement", () => {
  it("intersects normal rectangle (no roundness)", () => {
    const element = createMockElement({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });
    // Segment passing through center horizontally
    const segment = lineSegment<GlobalPoint>(
      pointFrom(-50, 50),
      pointFrom(150, 50),
    );

    const intersections = segmentIntersectRectangleElement(element, segment);
    expect(intersections.length).toBe(2);
    // Should intersect at (0, 50) and (100, 50)
    const p1 = intersections.find((p) => Math.abs(p[0] - 0) < 0.01);
    const p2 = intersections.find((p) => Math.abs(p[0] - 100) < 0.01);
    expect(p1).toBeDefined();
    expect(p2).toBeDefined();
    expect(p1?.[1]).toBeCloseTo(50);
    expect(p2?.[1]).toBeCloseTo(50);
  });

  it("intersects rounded rectangle on straight sides", () => {
    const element = createMockElement({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      roundness: { type: 3 }, // ADAPTIVE_RADIUS, default 32px
    });

    // Segment passing through center horizontally
    const segment = lineSegment<GlobalPoint>(
      pointFrom(-50, 50),
      pointFrom(150, 50),
    );

    const intersections = segmentIntersectRectangleElement(element, segment);
    expect(intersections.length).toBe(2);
    // Should still intersect at (0, 50) and (100, 50) because these are on the straight vertical sides
    // With 100x100 and adaptive radius, radius is 25.
    // Vertical sides: x=0, y in [25, 75]. 50 is inside.
    const p1 = intersections.find((p) => Math.abs(p[0] - 0) < 0.01);
    const p2 = intersections.find((p) => Math.abs(p[0] - 100) < 0.01);
    expect(p1).toBeDefined();
    expect(p2).toBeDefined();
  });

  it("intersects rounded rectangle on corners (small element -> proportional radius)", () => {
    // Corner radius approx 32px (ADAPTIVE_RADIUS)
    // But width 100 is small (< 32/0.25 = 128), so it uses proportional radius.
    // Radius = 100 * 0.25 = 25.
    const element = createMockElement({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      roundness: { type: 3, value: 32 },
    });

    // Center of top-left arc: (25, 25). Radius 25.
    // Line y=x.
    // Intersection: x = 25 - 25/sqrt(2) = 25 - 17.677 = 7.322

    const segmentThroughSharpCorner = lineSegment<GlobalPoint>(
      pointFrom(-10, -10),
      pointFrom(10, 10),
    );

    const inters = segmentIntersectRectangleElement(
      element,
      segmentThroughSharpCorner,
    );

    expect(inters.length).toBe(1);
    expect(inters[0][0]).toBeCloseTo(7.32, 2);
    expect(inters[0][1]).toBeCloseTo(7.32, 2);
  });

  it("intersects rounded rectangle on corners (large element -> fixed radius)", () => {
    // Width 200 > 128. Radius should be 32.
    const element = createMockElement({
      x: 0,
      y: 0,
      width: 200,
      height: 200,
      roundness: { type: 3, value: 32 },
    });

    // Top-left corner center: (32, 32). Radius 32.
    // Line y=x.
    // Intersection: x = 32 - 32/sqrt(2) = 32 - 22.627 = 9.373

    const segment = lineSegment<GlobalPoint>(
      pointFrom(-10, -10),
      pointFrom(20, 20),
    );

    const inters = segmentIntersectRectangleElement(element, segment);

    expect(inters.length).toBe(1);
    expect(inters[0][0]).toBeCloseTo(9.37, 2);
    expect(inters[0][1]).toBeCloseTo(9.37, 2);
  });

  it("handles gap correctly", () => {
    // Width 200. Radius 32. Gap 10.
    // Effective radius = 32 + 10 = 42.
    // Effective bounds: x=-10, y=-10.
    // Top-left corner center: (-10 + 42, -10 + 42) = (32, 32).
    // Note: The corner center remains at the same global coordinate relative to the un-inflated shape's corner if using offset.
    // Wait, let's trace the logic.
    // x_new = 0 - 10 = -10.
    // y_new = 0 - 10 = -10.
    // r_new = 32 + 10 = 42.
    // Center of arc relative to new bounds: (x_new + r_new, y_new + r_new) = (-10 + 42, -10 + 42) = (32, 32).
    // Original corner center was (32, 32).
    // So the center of the arc stays the same!
    // But the radius increases to 42.
    // So the arc moves outward.

    // Line y=x.
    // Intersection with circle at (32, 32) radius 42.
    // (x-32)^2 + (y-32)^2 = 42^2
    // 2(x-32)^2 = 42^2
    // x-32 = -42/sqrt(2) = -29.698
    // x = 32 - 29.698 = 2.302

    const element = createMockElement({
      x: 0,
      y: 0,
      width: 200,
      height: 200,
      roundness: { type: 3, value: 32 },
    });

    const segment = lineSegment<GlobalPoint>(
      pointFrom(-10, -10),
      pointFrom(20, 20),
    );

    const inters = segmentIntersectRectangleElement(element, segment, 10);

    expect(inters.length).toBe(1);
    expect(inters[0][0]).toBeCloseTo(2.30, 2);
    expect(inters[0][1]).toBeCloseTo(2.30, 2);
  });
});
