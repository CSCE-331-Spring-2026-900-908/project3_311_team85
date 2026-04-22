const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const authService = {
  // Check if user is authenticated
  async checkAuth() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/status`, {
        credentials: 'include'
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Auth check failed:', error);
      return { authenticated: false };
    }
  },

  // Initiate Google OAuth login
  login() {
    window.location.href = `${API_BASE_URL}/auth/google`;
  },

  // Logout user
  async logout() {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        credentials: 'include'
      });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }
};
