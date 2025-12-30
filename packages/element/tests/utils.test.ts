import { describe, it, expect } from "vitest";
import { getCommonAttributeProperties } from "../src/utils";
import { API } from "../../excalidraw/tests/helpers/api";

describe("getCommonAttributeProperties", () => {
  it("should return common attribute properties from an element", () => {
    const element = API.createElement({
      type: "rectangle",
      width: 100,
      height: 200,
      backgroundColor: "red",
      strokeColor: "blue",
      strokeWidth: 2,
      fillStyle: "solid",
      strokeStyle: "dashed",
      opacity: 50,
      roughness: 1,
      roundness: { type: 3 },
    });

    const commonAttributes = getCommonAttributeProperties(element);

    expect(commonAttributes).toEqual({
      width: 100,
      height: 200,
      backgroundColor: "red",
      strokeColor: "blue",
      strokeWidth: 2,
      fillStyle: "solid",
      strokeStyle: "dashed",
      opacity: 50,
      roughness: 1,
      roundness: { type: 3 },
    });
  });
});
