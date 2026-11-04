import type { StudentQuestion } from "@/lib/exams";

export interface ShuffledOption {
  /** The real answer letter stored in the database — what the student submits. */
  letter: "A" | "B" | "C" | "D";
  text: string;
}

export interface ShuffledQuestion {
  question: StudentQuestion;
  options: ShuffledOption[];
}

/** Fisher–Yates: same items in, permuted out, nothing lost or duplicated. */
function shuffled<T>(items: T[], random: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const a = out[i]!;
    const b = out[j]!;
    out[i] = b;
    out[j] = a;
  }
  return out;
}

/**
 * Shuffles the question order and, within each question, the answer options.
 * The real option letters travel with their text, so submitting the displayed
 * option's letter still scores against the original answer key.
 */
export function shuffleExam(questions: StudentQuestion[], random: () => number = Math.random): ShuffledQuestion[] {
  return shuffled(questions, random).map((question) => ({
    question,
    options: shuffled(
      (["A", "B", "C", "D"] as const).map((letter) => ({
        letter,
        text: { A: question.option_a, B: question.option_b, C: question.option_c, D: question.option_d }[letter],
      })),
      random,
    ),
  }));
}
