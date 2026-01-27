import { describe, it, expect } from 'vitest';
import { exportQuizzesToJson, exportQuizzesToCsv } from './exportUtils';
import type { Quiz } from '../types/Quiz';

describe('exportUtils', () => {
    const mockQuizzes: Quiz[] = [
        {
            id: '1',
            title: 'Quiz 1',
            question: 'Question 1',
            type: 'text',
            options: [],
            correctAnswer: 'Answer 1',
            explanation: 'Exp 1',
            createdAt: 1000,
            updatedAt: 1000,
        },
        {
            id: '2',
            title: 'Quiz 2',
            question: 'Question 2',
            type: 'multiple-choice',
            options: [{ id: 'opt1', text: 'Option 1' }],
            correctAnswer: 'opt1',
            createdAt: 2000,
            updatedAt: 2000,
        },
    ];

    describe('exportQuizzesToJson', () => {
        it('converts quizzes to formatted JSON string', () => {
            const json = exportQuizzesToJson(mockQuizzes);
            const parsed = JSON.parse(json);
            expect(parsed).toHaveLength(2);
            expect(parsed[0].title).toBe('Quiz 1');
            expect(parsed[1].type).toBe('multiple-choice');
        });
    });

    describe('exportQuizzesToCsv', () => {
        it('converts quizzes to CSV string with header', () => {
            const csv = exportQuizzesToCsv(mockQuizzes);
            const lines = csv.split('\n');

            // Header check
            expect(lines[0]).toContain('id,title,question,type,correctAnswer');

            // Content check
            expect(lines[1]).toContain('Quiz 1');
            expect(lines[1]).toContain('Question 1');
            expect(lines[1]).toContain('Answer 1');

            expect(lines[2]).toContain('Quiz 2');
            expect(lines[2]).toContain('multiple-choice');
        });

        it('handles special characters in CSV', () => {
            const specialQuiz: Quiz[] = [{
                ...mockQuizzes[0],
                title: 'Title, with comma',
                question: 'Question\nNew Line"'
            }];
            const csv = exportQuizzesToCsv(specialQuiz);
            const line = csv.split('\n')[1];

            // Should be quoted
            expect(line).toContain('"Title, with comma"');
        });
    });
});
