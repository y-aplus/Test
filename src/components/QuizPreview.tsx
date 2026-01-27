import React from 'react';
import type { Quiz } from '../types/Quiz';

interface QuizPreviewProps {
    quiz: Quiz;
}

const QuizPreview: React.FC<QuizPreviewProps> = ({ quiz }) => {
    return (
        <div className="quiz-preview" style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            backgroundColor: 'var(--bg-surface)',
            height: '100%',
            position: 'sticky',
            top: '1rem'
        }}>
            <div style={{
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                color: 'var(--text-muted)',
                marginBottom: '1rem',
                borderBottom: '1px solid var(--border)',
                paddingBottom: '0.5rem'
            }}>
                Real-time Preview
            </div>

            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', lineHeight: '1.4' }}>
                {quiz.title || <span style={{ color: 'var(--text-muted)' }}>Untitled Quiz</span>}
            </h3>

            <div style={{
                marginBottom: '2rem',
                fontSize: '1rem',
                whiteSpace: 'pre-wrap',
                color: quiz.question ? 'var(--text-main)' : 'var(--text-muted)'
            }}>
                Q. {quiz.question || 'Question text will appear here...'}
            </div>

            <div className="preview-options">
                {quiz.type === 'text' ? (
                    <input
                        type="text"
                        disabled
                        placeholder="Type your answer here..."
                        style={{ width: '100%', padding: '0.75rem', cursor: 'not-allowed', opacity: 0.7 }}
                    />
                ) : quiz.type === 'multiple-choice' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {quiz.options && quiz.options.length > 0 ? (
                            quiz.options.map((option, index) => (
                                <button
                                    key={option.id || index}
                                    disabled
                                    style={{
                                        textAlign: 'left',
                                        backgroundColor: 'var(--bg-subtle)',
                                        color: 'var(--text-main)',
                                        border: '1px solid var(--border)',
                                        width: '100%',
                                        cursor: 'not-allowed',
                                        opacity: 0.9
                                    }}
                                >
                                    <span style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>{index + 1}.</span>
                                    {option.text || <span style={{ color: 'var(--text-muted)' }}>Option {index + 1}</span>}
                                </button>
                            ))
                        ) : (
                            <div style={{
                                padding: '1rem',
                                border: '1px dashed var(--border)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--text-muted)',
                                textAlign: 'center'
                            }}>
                                Add options to see them here
                            </div>
                        )}
                    </div>
                ) : (
                    <p style={{ color: 'var(--text-muted)' }}>Preview not implemented for this type yet.</p>
                )}
            </div>

            {quiz.correctAnswer && (
                <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--secondary)' }}>
                    <strong>Correct Answer:</strong> {
                        Array.isArray(quiz.correctAnswer)
                            ? quiz.correctAnswer.join(', ')
                            : quiz.type === 'multiple-choice'
                                ? (quiz.options.find(o => o.id === quiz.correctAnswer)?.text || quiz.correctAnswer)
                                : quiz.correctAnswer
                    }
                </div>
            )}
        </div>
    );
};

export default QuizPreview;
