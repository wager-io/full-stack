// Route guard for /admin. Uses the shared AuthContext (Supabase session) so the
// admin panel only renders for users whose profile has is_admin = true.
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RequireAdmin({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white" style={{ background: '#1a1a2e' }}>
        Checking access…
      </div>
    );
  }

  // Not signed in → send to the public site (login modal lives there).
  if (!user) return <Navigate to="/" replace />;

  // Signed in but not an admin → bounce to the casino home.
  if (!user.is_admin) return <Navigate to="/" replace />;

  return children;
}
