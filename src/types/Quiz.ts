export type QuizType = 'multiple-choice' | 'text' | 'boolean' | 'multi-select';

export interface QuizOption {
    id: string;
    text: string;
}

export interface Quiz {
    id: string;
    title: string;
    question: string;
    type: QuizType;
    options: QuizOption[];
    correctAnswer: string | string[]; // multiple-choice/boolean: optionId, text: string, multi-select: optionId[]
    explanation?: string;
    createdAt: number;
    updatedAt: number;
}

export interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
}
