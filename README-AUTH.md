# OAuth Authentication for Manager Page

## Setup Instructions

### 1. Install Dependencies
```bash
npm install express express-session passport passport-google-oauth20
```

### 2. Configure Google OAuth
1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/auth/google/callback`
5. Copy Client ID and Client Secret

### 3. Set Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
SESSION_SECRET=your-random-session-secret
```

### 4. Configure Authorized Users
Edit the `AUTHORIZED_USERS` array in `auth-server.js`:
```javascript
const AUTHORIZED_USERS = [
    'user1@gmail.com',
    'user2@gmail.com', 
    'user3@company.com'
    // Add authorized users here
];
```

### 5. Start the Server
```bash
node auth-server.js
```

### 6. Test the Authentication
1. Visit `http://localhost:3000/manager` - should redirect to login
2. Click "Sign in with Google"
3. Sign in with an authorized email - should access manager page
4. Sign in with unauthorized email - should show access denied

## Security Features

- **Session Management**: Secure sessions with configurable expiration
- **User Authorization**: Only specified users can access manager page
- **OAuth Security**: Uses Google's secure OAuth 2.0 flow
- **CSRF Protection**: Built-in passport CSRF protection
- **HTTPS Ready**: Configurable for production HTTPS

## Customization

### Add More OAuth Providers
```javascript
// Add GitHub OAuth
const GitHubStrategy = require('passport-github2').Strategy;
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "/auth/github/callback"
}, callbackFunction));
```

### Database Integration
Replace the `AUTHORIZED_USERS` array with database lookup:
```javascript
async function isUserAuthorized(email) {
    const user = await User.findOne({ email: email });
    return user && user.isManager;
}
```

### Custom Styling
The HTML templates include inline CSS that can be customized for your brand.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | Yes |
| `SESSION_SECRET` | Session encryption secret | Yes |
| `NODE_ENV` | Environment (development/production) | No |
| `PORT` | Server port | No |

## Production Deployment

1. Set `NODE_ENV=production`
2. Use HTTPS (required for OAuth)
3. Set proper session secrets
4. Configure proper redirect URIs in Google Console
5. Use environment variable management (dotenv, etc.)

## API Endpoints

| Endpoint | Description | Auth Required |
|----------|-------------|---------------|
| `/login` | Login page | No |
| `/auth/google` | Google OAuth initiation | No |
| `/auth/google/callback` | OAuth callback | No |
| `/manager` | Protected manager page | Yes |
| `/logout` | Logout endpoint | Yes |
