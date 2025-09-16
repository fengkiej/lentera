import { Question, QuestionType, Lesson, QuestionOption } from "@/types/learn";

export const generatePracticeQuestions = (currentLessonData: Lesson): Question[] => {
  const questionTypes: QuestionType[] = ["guess-meaning", "arrange-words", "pronunciation"];
  const questions: Question[] = [];

  // Generate 5 random questions
  for (let i = 0; i < 5; i++) {
    const randomType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    const randomDerivative = currentLessonData.derivatives[Math.floor(Math.random() * currentLessonData.derivatives.length)];

    let question: Question;
    switch (randomType) {
      case "guess-meaning":
        question = {
          type: "guess-meaning",
          question: "Pilih arti yang tepat untuk kata Arab berikut:",
          arabicText: randomDerivative.word,
          options: [
            { id: "a", text: randomDerivative.meaning, correct: true },
            { id: "b", text: "Menulis", correct: false },
            { id: "c", text: "Mendengar", correct: false },
            { id: "d", text: "Melihat", correct: false },
          ],
          explanation: `"${randomDerivative.word}" berarti ${randomDerivative.meaning}.`,
        };
        break;
      case "arrange-words": {
        const targetWord = randomDerivative.word;
        const targetLetters = targetWord.split("");
        // Add some random Arabic letters as distractors
        const distractorLetters = ["ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ل", "م", "ن", "ه", "و", "ي"];
        const randomDistractors = distractorLetters
          .filter((letter) => !targetLetters.includes(letter))
          .sort(() => Math.random() - 0.5)
          .slice(0, 3); // Add 3 random distractors

        const allAvailableLetters = [...targetLetters, ...randomDistractors].sort(() => Math.random() - 0.5); // Shuffle all letters

        question = {
          type: "arrange-words",
          question: `Susun huruf-huruf di bawah ini menjadi kata yang berarti "${randomDerivative.meaning}":`,
          targetWord: targetWord,
          availableLetters: allAvailableLetters,
          scrambledLetters: targetWord
            .split("")
            .sort(() => Math.random() - 0.5)
            .join(""),
          options: [], // Not used for this interactive type
          explanation: `Susunan yang benar adalah "${randomDerivative.word}" yang berarti ${randomDerivative.meaning}.`,
        };
        break;
      }
      case "pronunciation":
        question = {
          type: "pronunciation",
          question: `Bagaimana cara membaca kata Arab berikut dengan benar?`,
          arabicText: randomDerivative.word,
          options: [
            { id: "a", text: randomDerivative.transliteration, correct: true },
            { id: "b", text: "ka-ta-ba", correct: false },
            { id: "c", text: "qa-ra-a", correct: false },
            { id: "d", text: "da-ra-sa", correct: false },
          ],
          explanation: `"${randomDerivative.word}" dibaca "${randomDerivative.transliteration}".`,
        };
        break;
      default:
        question = {
          type: "guess-meaning",
          question: `Apa arti dari kata "${randomDerivative.word}"?`,
          arabicText: randomDerivative.word,
          options: [
            { id: "a", text: randomDerivative.meaning, correct: true },
            { id: "b", text: "Membaca", correct: false },
            { id: "c", text: "Berjalan", correct: false },
            { id: "d", text: "Berbicara", correct: false },
          ],
          explanation: `"${randomDerivative.word}" berarti ${randomDerivative.meaning}.`,
        };
    }
    questions.push(question);
  }
  return questions;
};
