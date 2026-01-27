import { describe, it, expect } from 'vitest';
import { formatQuestionForCopy, formatAnswerForCopy } from './quizFormatter';
import type { Quiz } from '../types/Quiz';

describe('quizFormatter', () => {
    const mockQuiz: Quiz = {
        id: '1',
        title: 'Test Quiz',
        question: '日本で一番高い山は？',
        type: 'text',
        options: [],
        correctAnswer: '富士山',
        explanation: '3776mです。',
        createdAt: 123,
        updatedAt: 123
    };

    describe('formatQuestionForCopy', () => {
        it('formats question with index', () => {
            const result = formatQuestionForCopy(mockQuiz, 1);
            expect(result).toBe('Q1. 日本で一番高い山は？');
        });

        it('formats question without index (default)', () => {
            // If index is optional or handled differently
            const result = formatQuestionForCopy(mockQuiz);
            expect(result).toBe('Q. 日本で一番高い山は？');
        });
    });

    describe('formatAnswerForCopy', () => {
        it('formats simple text answer', () => {
            const result = formatAnswerForCopy(mockQuiz);
            expect(result).toBe('A. 富士山');
        });

        it('formats multiple choice answer (shows text)', () => {
            const mcQuiz: Quiz = {
                ...mockQuiz,
                type: 'multiple-choice',
                options: [
                    { id: 'opt1', text: '富士山' },
                    { id: 'opt2', text: '北岳' }
                ],
                correctAnswer: 'opt1'
            };
            const result = formatAnswerForCopy(mcQuiz);
            expect(result).toBe('A. 富士山');
        });

        it('includes explanation if requested', () => {
            const result = formatAnswerForCopy(mockQuiz, true);
            expect(result).toBe('A. 富士山\n(解説: 3776mです。)');
        });
    });
});
