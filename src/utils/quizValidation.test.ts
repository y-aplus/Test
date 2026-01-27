import { describe, it, expect } from 'vitest';
import { validateQuiz } from './quizValidation';
import { Quiz } from '../types/Quiz';

describe('validateQuiz', () => {
    const baseQuiz: Quiz = {
        id: '1',
        title: 'Test Quiz',
        question: 'Question?',
        type: 'multiple-choice',
        options: [
            { id: 'opt1', text: 'Option 1' },
            { id: 'opt2', text: 'Option 2' }
        ],
        correctAnswer: 'opt1',
        createdAt: Date.now(),
        updatedAt: Date.now()
    };

    it('should return valid for a correct quiz', () => {
        const result = validateQuiz(baseQuiz);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual({});
    });

    it('should invalidate empty title', () => {
        const quiz = { ...baseQuiz, title: '' };
        const result = validateQuiz(quiz);
        expect(result.isValid).toBe(false);
        expect(result.errors.title).toBeDefined();
    });

    it('should invalidate empty question', () => {
        const quiz = { ...baseQuiz, question: '' };
        const result = validateQuiz(quiz);
        expect(result.isValid).toBe(false);
        expect(result.errors.question).toBeDefined();
    });

    it('should invalidate multiple-choice quiz with less than 2 options', () => {
        const quiz = { ...baseQuiz, options: [{ id: 'opt1', text: 'Option 1' }] };
        const result = validateQuiz(quiz);
        expect(result.isValid).toBe(false);
        expect(result.errors.options).toBeDefined();
    });

    it('should invalidate multiple-choice quiz if correct answer is not in options', () => {
        const quiz = { ...baseQuiz, correctAnswer: 'invalid-id' };
        const result = validateQuiz(quiz);
        expect(result.isValid).toBe(false);
        expect(result.errors.correctAnswer).toBeDefined();
    });
});
