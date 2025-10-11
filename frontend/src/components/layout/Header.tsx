import { Link, useNavigate } from 'react-router-dom';
import { Film, LogOut, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Film className="h-8 w-8 text-red-600" />
            <span className="text-2xl font-bold text-gray-900">JovaFilms</span>
          </Link>

          <nav className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-red-600 transition-colors"
            >
              Películas
            </Link>
            <Link
              to="/add-movie"
              className="text-gray-700 hover:text-red-600 transition-colors"
            >
              Agregar Película
            </Link>
            <Link
              to="/my-reviews"
              className="text-gray-700 hover:text-red-600 transition-colors"
            >
              Mis Reseñas
            </Link>

            <div className="flex items-center space-x-4 border-l pl-6">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-700">{user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Salir</span>
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
