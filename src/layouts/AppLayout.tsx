import { Link, Outlet } from 'react-router-dom';
import { Home, PlusCircle, Settings } from 'lucide-react';

const AppLayout = () => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-app)' }}>
            <aside style={{ width: '250px', backgroundColor: 'var(--bg-surface)', borderRight: '1px solid var(--border)', padding: '1.5rem' }}>
                <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>Quiz Smith</h2>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Link to="/" style={navLinkStyle}>
                        <Home size={20} /> Home
                    </Link>
                    <Link to="/create" style={navLinkStyle}>
                        <PlusCircle size={20} /> Create Quiz
                    </Link>
                    <Link to="/present" style={navLinkStyle}>
                        <span style={{ fontSize: '1.25rem' }}>🎙️</span> Presenter
                    </Link>
                    <div style={{ marginTop: 'auto' }}></div>
                    <Link to="/settings" style={navLinkStyle}>
                        <Settings size={20} /> Settings
                    </Link>
                </nav>
            </aside>
            <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

const navLinkStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    textDecoration: 'none',
    color: 'var(--text-main)',
    borderRadius: 'var(--radius-md)',
    transition: 'background-color 0.2s',
    cursor: 'pointer'
};

export default AppLayout;
