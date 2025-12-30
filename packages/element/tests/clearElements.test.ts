
import {
  ExcalidrawElement,
  ExcalidrawRectangleElement,
  ExcalidrawLinearElement,
} from "../src/types";
import { clearElementsForExport } from "../src/index";
import { newElement } from "../src/newElement";

describe("clearElementsForExport", () => {
  it("should remove invisible elements", () => {
    const visibleRect: ExcalidrawRectangleElement = {
      ...newElement({ type: "rectangle" }),
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      isDeleted: false,
    };

    const invisibleRect: ExcalidrawRectangleElement = {
      ...newElement({ type: "rectangle" }),
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      isDeleted: false,
    };

    const elements: ExcalidrawElement[] = [visibleRect, invisibleRect];
    const clearedElements = clearElementsForExport(elements);

    expect(clearedElements).toHaveLength(1);
    expect(clearedElements[0].id).toBe(visibleRect.id);
  });

  it("should remove invisible linear elements (1 point)", () => {
    const visibleLinear: ExcalidrawLinearElement = {
      ...newElement({ type: "line" }),
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      points: [[0, 0], [100, 100]],
      isDeleted: false,
    };

    const invisibleLinear: ExcalidrawLinearElement = {
        ...newElement({ type: "line" }),
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        points: [[0, 0]],
        isDeleted: false,
    };

    const elements: ExcalidrawElement[] = [visibleLinear, invisibleLinear];
    const clearedElements = clearElementsForExport(elements);

    expect(clearedElements).toHaveLength(1);
    expect(clearedElements[0].id).toBe(visibleLinear.id);
  });
});
