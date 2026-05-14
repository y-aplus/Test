import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuizEditor from './QuizEditor';
import type { Quiz } from '../types/Quiz';

describe('QuizEditor Component', () => {
    it('renders form elements', () => {
        const onSave = vi.fn();
        render(<QuizEditor onSave={onSave} />);

        expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Question/i)).toBeInTheDocument();
    });

    it('shows validation error when saving empty form', async () => {
        const onSave = vi.fn();
        render(<QuizEditor onSave={onSave} />);
        const user = userEvent.setup();

        const saveButton = screen.getByRole('button', { name: /Save/i });
        await user.click(saveButton);

        expect(screen.getByText(/Title is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Question is required/i)).toBeInTheDocument();
        expect(onSave).not.toHaveBeenCalled();
    });

    it('calls onSave with quiz data when form is valid', async () => {
        const onSave = vi.fn();
        render(<QuizEditor onSave={onSave} />);
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/Title/i), 'My Quiz');
        await user.type(screen.getByLabelText(/Question/i), 'What is 1+1?');

        // Default type is multiple-choice, so need to add options
        // Initial state might have 0 or 2 options depending on implementation, 
        // but assuming we start empty or need to fill them.
        // However, to keep this test simple for TDD start, let's switch to 'text' type if possible, 
        // or fill options if the form shows them.
        // Let's assume there is a type selector.

        const typeSelect = screen.getByLabelText(/Type/i);
        await user.selectOptions(typeSelect, 'text');

        // Correct answer for text question
        await user.type(screen.getByLabelText(/Correct Answer/i), '2');

        await user.click(screen.getByRole('button', { name: /Save/i }));

        expect(onSave).toHaveBeenCalledTimes(1);
        const savedQuiz = onSave.mock.calls[0][0] as Quiz;
        expect(savedQuiz.title).toBe('My Quiz');
        expect(savedQuiz.question).toBe('What is 1+1?');
        expect(savedQuiz.type).toBe('text');
        expect(savedQuiz.correctAnswer).toBe('2');
    });
});
