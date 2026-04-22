const express = require('express');
const router = express.Router();
const passport = require('passport');

// Google OAuth routes
router.get('/auth/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback', 
    passport.authenticate('google', { 
        successRedirect: '/manager',
        failureRedirect: '/login?error=access_denied'
    })
);

// Login page
router.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/manager');
    }
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Manager Login</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 50px; text-align: center; }
                .login-box { 
                    max-width: 400px; 
                    margin: 0 auto; 
                    padding: 20px; 
                    border: 1px solid #ddd; 
                    border-radius: 8px; 
                }
                .btn { 
                    display: inline-block; 
                    padding: 10px 20px; 
                    background: #4285f4; 
                    color: white; 
                    text-decoration: none; 
                    border-radius: 4px; 
                    margin: 10px 0;
                }
                .error { color: red; margin: 10px 0; }
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

// Logout
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('/login');
    });
});

// Manager page (protected)
router.get('/manager', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Manager Dashboard</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { 
                    background: #f5f5f5; 
                    padding: 20px; 
                    border-radius: 8px; 
                    margin-bottom: 20px; 
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
            </style>
        </head>
        <body>
            <div class="header">
                <div class="user-info">
                    <div>
                        <img src="${req.user.avatar}" alt="Avatar" class="avatar">
                        <span>Welcome, ${req.user.name} (${req.user.email})</span>
                    </div>
                    <a href="/logout" class="btn">Logout</a>
                </div>
            </div>
            
            <h1>Manager Dashboard</h1>
            <p>You have successfully accessed the restricted manager page.</p>
            
            <!-- Your manager page content goes here -->
            <div>
                <h2>Management Tools</h2>
                <ul>
                    <li>User Management</li>
                    <li>Analytics Dashboard</li>
                    <li>Settings</li>
                    <li>Reports</li>
                </ul>
            </div>
        </body>
        </html>
    `);
});

module.exports = router;
