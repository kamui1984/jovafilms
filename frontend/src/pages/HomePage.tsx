import { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { MovieCard } from '../components/movies/MovieCard';
import { SearchBar } from '../components/movies/SearchBar';
import { movieService } from '../services/movieService';
import { Movie, MovieSearchQuery } from '../types';
import { Loader2 } from 'lucide-react';

export function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState<MovieSearchQuery>({});

  useEffect(() => {
    loadMovies();
  }, [page, searchQuery]);

  const loadMovies = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = Object.keys(searchQuery).length > 0
        ? await movieService.searchMovies({ ...searchQuery, page })
        : await movieService.getAllMovies(page);
      
      setMovies(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar películas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: MovieSearchQuery) => {
    setSearchQuery(query);
    setPage(1);
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Catálogo de Películas
        </h1>
        <p className="text-gray-600">
          Explora, busca y reseña tus películas favoritas
        </p>
      </div>

      <SearchBar onSearch={handleSearch} />

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 text-red-600 animate-spin" />
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-600 text-lg">
            No se encontraron películas
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-gray-700">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
