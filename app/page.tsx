import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Check, Flame, RotateCcw, Trophy, X } from 'lucide-react';
import { drawPersistentQuiz, expandQuestionBank, randomQuiz, type QuizQuestion } from './questionBank';

type Level = 'beginner' | 'intermediate' | 'advanced';

const beginnerQuestions: QuizQuestion[] = [
  { prompt: 'How do you say “Good morning” in German?', options: ['Gute Nacht', 'Guten Morgen', 'Guten Abend', 'Auf Wiedersehen'], answer: 1, note: '“Guten Morgen” is the standard greeting used in the morning.', tag: 'Greetings' },
  { prompt: 'Choose the correct article:', context: '___ Apfel ist rot.', options: ['Der', 'Die', 'Das', 'Den'], answer: 0, note: '“Apfel” is masculine, so its nominative article is “der”.', tag: 'Articles' },
  { prompt: 'What does “Ich habe Hunger” mean?', options: ['I am tired', 'I am thirsty', 'I am hungry', 'I am cold'], answer: 2, note: 'Literally, German says “I have hunger” rather than “I am hungry”.', tag: 'Phrases' },
  { prompt: 'Complete the sentence:', context: 'Wir ___ heute Deutsch.', options: ['lerne', 'lernst', 'lernt', 'lernen'], answer: 3, note: 'With “wir” (we), the verb keeps its infinitive ending: “wir lernen”.', tag: 'Verbs' },
  { prompt: 'Which word means “the train station”?', options: ['der Flughafen', 'der Bahnhof', 'die Kreuzung', 'die Haltestelle'], answer: 1, note: '“Der Bahnhof” is the railway station; “die Haltestelle” is a stop.', tag: 'Travel' },
  { prompt: 'Choose the natural reply:', context: 'Wie geht es dir?', options: ['Sehr gut, danke!', 'Ich heiße Anna.', 'Bis morgen.', 'Entschuldigung.'], answer: 0, note: '“Wie geht es dir?” asks how someone is doing.', tag: 'Conversation' },
  { prompt: 'What is the plural of “das Buch”?', options: ['die Buche', 'die Buchs', 'die Bücher', 'die Bucher'], answer: 2, note: '“Das Buch” changes to “die Bücher” in the plural.', tag: 'Nouns' },
  { prompt: 'Pick the correct word order:', options: ['Heute ich gehe ins Kino.', 'Ich heute gehe ins Kino.', 'Heute gehe ich ins Kino.', 'Gehe heute ich ins Kino.'], answer: 2, note: 'When an adverb starts the sentence, the verb remains in second position.', tag: 'Word order' },
  { prompt: 'What does “Vielleicht” mean?', options: ['Always', 'Perhaps', 'Never', 'Together'], answer: 1, note: '“Vielleicht” means “perhaps” or “maybe”.', tag: 'Vocabulary' },
  { prompt: 'Choose the correct form:', context: 'Sie ___ aus Berlin.', options: ['komme', 'kommst', 'kommt', 'kommen'], answer: 2, note: 'For “sie” meaning “she”, “kommen” becomes “kommt”.', tag: 'Verbs' },
  { prompt: 'How would you politely ask for the bill?', options: ['Die Rechnung, bitte.', 'Einen Tisch, bitte.', 'Was kostet das?', 'Noch einmal, bitte.'], answer: 0, note: '“Die Rechnung, bitte” is the usual polite request at a restaurant.', tag: 'Dining' },
  { prompt: 'Which sentence is in the past tense?', options: ['Ich fahre nach Hause.', 'Ich werde nach Hause fahren.', 'Ich bin nach Hause gefahren.', 'Ich möchte nach Hause fahren.'], answer: 2, note: 'The perfect tense uses “bin” plus the past participle “gefahren”.', tag: 'Grammar' },
];

const intermediateQuestions: QuizQuestion[] = [
  { prompt: 'Choose the correct relative pronoun:', context: 'Das ist der Mann, ___ mir geholfen hat.', options: ['den', 'dem', 'der', 'dessen'], answer: 2, note: 'The relative pronoun is the subject of “geholfen hat”, so masculine nominative “der” is required.', tag: 'Relative clauses' },
  { prompt: 'Which sentence correctly uses the subjunctive?', options: ['Wenn ich Zeit habe, reiste ich.', 'Wenn ich Zeit hätte, würde ich reisen.', 'Wenn ich Zeit hatte, werde ich reisen.', 'Wenn ich Zeit würde, reise ich.'], answer: 1, note: 'Konjunktiv II uses “hätte” and often “würde + infinitive” for hypothetical situations.', tag: 'Konjunktiv II' },
  { prompt: 'What does “sich um etwas kümmern” mean?', options: ['to complain about something', 'to take care of something', 'to remember something', 'to apply for something'], answer: 1, note: '“Sich kümmern um + accusative” means to look after or take care of something.', tag: 'Vocabulary' },
  { prompt: 'Complete the passive sentence:', context: 'Das Haus ___ im Jahr 1920 gebaut.', options: ['hat', 'ist', 'wurde', 'war'], answer: 2, note: 'The past passive uses “wurde + past participle”: “wurde gebaut”.', tag: 'Passive voice' },
  { prompt: 'Choose the correct connector:', context: '___ es regnete, gingen wir spazieren.', options: ['Trotzdem', 'Obwohl', 'Deshalb', 'Denn'], answer: 1, note: '“Obwohl” introduces a subordinate clause meaning “although” and sends the verb to the end.', tag: 'Connectors' },
  { prompt: 'Which preposition completes the phrase?', context: 'Ich interessiere mich ___ deutsche Geschichte.', options: ['an', 'auf', 'für', 'über'], answer: 2, note: '“Sich interessieren für” always takes the accusative case.', tag: 'Prepositions' },
  { prompt: 'Choose the natural formal email phrase:', options: ['Mach’s gut!', 'Mit freundlichen Grüßen', 'Bis dann!', 'Liebe Grüße an dich'], answer: 1, note: '“Mit freundlichen Grüßen” is the standard formal sign-off in German correspondence.', tag: 'Writing' },
  { prompt: 'What is the best translation of “Es kommt darauf an”?', options: ['It is arriving.', 'It depends.', 'It is important.', 'It will happen.'], answer: 1, note: '“Es kommt darauf an” is the idiomatic German expression for “It depends”.', tag: 'Idioms' },
  { prompt: 'Choose the correct adjective ending:', context: 'Sie trägt einen schön___ Mantel.', options: ['e', 'en', 'er', 'es'], answer: 1, note: 'After the masculine accusative article “einen”, the adjective takes “-en”.', tag: 'Adjectives' },
  { prompt: 'Which sentence has the correct word order?', options: ['Ich weiß, dass er morgen kommt.', 'Ich weiß, dass morgen er kommt.', 'Ich weiß, dass er kommt morgen.', 'Ich weiß, dass kommt er morgen.'], answer: 0, note: 'In a “dass” clause, the conjugated verb moves to the end.', tag: 'Word order' },
];

const advancedQuestions: QuizQuestion[] = [
  { prompt: 'Choose the most idiomatic completion:', context: 'Die Reform stieß in der Bevölkerung auf ___.', options: ['Widerspruch', 'Gegensatz', 'Gegenwort', 'Widerstandung'], answer: 0, note: 'The fixed collocation is “auf Widerspruch stoßen” — to meet with opposition.', tag: 'Collocations' },
  { prompt: 'Which sentence correctly uses reported speech?', options: ['Er sagte, er ist krank.', 'Er sagte, er sei krank.', 'Er sagte, er wäre krank gewesen sein.', 'Er sagte, sei er krank.'], answer: 1, note: 'Formal reported speech uses Konjunktiv I: “Er sagte, er sei krank.”', tag: 'Konjunktiv I' },
  { prompt: 'What does “etwas in Kauf nehmen” mean?', options: ['to purchase something', 'to accept a drawback', 'to negotiate a price', 'to return a product'], answer: 1, note: 'The idiom means accepting an undesirable consequence in pursuit of something else.', tag: 'Idioms' },
  { prompt: 'Choose the correct nominalisation:', context: '___ der Frist führt zum Ausschluss.', options: ['Das Versäumen', 'Die Versäumnis', 'Das Versäumnis', 'Der Versäumung'], answer: 2, note: 'The noun is neuter: “das Versäumnis”; here it means failure to meet the deadline.', tag: 'Nominalisation' },
  { prompt: 'Which connector expresses a condition?', options: ['insofern als', 'vorausgesetzt, dass', 'wohingegen', 'geschweige denn'], answer: 1, note: '“Vorausgesetzt, dass” means “provided that” and introduces a condition.', tag: 'Connectors' },
  { prompt: 'Choose the precise verb:', context: 'Die neuen Daten ___ die bisherige Annahme.', options: ['widerlegen', 'verlegen', 'erlegen', 'unterlegen'], answer: 0, note: '“Widerlegen” means to refute a claim or assumption with evidence.', tag: 'Academic German' },
  { prompt: 'Which version is stylistically most formal?', options: ['Wir gucken uns das Problem an.', 'Wir schauen mal nach dem Problem.', 'Wir unterziehen das Problem einer Prüfung.', 'Wir checken das Problem ab.'], answer: 2, note: 'The nominal style “einer Prüfung unterziehen” belongs to formal written German.', tag: 'Register' },
  { prompt: 'Complete the participial construction:', context: 'Von den Ergebnissen ___, änderte das Team seine Strategie.', options: ['überraschen', 'überrascht', 'überraschend', 'überraschte'], answer: 1, note: 'The past participle “überrascht” forms a reduced passive clause: surprised by the results.', tag: 'Syntax' },
  { prompt: 'What does “Das lässt sich nicht von der Hand weisen” mean?', options: ['It cannot be handled manually.', 'It cannot be dismissed.', 'It cannot be passed on.', 'It cannot be proven.'], answer: 1, note: 'The expression means that an argument or fact cannot simply be rejected.', tag: 'Idioms' },
  { prompt: 'Choose the correct genitive form:', context: 'Trotz ___ Einwände wurde der Plan beschlossen.', options: ['zahlreiche', 'zahlreichen', 'zahlreicher', 'zahlreiches'], answer: 2, note: 'Without an article, the adjective carries the strong genitive plural ending “-er”.', tag: 'Case system' },
];

const questionSets: Record<Level, QuizQuestion[]> = {
  beginner: expandQuestionBank(beginnerQuestions),
  intermediate: expandQuestionBank(intermediateQuestions),
  advanced: expandQuestionBank(advancedQuestions),
};

const SESSION_SIZE = 10;

const levelInfo: Record<Level, { label: string; cefr: string; description: string }> = {
  beginner: { label: 'Foundations', cefr: 'A1–A2', description: 'Everyday words, articles and essential phrases' },
  intermediate: { label: 'Fluency Builder', cefr: 'B1–B2', description: 'Complex grammar, connectors and natural expression' },
  advanced: { label: 'Mastery', cefr: 'C1–C2', description: 'Nuance, register, idioms and academic German' },
};

export default function Home() {
  const [level, setLevel] = useState<Level>('beginner');
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [remaining, setRemaining] = useState(questionSets.beginner.length);
  const [questions, setQuestions] = useState(() => randomQuiz(questionSets.beginner, SESSION_SIZE));
  const complete = index >= questions.length;
  const question = questions[index];

  useEffect(() => {
    setBest(Number(localStorage.getItem(`wortwerk-best-${level}`) || 0));
    setQuestions(randomQuiz(questionSets[level], SESSION_SIZE));
    const saved = JSON.parse(localStorage.getItem(`wortwerk-used-${level}`) || '[]') as string[];
    setRemaining(Math.max(0, questionSets[level].length - saved.length));
  }, [level]);

  const percent = useMemo(() => Math.round((index / questions.length) * 100), [index]);

  const choose = (choice: number) => {
    if (selected !== null) return;
    setSelected(choice);
    if (choice === question.answer) {
      setScore((value) => value + 1);
      setStreak((value) => value + 1);
    } else setStreak(0);
  };

  const next = () => {
    const nextIndex = index + 1;
    setIndex(nextIndex);
    setSelected(null);
    if (nextIndex === questions.length) {
      const nextBest = Math.max(best, score);
      setBest(nextBest);
      localStorage.setItem(`wortwerk-best-${level}`, String(nextBest));
    }
  };

  const startPractice = () => {
    const storageKey = `wortwerk-used-${level}`;
    let usedIds: string[] = [];
    try {
      usedIds = JSON.parse(localStorage.getItem(storageKey) || '[]') as string[];
    } catch {
      usedIds = [];
    }
    const draw = drawPersistentQuiz(questionSets[level], usedIds, SESSION_SIZE);
    localStorage.setItem(storageKey, JSON.stringify(draw.usedIds));
    setQuestions(draw.questions);
    setRemaining(draw.remaining);
    setStarted(true);
    setIndex(0);
    setSelected(null);
    setScore(0);
    setStreak(0);
  };

  return (
    <main className="shell">
      <header className="topbar">
        <a href="#quiz" className="brand"><span>W</span>WORTWERK</a>
        <div className="level-pill"><i /> {levelInfo[level].cefr} · {levelInfo[level].label.toUpperCase()}</div>
        <div className="best"><Trophy size={15} /> BEST {best}/{questions.length}</div>
      </header>

      {!started ? (
        <section className="welcome" id="quiz">
          <div className="welcome-copy">
            <span className="kicker">DEIN TÄGLICHES DEUTSCH</span>
            <h1>Small words.<br/><em>Big progress.</em></h1>
            <p>Build your German one question at a time. Choose a track and practise from first phrases to advanced nuance.</p>
            <div className="level-picker">
              {(Object.keys(levelInfo) as Level[]).map((item) => <button key={item} className={level === item ? 'active' : ''} onClick={() => setLevel(item)}><span>{levelInfo[item].cefr}</span><b>{levelInfo[item].label}</b><small>{levelInfo[item].description}</small></button>)}
            </div>
            <button className="primary" onClick={startPractice}>Start random practice <ArrowRight size={19} /></button>
            <div className="session-note"><BookOpen size={17}/><span><b>{SESSION_SIZE} unseen questions · {levelInfo[level].cefr}</b><small>{remaining.toLocaleString()} of {questionSets[level].length.toLocaleString()} remain before the deck resets</small></span></div>
          </div>
          <div className="word-stack" aria-hidden="true">
            <div className="card card-one"><small>die Neugier</small><strong>curiosity</strong><span>NOY-geer</span></div>
            <div className="card card-two"><small>der Fortschritt</small><strong>progress</strong></div>
            <div className="card card-three"><small>los geht&apos;s!</small><strong>let&apos;s go!</strong></div>
          </div>
        </section>
      ) : complete ? (
        <section className="result" id="quiz">
          <div className="result-seal"><Trophy size={42}/></div>
          <span className="kicker">ÜBUNG GESCHAFFT</span>
          <h1>Sehr gut!</h1>
          <p>You scored <strong>{score} out of {questions.length}</strong>.</p>
          <div className="result-grid">
            <div><strong>{Math.round(score/questions.length*100)}%</strong><span>ACCURACY</span></div>
            <div><strong>{best}/{questions.length}</strong><span>PERSONAL BEST</span></div>
          </div>
          <button className="primary" onClick={startPractice}><RotateCcw size={18}/> New random quiz</button>
        </section>
      ) : (
        <section className="quiz" id="quiz">
          <div className="quiz-meta"><span>QUESTION {index + 1} OF {questions.length}</span><span>{question.tag.toUpperCase()}</span></div>
          <div className="progress"><i style={{width: `${percent}%`}} /></div>
          <div className="quiz-card">
            <div className="card-head">
              <div><span className="kicker">WÄHLE DIE RICHTIGE ANTWORT</span><h2>{question.prompt}</h2>{question.context && <p className="context">{question.context}</p>}</div>
              <div className={`streak ${streak ? 'hot' : ''}`}><Flame size={17}/><b>{streak}</b><span>STREAK</span></div>
            </div>
            <div className="options">
              {question.options.map((option, choice) => {
                const correct = selected !== null && choice === question.answer;
                const wrong = selected === choice && choice !== question.answer;
                return <button key={option} className={`${correct?'correct':''} ${wrong?'wrong':''}`} onClick={() => choose(choice)} disabled={selected !== null}><span>{String.fromCharCode(65+choice)}</span><b>{option}</b>{correct&&<Check size={20}/>} {wrong&&<X size={20}/>}</button>;
              })}
            </div>
            {selected !== null && <div className={`feedback ${selected === question.answer?'right':'not-right'}`}><div><strong>{selected === question.answer?'Richtig!':'Fast — keep going.'}</strong><p>{question.note}</p></div><button onClick={next}>{index === questions.length-1?'See results':'Continue'} <ArrowRight size={18}/></button></div>}
          </div>
        </section>
      )}
      <footer><span>LEARN · REPEAT · REMEMBER</span><span>Made for curious minds</span></footer>
    </main>
  );
}
