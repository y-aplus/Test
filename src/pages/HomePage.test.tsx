import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import * as storage from '../utils/storage';
import type { Quiz } from '../types/Quiz';

// Mock the storage module
vi.mock('../utils/storage', () => ({
    getQuizzes: vi.fn(),
    deleteQuiz: vi.fn(),
    saveQuiz: vi.fn(), // If needed
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('HomePage', () => {
    const mockQuizzes: Quiz[] = [
        {
            id: '1',
            title: 'First Quiz',
            question: 'Q1',
            type: 'text',
            options: [],
            correctAnswer: 'A',
            createdAt: 1000,
            updatedAt: 1000,
        },
        {
            id: '2',
            title: 'Second Quiz',
            question: 'Q2',
            type: 'multiple-choice',
            options: [],
            correctAnswer: 'B',
            createdAt: 2000,
            updatedAt: 2000,
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders welcome message when no quizzes exist', () => {
        vi.mocked(storage.getQuizzes).mockReturnValue([]);
        render(
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>
        );

        // expect(screen.getByText(/Welcome to Quiz Smith/i)).toBeInTheDocument(); // Removed in new design
        expect(screen.getByText(/You haven't created any quizzes yet/i)).toBeInTheDocument();
        expect(screen.getByText(/Create Your First Quiz/i)).toBeInTheDocument();
    });

    it('renders list of quizzes when they exist', () => {
        vi.mocked(storage.getQuizzes).mockReturnValue(mockQuizzes);
        render(
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>
        );

        expect(screen.getByText('First Quiz')).toBeInTheDocument();
        expect(screen.getByText('Second Quiz')).toBeInTheDocument();
        expect(screen.queryByText(/You haven't created any quizzes yet/i)).not.toBeInTheDocument();
    });

    it('deletes a quiz when delete button is clicked and confirmed', async () => {
        vi.mocked(storage.getQuizzes).mockReturnValue(mockQuizzes);
        // Mock window.confirm to return true
        vi.spyOn(window, 'confirm').mockImplementation(() => true);

        render(
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>
        );

        // Find delete buttons. Assuming we add an accessible name or test id later.
        // For now, let's assume we'll use aria-label="Delete First Quiz" or similar, 
        // or just find by button text/icon if possible. 
        // Let's use getAllByRole('button') and filtering, or simpler: aria-label.
        // We will implement the button with aria-label="Delete [Quiz Title]"

        // Waiting for the user to implement accessible buttons. 
        // Using simple text match for "Delete" if we add text labels, or finding by role.
        // Let's assume we render a "Delete" button for each quiz.
        const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
        expect(deleteButtons).toHaveLength(2);

        fireEvent.click(deleteButtons[0]); // Delete first quiz

        expect(window.confirm).toHaveBeenCalled();
        expect(storage.deleteQuiz).toHaveBeenCalledWith('1');

        // After delete, the list should refresh. 
        // In a real integration test, we might need to check if the item disappears.
        // Since we mocked getQuizzes, the component needs to re-fetch or optimistically update.
        // Let's verifying storage.deleteQuiz was called is enough for unit test logic.
    });

    it('navigates to create page when create button is clicked', () => {
        vi.mocked(storage.getQuizzes).mockReturnValue([]);
        render(
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>
        );

        const createButton = screen.getByRole('link', { name: /create your first quiz/i });
        // Since it's a link, we check if it has the correct href or just click it if we want to test router integration.
        // But unit testing Links is usually just checking href.
        expect(createButton).toHaveAttribute('href', '/create');
    });
});
