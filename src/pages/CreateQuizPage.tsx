import React from 'react';
import { useNavigate } from 'react-router-dom';
import QuizEditor from '../components/QuizEditor';
import { saveQuiz } from '../utils/storage';
import type { Quiz } from '../types/Quiz';

const CreateQuizPage = () => {
    const navigate = useNavigate();

    const handleSave = (quiz: Quiz) => {
        saveQuiz(quiz);
        navigate('/');
    };

    return (
        <div>
            <h1 style={{ marginBottom: '1.5rem' }}>Create New Quiz</h1>
            <div style={{ backgroundColor: 'var(--bg-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
                <QuizEditor onSave={handleSave} />
            </div>
        </div>
    );
};

export default CreateQuizPage;
