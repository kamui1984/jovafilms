import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Layout } from '../components/layout/Layout';
import { movieService } from '../services/movieService';
import { PlusCircle } from 'lucide-react';

const movieSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  year: z.coerce.number().int().min(1888).max(new Date().getFullYear() + 5),
  director: z.string().min(1, 'El director es requerido'),
  cast: z.string().min(1, 'El elenco es requerido'),
  synopsis: z.string().min(10, 'La sinopsis debe tener al menos 10 caracteres'),
  genre: z.string().min(1, 'El género es requerido'),
  posterUrl: z.string().url('URL inválida').optional().or(z.literal(''))
});

type MovieFormData = z.infer<typeof movieSchema>;

export function AddMoviePage() {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<MovieFormData>({
    resolver: zodResolver(movieSchema)
  });

  const onSubmit = async (data: MovieFormData) => {
    try {
      setIsSubmitting(true);
      setError('');

      const castArray = data.cast
        .split(',')
        .map((actor) => actor.trim())
        .filter((actor) => actor.length > 0);

      await movieService.createMovie({
        title: data.title,
        year: data.year,
        director: data.director,
        cast: castArray,
        synopsis: data.synopsis,
        genre: data.genre,
        posterUrl: data.posterUrl || undefined
      });

      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al agregar película');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Agregar Nueva Película
          </h1>
          <p className="text-gray-600">
            Completa el formulario para agregar una película al catálogo
          </p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Título *
                </label>
                <input
                  id="title"
                  type="text"
                  {...register('title')}
                  className="input-field"
                  placeholder="Ej: The Shawshank Redemption"
                />
                {errors.title && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="year"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Año *
                </label>
                <input
                  id="year"
                  type="number"
                  {...register('year')}
                  className="input-field"
                  placeholder="2024"
                />
                {errors.year && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.year.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="director"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Director *
                </label>
                <input
                  id="director"
                  type="text"
                  {...register('director')}
                  className="input-field"
                  placeholder="Ej: Frank Darabont"
                />
                {errors.director && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.director.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="genre"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Género *
                </label>
                <input
                  id="genre"
                  type="text"
                  {...register('genre')}
                  className="input-field"
                  placeholder="Ej: Drama"
                />
                {errors.genre && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.genre.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="cast"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Elenco * (separado por comas)
              </label>
              <input
                id="cast"
                type="text"
                {...register('cast')}
                className="input-field"
                placeholder="Ej: Tim Robbins, Morgan Freeman, Bob Gunton"
              />
              {errors.cast && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.cast.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="synopsis"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Sinopsis *
              </label>
              <textarea
                id="synopsis"
                rows={5}
                {...register('synopsis')}
                className="input-field resize-none"
                placeholder="Describe brevemente la trama de la película..."
              />
              {errors.synopsis && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.synopsis.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="posterUrl"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                URL del Póster (opcional)
              </label>
              <input
                id="posterUrl"
                type="url"
                {...register('posterUrl')}
                className="input-field"
                placeholder="https://ejemplo.com/poster.jpg"
              />
              {errors.posterUrl && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.posterUrl.message}
                </p>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary disabled:opacity-50 flex items-center space-x-2"
              >
                <PlusCircle className="h-5 w-5" />
                <span>{isSubmitting ? 'Agregando...' : 'Agregar Película'}</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
