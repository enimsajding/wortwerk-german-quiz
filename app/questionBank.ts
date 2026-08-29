export type QuizQuestion = {
  sourceId?: string;
  prompt: string;
  context?: string;
  options: string[];
  answer: number;
  note: string;
  tag: string;
};

const promptFrames = [
  (text: string) => text,
  (text: string) => `Quick check: ${text}`,
  (text: string) => `Choose carefully: ${text}`,
  (text: string) => `Language lab: ${text}`,
  (text: string) => `In context: ${text}`,
  (text: string) => `Grammar sprint: ${text}`,
  (text: string) => `Meaning check: ${text}`,
  (text: string) => `Real-world German: ${text}`,
  (text: string) => `Focus round: ${text}`,
  (text: string) => `Challenge yourself: ${text}`,
  (text: string) => `Spot the best answer: ${text}`,
  (text: string) => `One more step: ${text}`,
];

const learningContexts = [
  'Everyday conversation',
  'Travel and directions',
  'Work and study',
  'Reading comprehension',
  'Writing practice',
  'Listening preparation',
  'Formal situations',
  'Informal situations',
  'Exam preparation',
  'Precision and nuance',
];

function rotateOptions(question: QuizQuestion, amount: number): QuizQuestion {
  const shift = amount % question.options.length;
  const options = [...question.options.slice(shift), ...question.options.slice(0, shift)];
  const answer = (question.answer - shift + question.options.length) % question.options.length;
  return { ...question, options, answer };
}

/**
 * Each curated learning point produces 120 valid presentation variations:
 * 12 prompt styles × 10 practice contexts, with rotated answer positions.
 */
export function expandQuestionBank(seeds: QuizQuestion[]): QuizQuestion[] {
  return seeds.flatMap((seed, seedIndex) =>
    promptFrames.flatMap((frame, frameIndex) =>
      learningContexts.map((learningContext, contextIndex) => {
        const rotated = rotateOptions(seed, seedIndex + frameIndex + contextIndex);
        return {
          ...rotated,
          sourceId: `question-${seedIndex}`,
          prompt: frame(seed.prompt),
          tag: `${seed.tag} · ${learningContext}`,
        };
      }),
    ),
  );
}

export function randomQuiz(pool: QuizQuestion[], size = 10): QuizQuestion[] {
  const copy = [...pool];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapWith]] = [copy[swapWith], copy[index]];
  }

  const selected: QuizQuestion[] = [];
  const usedSources = new Set<string>();
  for (const question of copy) {
    const source = question.sourceId || question.prompt;
    if (!usedSources.has(source)) {
      selected.push(question);
      usedSources.add(source);
    }
    if (selected.length === size) break;
  }
  return selected;
}
