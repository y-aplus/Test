import React, { useState } from 'react';
import type { Quiz, QuizOption, QuizType } from '../types/Quiz';
import { validateQuiz } from '../utils/quizValidation';
import QuizPreview from './QuizPreview';

interface QuizEditorProps {
    onSave: (quiz: Quiz) => void;
    initialQuiz?: Quiz;
}

const QuizEditor: React.FC<QuizEditorProps> = ({ onSave, initialQuiz }) => {
    const [title, setTitle] = useState(initialQuiz?.title || '');
    const [question, setQuestion] = useState(initialQuiz?.question || '');
    const [type, setType] = useState<QuizType>(initialQuiz?.type || 'multiple-choice');
    const [options, setOptions] = useState<QuizOption[]>(initialQuiz?.options || []);
    const [correctAnswer, setCorrectAnswer] = useState<string | string[]>(initialQuiz?.correctAnswer || '');
    const [explanation, setExplanation] = useState(initialQuiz?.explanation || '');

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSave = () => {
        const quiz = createQuizObject();
        const validationResult = validateQuiz(quiz);
        if (!validationResult.isValid) {
            setErrors(validationResult.errors);
            return;
        }
        onSave(quiz);
    };

    const createQuizObject = (): Quiz => ({
        id: initialQuiz?.id || crypto.randomUUID(),
        title,
        question,
        type,
        options,
        correctAnswer,
        explanation,
        createdAt: initialQuiz?.createdAt || Date.now(),
        updatedAt: Date.now()
    });

    const addOption = () => {
        const newOption: QuizOption = {
            id: crypto.randomUUID(),
            text: ''
        };
        setOptions([...options, newOption]);
    };

    const updateOption = (id: string, text: string) => {
        setOptions(options.map(opt => opt.id === id ? { ...opt, text } : opt));
    };

    const removeOption = (id: string) => {
        setOptions(options.filter(opt => opt.id !== id));
    };

    return (
        <div className="quiz-editor-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '2rem', alignItems: 'start' }}>

            {/* Editor Pane */}
            <div className="editor-pane">
                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Javascript Basics"
                    />
                    {errors.title && <div className="error">{errors.title}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="question">Question</label>
                    <textarea
                        id="question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        rows={4}
                        placeholder="Enter your question here..."
                    />
                    {errors.question && <div className="error">{errors.question}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="type">Type</label>
                    <select
                        id="type"
                        value={type}
                        onChange={(e) => setType(e.target.value as QuizType)}
                    >
                        <option value="multiple-choice">Multiple Choice</option>
                        <option value="text">Text Input</option>
                        <option value="boolean">True/False</option>
                    </select>
                </div>

                {type === 'multiple-choice' && (
                    <div className="form-group">
                        <label>Options</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {options.map((opt, index) => (
                                <div key={opt.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', width: '20px' }}>{index + 1}.</span>
                                    <input
                                        value={opt.text}
                                        onChange={(e) => updateOption(opt.id, e.target.value)}
                                        placeholder={`Option ${index + 1}`}
                                        style={{ flex: 1 }}
                                    />
                                    <input
                                        type="radio"
                                        name="correctAnswer"
                                        checked={correctAnswer === opt.id}
                                        onChange={() => setCorrectAnswer(opt.id)}
                                        title="Mark as correct answer"
                                        style={{ width: 'auto', margin: '0 0.5rem' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeOption(opt.id)}
                                        style={{ padding: '0.5rem', background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
                                        title="Remove option"
                                    >
                                        X
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addOption}
                                style={{
                                    background: 'var(--bg-subtle)',
                                    color: 'var(--primary)',
                                    border: '1px dashed var(--primary)',
                                    marginTop: '0.5rem'
                                }}
                            >
                                + Add Option
                            </button>
                        </div>
                        {errors.options && <div className="error">{errors.options}</div>}
                        {errors.correctAnswer && <div className="error">{errors.correctAnswer}</div>}
                    </div>
                )}

                {type === 'text' && (
                    <div className="form-group">
                        <label htmlFor="correctAnswer">Correct Answer (Text Matching)</label>
                        <input
                            id="correctAnswer"
                            type="text"
                            value={correctAnswer as string}
                            onChange={(e) => setCorrectAnswer(e.target.value)}
                            placeholder="e.g., 42"
                        />
                        {errors.correctAnswer && <div className="error">{errors.correctAnswer}</div>}
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="explanation">Explanation (Optional)</label>
                    <textarea
                        id="explanation"
                        value={explanation}
                        onChange={(e) => setExplanation(e.target.value)}
                        rows={3}
                        placeholder="Explain why the answer is correct..."
                    />
                </div>

                <div style={{ marginTop: '2rem' }}>
                    <button onClick={handleSave} style={{ width: '100%', fontSize: '1.1rem' }}>Save Quiz</button>
                </div>
            </div>

            {/* Preview Pane */}
            <div className="preview-pane">
                <QuizPreview quiz={createQuizObject()} />
            </div>

        </div>
    );
};

export default QuizEditor;
