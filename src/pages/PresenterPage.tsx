import { useEffect, useState, useCallback } from 'react';
import { getQuizzes } from '../utils/storage';
import { formatQuestionForCopy, formatAnswerForCopy } from '../utils/quizFormatter';
import type { Quiz } from '../types/Quiz';
import { ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const PresenterPage = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [copiedQ, setCopiedQ] = useState(false);
    const [copiedA, setCopiedA] = useState(false);

    useEffect(() => {
        const data = getQuizzes();
        // Sort by createdAt ASC (Oldest first) for presentation order
        const sorted = [...data].sort((a, b) => a.createdAt - b.createdAt);
        setQuizzes(sorted);
    }, []);

    const handleNext = useCallback(() => {
        if (currentIndex < quizzes.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setCopiedQ(false);
            setCopiedA(false);
        }
    }, [currentIndex, quizzes.length]);

    const handlePrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setCopiedQ(false);
            setCopiedA(false);
        }
    }, [currentIndex]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNext, handlePrev]);

    const copyToClipboard = async (text: string, isQuestion: boolean) => {
        try {
            await navigator.clipboard.writeText(text);
            if (isQuestion) {
                setCopiedQ(true);
                setTimeout(() => setCopiedQ(false), 2000);
            } else {
                setCopiedA(true);
                setTimeout(() => setCopiedA(false), 2000);
            }
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    if (quizzes.length === 0) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>No quizzes available</h2>
                <p>Please create some quizzes first.</p>
                <Link to="/create">Create Quiz</Link>
            </div>
        );
    }

    const currentQuiz = quizzes[currentIndex];

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem', height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            {/* Header controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {currentIndex + 1} / {quizzes.length}
                </span>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        aria-label="Previous"
                        style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 1rem', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: currentIndex === 0 ? 'not-allowed' : 'pointer', opacity: currentIndex === 0 ? 0.5 : 1 }}
                    >
                        <ChevronLeft size={20} /> Prev
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={currentIndex === quizzes.length - 1}
                        aria-label="Next"
                        style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 1rem', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: currentIndex === quizzes.length - 1 ? 'not-allowed' : 'pointer', opacity: currentIndex === quizzes.length - 1 ? 0.5 : 1 }}
                    >
                        Next <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Question Card */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem',
                backgroundColor: 'var(--bg-surface)',
                padding: '3rem',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--border)',
                marginBottom: '2rem'
            }}>
                {/* Question Section */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Question</h2>
                        <button
                            onClick={() => copyToClipboard(formatQuestionForCopy(currentQuiz, currentIndex + 1), true)}
                            aria-label="Copy Question"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.8rem',
                                padding: '0.4rem 0.8rem',
                                backgroundColor: copiedQ ? 'var(--success-bg)' : 'var(--bg-subtle)',
                                color: copiedQ ? 'var(--success-text)' : 'var(--text-main)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-sm)',
                                transition: 'all 0.2s'
                            }}
                        >
                            {copiedQ ? <Check size={14} /> : <Copy size={14} />}
                            {copiedQ ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '500', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                        {currentQuiz.question}
                    </div>
                </div>

                <hr style={{ border: 0, borderTop: '1px dashed var(--border)', margin: 0 }} />

                {/* Answer Section */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--secondary)', letterSpacing: '0.05em' }}>Correct Answer</h2>
                        <button
                            onClick={() => copyToClipboard(formatAnswerForCopy(currentQuiz, true), false)}
                            aria-label="Copy Answer"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.8rem',
                                padding: '0.4rem 0.8rem',
                                backgroundColor: copiedA ? 'var(--success-bg)' : 'var(--bg-subtle)',
                                color: copiedA ? 'var(--success-text)' : 'var(--text-main)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-sm)',
                                transition: 'all 0.2s'
                            }}
                        >
                            {copiedA ? <Check size={14} /> : <Copy size={14} />}
                            {copiedA ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                    <div style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 'bold' }}>
                        {/* Logic to display answer text directly same as formatter logic but for UI */}
                        {(() => {
                            if (currentQuiz.type === 'multiple-choice' || currentQuiz.type === 'multi-select') {
                                const answerIds = Array.isArray(currentQuiz.correctAnswer) ? currentQuiz.correctAnswer : [currentQuiz.correctAnswer as string];
                                const answerTexts = answerIds.map(id => {
                                    const option = currentQuiz.options.find(opt => opt.id === id);
                                    return option ? option.text : id;
                                });
                                return answerTexts.join(', ');
                            } else if (Array.isArray(currentQuiz.correctAnswer)) {
                                return currentQuiz.correctAnswer.join(', ');
                            }
                            return currentQuiz.correctAnswer;
                        })()}
                    </div>
                    {currentQuiz.explanation && (
                        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                            <span style={{ fontWeight: 'bold' }}>解説: </span> {currentQuiz.explanation}
                        </div>
                    )}
                </div>
            </div>

            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Use Arrow Keys (← / →) to navigate
            </div>
        </div>
    );
};

export default PresenterPage;
