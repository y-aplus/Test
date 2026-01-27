import type { Quiz } from '../types/Quiz';

export const formatQuestionForCopy = (quiz: Quiz, index?: number): string => {
    const prefix = index !== undefined ? `Q${index}.` : 'Q.';
    return `${prefix} ${quiz.question}`;
};

export const formatAnswerForCopy = (quiz: Quiz, includeExplanation: boolean = false): string => {
    let answerText = quiz.correctAnswer as string;

    if (quiz.type === 'multiple-choice' || quiz.type === 'multi-select') {
        const answerIds = Array.isArray(quiz.correctAnswer) ? quiz.correctAnswer : [quiz.correctAnswer as string];
        const answerTexts = answerIds.map(id => {
            const option = quiz.options.find(opt => opt.id === id);
            return option ? option.text : id;
        });
        answerText = answerTexts.join(', ');
    } else if (Array.isArray(quiz.correctAnswer)) {
        answerText = quiz.correctAnswer.join(', '); // Fallback for other array types if any
    }

    let result = `A. ${answerText}`;
    if (includeExplanation && quiz.explanation) {
        result += `\n(解説: ${quiz.explanation})`;
    }
    return result;
};
