import { arrayToMap } from "@excalidraw/common";
import { pointFrom } from "@excalidraw/math";

import { getSuggestedBindingsForArrows } from "../src/binding";
import { newElement, newArrowElement } from "../src/newElement";

describe("getSuggestedBindingsForArrows", () => {
  it("should remove duplicates from suggested bindings", () => {
    const rect = newElement({
      type: "rectangle",
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });

    // Arrow 1 pointing to rect from right
    const arrow1 = newArrowElement({
      type: "arrow",
      x: 120,
      y: 50,
      width: 20,
      height: 1,
      points: [pointFrom(0, 0), pointFrom(-20, 0)],
    });
    // Manually set binding as newArrowElement resets it
    arrow1.endBinding = { elementId: rect.id, focus: 0, gap: 0 };

    // Arrow 2 pointing to rect from right, slightly below
    const arrow2 = newArrowElement({
      type: "arrow",
      x: 120,
      y: 60,
      width: 20,
      height: 1,
      points: [pointFrom(0, 0), pointFrom(-20, 0)],
    });
    arrow2.endBinding = { elementId: rect.id, focus: 0, gap: 0 };

    const elements = [rect, arrow1, arrow2];
    const elementsMap = arrayToMap(elements);
    const selectedElements = [arrow1, arrow2];

    const result = getSuggestedBindingsForArrows(
      selectedElements,
      elementsMap,
      { value: 1 } as any, // mock zoom
    );

    // Expect duplicates to be removed
    // Currently (before fix) it likely returns rect twice
    expect(result.length).toBe(1);
    expect(result[0].id).toBe(rect.id);
  });
});
