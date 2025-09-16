// Constants untuk tipe soal latihan
export const PRACTICE_QUESTION_TYPES = {
  MULTIPLE_CHOICE: "multiple_choice",
  TRUE_FALSE: "true_false",
  FILL_BLANK: "fill_blank",
} as const;

// Type untuk tipe soal yang didukung
export type PracticeQuestionType = (typeof PRACTICE_QUESTION_TYPES)[keyof typeof PRACTICE_QUESTION_TYPES];

// Function to get practice question type options with translations
export const getPracticeQuestionTypeOptions = (t: (key: string) => string) => [
  {
    value: PRACTICE_QUESTION_TYPES.MULTIPLE_CHOICE,
    label: t("form.fields.multipleChoice"),
  },
  {
    value: PRACTICE_QUESTION_TYPES.TRUE_FALSE,
    label: t("form.fields.trueFalse"),
  },
  {
    value: PRACTICE_QUESTION_TYPES.FILL_BLANK,
    label: t("form.fields.fillBlank"),
  },
];

// Backward compatibility - will be deprecated
export const PRACTICE_QUESTION_TYPE_OPTIONS = [
  {
    value: PRACTICE_QUESTION_TYPES.MULTIPLE_CHOICE,
    label: "Multiple Choice",
  },
  {
    value: PRACTICE_QUESTION_TYPES.TRUE_FALSE,
    label: "True/False",
  },
  {
    value: PRACTICE_QUESTION_TYPES.FILL_BLANK,
    label: "Fill in the Blank",
  },
];

// Validasi untuk fill blank questions
export const FILL_BLANK_VALIDATION = {
  REQUIRED_UNDERSCORES: 3,
  MAX_PLACEHOLDERS: 1,
  UNDERSCORE_PATTERN: /___/g,
};
