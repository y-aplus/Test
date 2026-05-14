import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getQuizzes, deleteQuiz } from '../utils/storage';
import type { Quiz } from '../types/Quiz';
import { Trash2, PlusCircle } from 'lucide-react';

const HomePage = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);

    useEffect(() => {
        setQuizzes(getQuizzes());
    }, []);

    const handleDelete = (id: string, title: string) => {
        if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
            deleteQuiz(id);
            setQuizzes(getQuizzes()); // Refresh list
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ marginBottom: 0 }}>Dashboard</h1>
                {quizzes.length > 0 && (
                    <Link to="/create" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', backgroundColor: 'var(--primary)', color: 'white', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)' }}>
                        <PlusCircle size={18} /> New Quiz
                    </Link>
                )}
            </div>

            {quizzes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)' }}>You haven't created any quizzes yet</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Get started by creating your first quiz using our simple editor.</p>
                    <Link to="/create" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--primary)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 500 }}>
                        <PlusCircle size={20} /> Create Your First Quiz
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {quizzes.map(quiz => (
                        <div key={quiz.id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1.5rem',
                            backgroundColor: 'var(--bg-surface)',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: 'var(--shadow-sm)',
                            border: '1px solid var(--border)'
                        }}>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{quiz.title}</h3>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    {quiz.options.length} questions • {new Date(quiz.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => handleDelete(quiz.id, quiz.title)}
                                    title="Delete Quiz"
                                    aria-label={`Delete ${quiz.title}`}
                                    style={{ padding: '0.5rem', backgroundColor: 'transparent', color: 'var(--danger)', border: '1px solid var(--border)' }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HomePage;
