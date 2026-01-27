import type { Quiz } from '../types/Quiz';

const STORAGE_KEY = 'quiz-smith-data';

export const getQuizzes = (): Quiz[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Failed to load quizzes from storage', e);
        return [];
    }
};

const saveQuizzesToStorage = (quizzes: Quiz[]): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(quizzes));
    } catch (e) {
        console.error('Failed to save quizzes to storage', e);
    }
};

export const saveQuiz = (quiz: Quiz): void => {
    const quizzes = getQuizzes();
    const existingIndex = quizzes.findIndex(q => q.id === quiz.id);

    if (existingIndex >= 0) {
        quizzes[existingIndex] = quiz;
    } else {
        quizzes.unshift(quiz); // Add to top
    }

    saveQuizzesToStorage(quizzes);
};

export const deleteQuiz = (id: string): void => {
    const quizzes = getQuizzes();
    const filtered = quizzes.filter(q => q.id !== id);
    saveQuizzesToStorage(filtered);
};
