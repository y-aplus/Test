import type { Quiz, ValidationResult } from '../types/Quiz';

export const validateQuiz = (quiz: Quiz): ValidationResult => {
    const errors: Record<string, string> = {};

    if (!quiz.title.trim()) {
        errors.title = 'Title is required';
    }

    if (!quiz.question.trim()) {
        errors.question = 'Question is required';
    }

    if (quiz.type === 'multiple-choice') {
        if (!quiz.options || quiz.options.length < 2) {
            errors.options = 'At least 2 options are required for multiple-choice questions';
        } else {
            // Validate correct answer exists in options
            const optionIds = quiz.options.map(o => o.id);
            if (typeof quiz.correctAnswer === 'string') {
                if (!optionIds.includes(quiz.correctAnswer)) {
                    errors.correctAnswer = 'Correct answer must be one of the options';
                }
            } else {
                // For now, only string validation is covered by tests, but we should handle array too if needed
                if (Array.isArray(quiz.correctAnswer)) {
                    const allValid = quiz.correctAnswer.every(id => optionIds.includes(id));
                    if (!allValid) {
                        errors.correctAnswer = 'All correct answers must be valid options';
                    }
                }
            }
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};
