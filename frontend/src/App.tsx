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
  cast: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  validated: boolean;
  createdAt: string;
  user: {
    name: string;
  };
}

function MoviesPage({ onLogout }: { onLogout: () => void }) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMovies = async (search = '') => {
    try {
      const token = localStorage.getItem('token');
      const url = search 
        ? `http://localhost:3000/api/movies/search?title=${encodeURIComponent(search)}`
        : 'http://localhost:3000/api/movies';
      
      const response = await fetch(url, {
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

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMovies(searchTerm);
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando películas...</div>;
  }

  if (selectedMovie) {
    return <MovieDetailPage movie={selectedMovie} onBack={() => setSelectedMovie(null)} />;
  }

  if (showAddMovie) {
    return <AddMovieForm onBack={() => setShowAddMovie(false)} onSuccess={() => { setShowAddMovie(false); fetchMovies(); }} />;
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
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setShowAddMovie(true)}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#16a34a', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
          >
            + Agregar Película
          </button>
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
        </div>
      </header>
      
      <main style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '30px' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Buscar películas por título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '12px 24px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Buscar
            </button>
            {searchTerm && (
              <button
                type="button"
                onClick={() => { setSearchTerm(''); fetchMovies(); }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Limpiar
              </button>
            )}
          </form>
        </div>

        <h2>Catálogo de Películas ({movies.length})</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '20px',
          marginTop: '20px'
        }}>
          {movies.map(movie => (
            <div 
              key={movie.id} 
              onClick={() => setSelectedMovie(movie)}
              style={{ 
                backgroundColor: 'white', 
                padding: '20px', 
                borderRadius: '8px', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
            >
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

// Componente para ver detalles de película y agregar reseñas
function MovieDetailPage({ movie, onBack }: { movie: Movie; onBack: () => void }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/movies/${movie.id}/reviews`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (err) {
      console.error('Error al cargar reseñas:', err);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ movieId: movie.id, rating, comment })
      });

      if (response.ok) {
        setMessage('✅ Reseña agregada exitosamente. Será validada en los próximos minutos.');
        setComment('');
        setRating(5);
        fetchReviews();
      } else {
        setMessage('❌ Error al agregar reseña');
      }
    } catch (err) {
      setMessage('❌ Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '40px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <button
          onClick={onBack}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          ← Volver
        </button>

        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', marginBottom: '30px' }}>
          <h1 style={{ margin: '0 0 10px 0' }}>{movie.title} ({movie.year})</h1>
          <p style={{ color: '#666', margin: '5px 0' }}><strong>Director:</strong> {movie.director}</p>
          <p style={{ color: '#666', margin: '5px 0' }}><strong>Género:</strong> {movie.genre}</p>
          <p style={{ color: '#666', margin: '5px 0' }}><strong>Reparto:</strong> {movie.cast}</p>
          <p style={{ margin: '15px 0' }}>{movie.synopsis}</p>
          <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
            <span style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '18px' }}>
              ⭐ {movie.averageRating > 0 ? movie.averageRating.toFixed(1) : 'Sin calificar'} / 5.0
            </span>
            <span style={{ color: '#666', marginLeft: '15px' }}>
              ({movie.reviewCount} reseña{movie.reviewCount !== 1 ? 's' : ''})
            </span>
          </div>
        </div>

        {/* Formulario para agregar reseña */}
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', marginBottom: '30px' }}>
          <h2 style={{ marginTop: 0 }}>Agregar Reseña</h2>
          <form onSubmit={handleSubmitReview}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Calificación: {rating} / 5
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Comentario:
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                rows={4}
                placeholder="Escribe tu opinión sobre la película..."
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
              <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                Nota: Las palabras en MAYÚSCULAS serán convertidas automáticamente a minúsculas.
              </p>
            </div>
            {message && (
              <div style={{
                padding: '10px',
                marginBottom: '15px',
                backgroundColor: message.includes('✅') ? '#d1fae5' : '#fee2e2',
                borderRadius: '4px',
                color: message.includes('✅') ? '#065f46' : '#991b1b'
              }}>
                {message}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 24px',
                backgroundColor: loading ? '#9ca3af' : '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px'
              }}
            >
              {loading ? 'Enviando...' : 'Publicar Reseña'}
            </button>
          </form>
        </div>

        {/* Lista de reseñas */}
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px' }}>
          <h2 style={{ marginTop: 0 }}>Reseñas ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <p style={{ color: '#666' }}>Aún no hay reseñas para esta película.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {reviews.map(review => (
                <div key={review.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 'bold' }}>{review.user.name}</span>
                    <span style={{ color: '#dc2626', fontWeight: 'bold' }}>
                      ⭐ {review.rating} / 5
                    </span>
                  </div>
                  <p style={{ margin: '5px 0', color: '#374151' }}>{review.comment}</p>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '5px', fontSize: '12px', color: '#666' }}>
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                    {!review.validated && (
                      <span style={{ color: '#f59e0b' }}>⏳ Pendiente de validación</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente para agregar película
function AddMovieForm({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    year: new Date().getFullYear(),
    director: '',
    cast: '',
    synopsis: '',
    genre: '',
    posterUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const castArray = formData.cast.split(',').map(c => c.trim());
      
      const response = await fetch('http://localhost:3000/api/movies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, cast: castArray })
      });

      if (response.ok) {
        setMessage('✅ Película agregada exitosamente');
        setTimeout(() => onSuccess(), 1500);
      } else {
        const error = await response.json();
        setMessage(`❌ ${error.message || 'Error al agregar película'}`);
      }
    } catch (err) {
      setMessage('❌ Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '40px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <button
          onClick={onBack}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          ← Volver
        </button>

        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px' }}>
          <h1 style={{ marginTop: 0 }}>Agregar Nueva Película</h1>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Título *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Año *</label>
              <input
                type="number"
                required
                min="1900"
                max={new Date().getFullYear() + 5}
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Director *</label>
              <input
                type="text"
                required
                value={formData.director}
                onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Reparto * (separado por comas)
              </label>
              <input
                type="text"
                required
                placeholder="Actor 1, Actor 2, Actor 3"
                value={formData.cast}
                onChange={(e) => setFormData({ ...formData, cast: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Género *</label>
              <input
                type="text"
                required
                placeholder="Acción, Drama, Comedia, etc."
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Sinopsis *</label>
              <textarea
                required
                rows={4}
                value={formData.synopsis}
                onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                URL del Póster (opcional)
              </label>
              <input
                type="url"
                placeholder="https://ejemplo.com/poster.jpg"
                value={formData.posterUrl}
                onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            {message && (
              <div style={{
                padding: '10px',
                marginBottom: '15px',
                backgroundColor: message.includes('✅') ? '#d1fae5' : '#fee2e2',
                borderRadius: '4px',
                color: message.includes('✅') ? '#065f46' : '#991b1b'
              }}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 24px',
                backgroundColor: loading ? '#9ca3af' : '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                width: '100%'
              }}
            >
              {loading ? 'Agregando...' : 'Agregar Película'}
            </button>
          </form>
        </div>
      </div>
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
