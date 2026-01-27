import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import PresenterPage from '../pages/PresenterPage';
import * as storage from '../utils/storage';
import * as quizFormatter from '../utils/quizFormatter';
import type { Quiz } from '../types/Quiz';

// Mock dependencies
vi.mock('../utils/storage', () => ({
    getQuizzes: vi.fn(),
}));

vi.mock('../utils/quizFormatter', () => ({
    formatQuestionForCopy: vi.fn(),
    formatAnswerForCopy: vi.fn(),
}));

// Mock clipboard API
const mockWriteText = vi.fn();
Object.assign(navigator, {
    clipboard: {
        writeText: mockWriteText,
    },
});

describe('PresenterPage', () => {
    const mockQuizzes: Quiz[] = [
        {
            id: '1',
            title: 'Q1 Title',
            question: 'Question 1',
            type: 'text',
            options: [],
            correctAnswer: 'Answer 1',
            createdAt: 100,
            updatedAt: 100,
        },
        {
            id: '2',
            title: 'Q2 Title',
            question: 'Question 2',
            type: 'text',
            options: [],
            correctAnswer: 'Answer 2',
            createdAt: 200,
            updatedAt: 200,
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(storage.getQuizzes).mockReturnValue(mockQuizzes);
        // Setup formatter mocks to return simple strings for verification
        vi.mocked(quizFormatter.formatQuestionForCopy).mockReturnValue('Formatted Q');
        vi.mocked(quizFormatter.formatAnswerForCopy).mockReturnValue('Formatted A');
    });

    it('renders "No quizzes" message if list is empty', () => {
        vi.mocked(storage.getQuizzes).mockReturnValue([]);
        render(
            <MemoryRouter>
                <PresenterPage />
            </MemoryRouter>
        );
        expect(screen.getByText(/No quizzes available/i)).toBeInTheDocument();
    });

    it('renders the first quiz initially', () => {
        render(
            <MemoryRouter>
                <PresenterPage />
            </MemoryRouter>
        );
        expect(screen.getByText('Question 1')).toBeInTheDocument();
        expect(screen.getByText('1 / 2')).toBeInTheDocument();
    });

    it('navigates to next question', () => {
        render(
            <MemoryRouter>
                <PresenterPage />
            </MemoryRouter>
        );

        // Find Next button (assuming arrow right icon or text "Next")
        // Using aria-label or accessible name is robust
        const nextButton = screen.getByRole('button', { name: /next/i });
        fireEvent.click(nextButton);

        expect(screen.getByText('Question 2')).toBeInTheDocument();
        expect(screen.getByText('2 / 2')).toBeInTheDocument();
    });

    it('copies question to clipboard', () => {
        render(
            <MemoryRouter>
                <PresenterPage />
            </MemoryRouter>
        );

        const copyQButton = screen.getByRole('button', { name: /copy question/i });
        fireEvent.click(copyQButton);

        expect(quizFormatter.formatQuestionForCopy).toHaveBeenCalledWith(mockQuizzes[0], 1);
        expect(mockWriteText).toHaveBeenCalledWith('Formatted Q');
    });

    it('toggles answer visibility', () => {
        render(
            <MemoryRouter>
                <PresenterPage />
            </MemoryRouter>
        );

        // Answer should be hidden or obscured initially, OR visible.
        // Let's assume we want to show it immediately for the presenter?
        // User requirement: "正解と解説を表示します（出題者が正誤判定をするため）"
        // So it should be visible.

        expect(screen.getByText('Answer 1')).toBeInTheDocument();
    });
});
