import { Download } from 'lucide-react';
import { getQuizzes } from '../utils/storage';
import { exportQuizzesToJson, exportQuizzesToCsv } from '../utils/exportUtils';

const SettingsPage = () => {
    const handleExportJson = () => {
        const quizzes = getQuizzes();
        const json = exportQuizzesToJson(quizzes);
        downloadFile(json, `quiz-smith-backup-${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
    };

    const handleExportCsv = () => {
        const quizzes = getQuizzes();
        const csv = exportQuizzesToCsv(quizzes);
        downloadFile(csv, `quiz-smith-export-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
    };

    const downloadFile = (content: string, filename: string, type: string) => {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Settings</h1>

            <div style={{ backgroundColor: 'var(--bg-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Data Management</h2>

                <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
                    Export your quizzes to back them up or use them in other applications.
                </p>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button onClick={handleExportJson} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Download size={18} /> Export as JSON
                    </button>

                    <button onClick={handleExportCsv} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border)' }}>
                        <Download size={18} /> Export as CSV
                    </button>
                </div>
            </div>

            <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Version 1.0.0
            </div>
        </div>
    );
};

export default SettingsPage;
