import { describe, it, expect } from "vitest";
import euroJackpotData from "../../../eurojackpot_data.json";

describe("EuroJackpot", () => {
  it("should return the correct numbers and star numbers for a specific draw", () => {
    // Given
    const drawIndex = 0; // Index of the draw to be tested

    // When
    const draw = euroJackpotData[drawIndex];

    // Then
    expect(draw.numbers).toEqual(["5", "8", "21", "37", "46"]);
    expect(draw.starNumbers).toEqual(["6", "8"]);
  });

  it("should return the correct total number of draws", () => {
    // Given

    // When
    const totalDraws = euroJackpotData.length;

    // Then
    expect(totalDraws).toBeGreaterThan(0);
  });

  it("should have the required properties in each draw", () => {
    // Given

    // When
    const draws = euroJackpotData;

    // Then
    for (const draw of draws) {
      expect(draw).toHaveProperty("numbers");
      expect(draw).toHaveProperty("starNumbers");
    }
  });

  it("should have unique numbers and star numbers in each draw", () => {
    // Given

    // When
    const draws = euroJackpotData;

    // Then
    for (const draw of draws) {
      expect(new Set(draw.numbers).size).toBe(draw.numbers.length);
      expect(new Set(draw.starNumbers).size).toBe(draw.starNumbers.length);
    }
  });
});
