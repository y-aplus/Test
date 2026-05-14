import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getQuizzes, saveQuiz, deleteQuiz } from './storage';
import type { Quiz } from '../types/Quiz';

describe('Storage Utils', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    const mockQuiz: Quiz = {
        id: '1',
        title: 'Test Quiz',
        question: 'Q1',
        type: 'text',
        options: [],
        correctAnswer: 'A1',
        createdAt: 1234567890,
        updatedAt: 1234567890
    };

    it('should save a new quiz', () => {
        saveQuiz(mockQuiz);
        const quizzes = getQuizzes();
        expect(quizzes).toHaveLength(1);
        expect(quizzes[0]).toEqual(mockQuiz);
    });

    it('should update an existing quiz', () => {
        saveQuiz(mockQuiz);

        const updatedQuiz = { ...mockQuiz, title: 'Updated Title' };
        saveQuiz(updatedQuiz);

        const quizzes = getQuizzes();
        expect(quizzes).toHaveLength(1);
        expect(quizzes[0].title).toBe('Updated Title');
    });

    it('should retrieve empty array if no data', () => {
        const quizzes = getQuizzes();
        expect(quizzes).toEqual([]);
    });

    it('should delete a quiz by id', () => {
        saveQuiz(mockQuiz);
        saveQuiz({ ...mockQuiz, id: '2', title: 'Quiz 2' });

        deleteQuiz('1');

        const quizzes = getQuizzes();
        expect(quizzes).toHaveLength(1);
        expect(quizzes[0].id).toBe('2');
    });

    it('should persist data to localStorage', () => {
        const spy = vi.spyOn(Storage.prototype, 'setItem');
        saveQuiz(mockQuiz);
        expect(spy).toHaveBeenCalledWith('quiz-smith-data', expect.any(String));
    });
});
