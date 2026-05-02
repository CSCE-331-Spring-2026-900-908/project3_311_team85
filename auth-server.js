const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
const PORT = process.env.PORT || 3000;

// Authorized users list (you can move this to database)
const AUTHORIZED_USERS = [
    'user1@gmail.com',
    'user2@gmail.com', 
    'user3@company.com'
    // Add authorized users here
];

// Middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.NODE_ENV === 'production' 
        ? `${process.env.PRODUCTION_URL || "https://your-production-domain.com"}/auth/google/callback`
        : "http://localhost:3000/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const userEmail = profile.emails[0].value;
        
        // Check if user is authorized
        if (AUTHORIZED_USERS.includes(userEmail)) {
            return done(null, {
                id: profile.id,
                email: userEmail,
                name: profile.displayName,
                avatar: profile.photos[0].value
            });
        } else {
            return done(null, false, { message: 'Access denied. User not authorized.' });
        }
    } catch (error) {
        return done(error, null);
    }
}));

// Serialize/deserialize user
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Middleware to check authentication
function requireAuth(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// Routes
app.get('/auth/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', 
    passport.authenticate('google', { 
        successRedirect: '/manager',
        failureRedirect: '/login?error=access_denied'
    })
);

app.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/manager');
    }
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Manager Login</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 50px; text-align: center; background: #f5f5f5; }
                .login-box { 
                    max-width: 400px; 
                    margin: 100px auto; 
                    padding: 30px; 
                    background: white; 
                    border-radius: 8px; 
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .btn { 
                    display: inline-block; 
                    padding: 12px 24px; 
                    background: #4285f4; 
                    color: white; 
                    text-decoration: none; 
                    border-radius: 4px; 
                    margin: 10px 0;
                    font-weight: bold;
                }
                .btn:hover { background: #357ae8; }
                .error { 
                    color: #d32f2f; 
                    background: #ffebee; 
                    padding: 10px; 
                    border-radius: 4px; 
                    margin: 10px 0; 
                }
                h2 { color: #333; margin-bottom: 20px; }
                p { color: #666; }
            </style>
        </head>
        <body>
            <div class="login-box">
                <h2>Manager Access Required</h2>
                <p>Please sign in with your authorized Google account to access the manager page.</p>
                ${req.query.error === 'access_denied' ? '<div class="error">Access denied. You are not authorized to access this page.</div>' : ''}
                <a href="/auth/google" class="btn">Sign in with Google</a>
            </div>
        </body>
        </html>
    `);
});

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('/login');
    });
});

app.get('/manager', requireAuth, (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Manager Dashboard</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
                .header { 
                    background: white; 
                    padding: 20px; 
                    border-radius: 8px; 
                    margin-bottom: 20px; 
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .user-info { 
                    display: flex; 
                    align-items: center; 
                    justify-content: space-between; 
                }
                .avatar { 
                    width: 40px; 
                    height: 40px; 
                    border-radius: 50%; 
                    margin-right: 10px; 
                }
                .btn { 
                    padding: 8px 16px; 
                    background: #dc3545; 
                    color: white; 
                    text-decoration: none; 
                    border-radius: 4px; 
                }
                .btn:hover { background: #c82333; }
                .content { 
                    background: white; 
                    padding: 20px; 
                    border-radius: 8px; 
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                h1 { color: #333; }
                .tools { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 20px; }
                .tool-card { 
                    background: #f8f9fa; 
                    padding: 20px; 
                    border-radius: 8px; 
                    border-left: 4px solid #4285f4;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="user-info">
                    <div style="display: flex; align-items: center;">
                        <img src="${req.user.avatar}" alt="Avatar" class="avatar">
                        <span><strong>${req.user.name}</strong><br><small>${req.user.email}</small></span>
                    </div>
                    <a href="/logout" class="btn">Logout</a>
                </div>
            </div>
            
            <div class="content">
                <h1>Manager Dashboard</h1>
                <p>Welcome! You have successfully accessed the restricted manager page.</p>
                
                <div class="tools">
                    <div class="tool-card">
                        <h3>User Management</h3>
                        <p>Manage user accounts and permissions</p>
                    </div>
                    <div class="tool-card">
                        <h3>Analytics Dashboard</h3>
                        <p>View system analytics and reports</p>
                    </div>
                    <div class="tool-card">
                        <h3>Settings</h3>
                        <p>Configure system settings</p>
                    </div>
                    <div class="tool-card">
                        <h3>Reports</h3>
                        <p>Generate and view reports</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `);
});

// Start server
app.listen(PORT, () => {
    console.log(`Auth server running on port ${PORT}`);
    console.log('Make sure to set these environment variables:');
    console.log('- GOOGLE_CLIENT_ID');
    console.log('- GOOGLE_CLIENT_SECRET');
    console.log('- SESSION_SECRET');
});
