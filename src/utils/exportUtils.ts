import type { Quiz } from '../types/Quiz';

export const exportQuizzesToJson = (quizzes: Quiz[]): string => {
    return JSON.stringify(quizzes, null, 2);
};

export const exportQuizzesToCsv = (quizzes: Quiz[]): string => {
    const headers = ['id', 'title', 'question', 'type', 'correctAnswer', 'explanation', 'createdAt'];

    const escapeCsv = (str: string | undefined | null): string => {
        if (!str) return '';
        const stringVal = String(str);
        if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
            return `"${stringVal.replace(/"/g, '""')}"`;
        }
        return stringVal;
    };

    const rows = quizzes.map(quiz => {
        const values = [
            quiz.id,
            quiz.title,
            quiz.question,
            quiz.type,
            Array.isArray(quiz.correctAnswer) ? quiz.correctAnswer.join(';') : quiz.correctAnswer,
            quiz.explanation,
            new Date(quiz.createdAt).toISOString()
        ];
        return values.map(escapeCsv).join(',');
    });

    return [headers.join(','), ...rows].join('\n');
};
