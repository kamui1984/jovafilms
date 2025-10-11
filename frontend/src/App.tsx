import { useState, useEffect } from 'react';

interface Movie {
  id: number;
  title: string;
  year: number;
  director: string;
  genre: string;
  synopsis: string;
  averageRating: number;
  reviewCount: number;
}

function MoviesPage({ onLogout }: { onLogout: () => void }) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/movies', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setMovies(data.data);
        }
      } catch (err) {
        console.error('Error al cargar películas:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando películas...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <header style={{ 
        backgroundColor: 'white', 
        padding: '20px 40px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0 }}>🎬 JovaFilms</h1>
        <button 
          onClick={onLogout}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#dc2626', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          Cerrar Sesión
        </button>
      </header>
      
      <main style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2>Catálogo de Películas ({movies.length})</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '20px',
          marginTop: '20px'
        }}>
          {movies.map(movie => (
            <div key={movie.id} style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '8px', 
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
            }}>
              <h3 style={{ margin: '0 0 10px 0' }}>{movie.title} ({movie.year})</h3>
              <p style={{ color: '#666', margin: '5px 0' }}><strong>Director:</strong> {movie.director}</p>
              <p style={{ color: '#666', margin: '5px 0' }}><strong>Género:</strong> {movie.genre}</p>
              <p style={{ margin: '10px 0', fontSize: '14px' }}>{movie.synopsis.substring(0, 150)}...</p>
              <div style={{ 
                marginTop: '10px', 
                paddingTop: '10px', 
                borderTop: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ color: '#dc2626', fontWeight: 'bold' }}>
                  ⭐ {movie.averageRating > 0 ? movie.averageRating.toFixed(1) : 'Sin calificar'}
                </span>
                <span style={{ color: '#666', fontSize: '14px' }}>
                  {movie.reviewCount} reseña{movie.reviewCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        setIsLoggedIn(true);
      } else {
        setError('Credenciales inválidas');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    }
  };

  if (isLoggedIn) {
    return <MoviesPage onLogout={() => setIsLoggedIn(false)} />;
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f3f4f6'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '40px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>🎬 JovaFilms</h1>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #ddd', 
                borderRadius: '4px' 
              }}
              required
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Contraseña:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #ddd', 
                borderRadius: '4px' 
              }}
              required
            />
          </div>
          {error && (
            <div style={{ 
              color: 'red', 
              marginBottom: '15px', 
              padding: '10px', 
              backgroundColor: '#fee', 
              borderRadius: '4px' 
            }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            style={{ 
              width: '100%', 
              padding: '12px', 
              backgroundColor: '#dc2626', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Iniciar Sesión
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
          Usuario de prueba: test@test.com / password123
        </p>
      </div>
    </div>
  );
}

export default App;
