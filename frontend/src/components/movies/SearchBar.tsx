import { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: {
    title?: string;
    year?: number;
    director?: string;
    genre?: string;
  }) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [director, setDirector] = useState('');
  const [genre, setGenre] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const query: any = {};
    if (title) query.title = title;
    if (year) query.year = parseInt(year);
    if (director) query.director = director;
    if (genre) query.genre = genre;

    onSearch(query);
  };

  const handleClear = () => {
    setTitle('');
    setYear('');
    setDirector('');
    setGenre('');
    onSearch({});
  };

  return (
    <form onSubmit={handleSubmit} className="card mb-8">
      <div className="flex items-center space-x-2 mb-4">
        <Search className="h-5 w-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Buscar Películas</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <input
          type="text"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-field"
        />
        <input
          type="number"
          placeholder="Año"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Director"
          value={director}
          onChange={(e) => setDirector(e.target.value)}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Género"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="input-field"
        />
      </div>

      <div className="flex space-x-3">
        <button type="submit" className="btn-primary">
          Buscar
        </button>
        <button type="button" onClick={handleClear} className="btn-secondary">
          Limpiar
        </button>
      </div>
    </form>
  );
}
