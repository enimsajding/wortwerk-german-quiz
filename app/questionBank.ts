export type QuizQuestion = {
  id?: string;
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

const VARIATIONS_PER_LEARNING_POINT = 1120;

/** Each curated learning point produces 1,120 visible, stable question variations. */
export function expandQuestionBank(seeds: QuizQuestion[]): QuizQuestion[] {
  return seeds.flatMap((seed, seedIndex) =>
    Array.from({ length: VARIATIONS_PER_LEARNING_POINT }, (_, variationIndex) => {
      const frameIndex = variationIndex % promptFrames.length;
      const contextIndex = Math.floor(variationIndex / promptFrames.length) % learningContexts.length;
      const setNumber = Math.floor(variationIndex / (promptFrames.length * learningContexts.length)) + 1;
      const id = `question-${seedIndex}-variation-${variationIndex}`;
      const rotated = rotateOptions(seed, seedIndex + frameIndex + contextIndex + setNumber);
      const learningContext = learningContexts[contextIndex];
      return {
        ...rotated,
        id,
        sourceId: id,
        prompt: `${promptFrames[frameIndex](seed.prompt)} — ${learningContext}, set ${setNumber}`,
        tag: `${seed.tag} · ${learningContext} · Set ${setNumber}`,
      };
    }),
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

export type QuizDraw = {
  questions: QuizQuestion[];
  usedIds: string[];
  remaining: number;
  exhausted: boolean;
};

/** Draws a session without ever recycling an exact question. */
export function drawPersistentQuiz(
  pool: QuizQuestion[],
  previouslyUsedIds: string[],
  size = 10,
): QuizDraw {
  const validIds = new Set(pool.map((question) => question.id).filter(Boolean));
  const used = new Set(previouslyUsedIds.filter((id) => validIds.has(id)));
  const available = pool.filter((question) => question.id && !used.has(question.id));

  const questions = randomQuiz(available, Math.min(size, available.length));
  for (const question of questions) {
    if (question.id) used.add(question.id);
  }

  return {
    questions,
    usedIds: [...used],
    remaining: pool.length - used.size,
    exhausted: pool.length - used.size === 0,
  };
}
