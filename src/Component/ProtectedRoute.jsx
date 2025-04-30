import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';

const ProtectedRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);

  if (loading) return <div className="text-center mt-10 text-lg">Checking authentication...</div>;

  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
