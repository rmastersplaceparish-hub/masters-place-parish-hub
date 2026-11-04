import { describe, expect, it } from "vitest";
import { parseDuration, parseExamRows } from "./exam-parse";

const header = ["Question", "Option A", "Option B", "Option C", "Option D", "Correct Answer", "Marks"];

describe("exam excel parsing", () => {
  it("reads question rows with letter answers and marks", () => {
    const q = parseExamRows([header, ["Q1", "a", "b", "c", "d", "b", 2]]);
    expect(q[0]).toMatchObject({ correct_answer: "B", marks: 2 });
  });
  it("accepts the option text as the correct answer", () => {
    expect(parseExamRows([header, ["Q", "Noah", "Moses", "x", "y", "Moses", 1]])[0]?.correct_answer).toBe("B");
  });
  it("rejects an invalid correct answer", () => {
    expect(() => parseExamRows([header, ["Q", "a", "b", "c", "d", "E", 1]])).toThrow();
  });
});

describe("exam duration", () => {
  it("empty duration means no time limit", () => expect(parseDuration("  ")).toBeNull());
  it("a set duration is kept in minutes", () => expect(parseDuration("30")).toBe(30));
});
