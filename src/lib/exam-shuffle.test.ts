import { describe, expect, it } from "vitest";
import { shuffleExam } from "./exam-shuffle";
import type { StudentQuestion } from "@/lib/exams";

/** Deterministic PRNG so assertions either always pass or always fail. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function question(id: string): StudentQuestion {
  return {
    id,
    question: `Question ${id}`,
    option_a: `${id}-A`,
    option_b: `${id}-B`,
    option_c: `${id}-C`,
    option_d: `${id}-D`,
    marks: 1,
  };
}

const exam = ["q1", "q2", "q3", "q4", "q5", "q6"].map(question);

describe("shuffleExam", () => {
  it("keeps every question exactly once", () => {
    const result = shuffleExam(exam, mulberry32(7));
    expect(result.map((q) => q.question.id).sort()).toEqual(["q1", "q2", "q3", "q4", "q5", "q6"]);
  });

  it("keeps all four options of each question, nothing lost or duplicated", () => {
    const result = shuffleExam(exam, mulberry32(11));
    for (const { question, options } of result) {
      expect(options.map((o) => o.text).sort()).toEqual([`${question.id}-A`, `${question.id}-B`, `${question.id}-C`, `${question.id}-D`]);
    }
  });

  it("preserves the real answer letter mapping so scoring stays correct", () => {
    const result = shuffleExam(exam, mulberry32(3));
    for (const { question, options } of result) {
      const key: Record<string, string> = {
        A: question.option_a,
        B: question.option_b,
        C: question.option_c,
        D: question.option_d,
      };
      for (const option of options) expect(option.text).toBe(key[option.letter]);
    }
  });

  it("changes the question order for a different attempt", () => {
    const first = shuffleExam(exam, mulberry32(1)).map((q) => q.question.id);
    const second = shuffleExam(exam, mulberry32(2)).map((q) => q.question.id);
    expect(first).not.toEqual(second);
  });

  it("handles a single-question exam", () => {
    const [only] = shuffleExam([question("solo")], mulberry32(5));
    expect(only!.question.id).toBe("solo");
    expect(only!.options).toHaveLength(4);
  });
});
