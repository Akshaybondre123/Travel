import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const initial = user?.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo">
          ✈️ Trip<span>Forge</span>
        </Link>
        <div className="nav-user">
          <span className="nav-avatar" title={user?.name}>
            {initial}
          </span>
          <span className="nav-name">{user?.name}</span>
          <button type="button" className="btn btn-ghost btn-signout" onClick={logout}>
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
