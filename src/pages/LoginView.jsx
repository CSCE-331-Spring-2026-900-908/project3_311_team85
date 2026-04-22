import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './LoginView.css';

function LoginView() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'access_denied') {
      setError('Access denied. You are not authorized to access the manager page.');
    }
  }, [searchParams]);

  const handleGoogleLogin = () => {
    // Redirect to backend OAuth login
    window.location.href = '/auth/google';
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Manager Access Required</h2>
        <p>Please sign in with your authorized Google account to access the manager page.</p>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div className="login-actions">
          <button onClick={handleGoogleLogin} className="google-login-btn">
            Sign in with Google
          </button>
          <button onClick={handleGoHome} className="home-btn">
            Go to Home
          </button>
        </div>
        
        <div className="help-text">
          <p>If you believe you should have access, please contact an administrator.</p>
        </div>
      </div>
    </div>
  );
}

export default LoginView;
