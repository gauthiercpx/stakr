import { useState, useEffect } from 'react';
import { api } from '../api/client';

interface User {
  id: number;
  email: string;
  is_active: boolean;
}

interface DashboardProps {
    onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('auth/users/me')
      .then(response => {
        setUser(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Erreur session:", error);
        onLogout();
      });
  }, [onLogout]);

  return (
    <div style={{
        minHeight: '100vh',
        backgroundColor: '#f4f4f4',
        fontFamily: "'Baloo 2', cursive"
    }}>
      {/* --- Header Noir & Néon --- */}
      <nav style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 2rem',
          backgroundColor: '#000000', // Header Noir
          color: 'white',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-1px' }}>
            STAKR<span style={{ color: '#bff104' }}>.</span> {/* Point Néon */}
        </div>

        <button
            onClick={onLogout}
            style={{
                padding: '0.6rem 1.2rem',
                backgroundColor: 'transparent',
                color: '#bff104', // Texte Néon
                border: '2px solid #bff104', // Bordure Néon
                borderRadius: '0.75rem',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.9rem',
                transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#bff104';
                e.currentTarget.style.color = '#000';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#bff104';
            }}
        >
            Déconnexion
        </button>
      </nav>

      {/* --- Contenu Principal --- */}
      <main style={{ padding: '3rem', maxWidth: '1000px', margin: '0 auto' }}>

        {loading ? (
            <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '1.2rem' }}>
                Chargement... ⏳
            </div>
        ) : (
            <>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#000' }}>
                    Hello <span style={{ color: '#000', backgroundColor: '#bff104', padding: '0 5px' }}>
                        {user?.email.split('@')[0]}
                    </span> 👋
                </h1>
                <p style={{ color: '#666', marginBottom: '3rem', fontSize: '1.1rem' }}>
                    Prêt à gérer tes Stacks ?
                </p>

                {/* Grille de widgets */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '2rem'
                }}>

                    {/* Widget 1 : Info User */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '1.5rem',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                        border: '1px solid rgba(0,0,0,0.05)'
                    }}>
                        <h3 style={{ marginTop: 0, color: '#999', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Mon Compte
                        </h3>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '10px' }}>
                            #{user?.id}
                        </div>
                        <div style={{
                            display: 'inline-block',
                            marginTop: '15px',
                            padding: '5px 12px',
                            backgroundColor: user?.is_active ? '#e6fffa' : '#fff5f5',
                            color: user?.is_active ? '#00b894' : '#ff7675',
                            borderRadius: '20px',
                            fontSize: '0.9rem',
                            fontWeight: 700
                        }}>
                            {user?.is_active ? '● Actif' : '● Inactif'}
                        </div>
                    </div>

                    {/* Widget 2 : Action Rapide */}
                    <div style={{
                        backgroundColor: '#000',
                        color: 'white',
                        padding: '2rem',
                        borderRadius: '1.5rem',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}>
                        <div>
                            <h3 style={{ marginTop: 0, color: '#bff104', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Mes Stacks
                            </h3>
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '10px' }}>
                                0
                            </div>
                        </div>
                        <button style={{
                            marginTop: '20px',
                            padding: '12px',
                            backgroundColor: '#bff104',
                            color: '#000',
                            border: 'none',
                            borderRadius: '10px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            width: '100%'
                        }}>
                            + Créer une Stack
                        </button>
                    </div>
                </div>
            </>
        )}
      </main>
    </div>
  );
}