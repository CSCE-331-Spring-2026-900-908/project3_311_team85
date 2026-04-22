const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');

// Authorized users list (you can move this to database)
const AUTHORIZED_USERS = [
    'dsenaarul@tamu.edu',
    'aayush_gadamshetty1@tamu.edu',
    'braydenfayomi@tamu.edu',
    'motun21@tamu.edu',
    'rishimanihar@tamu.edu',
    'reveille.bubbletea@gmail.com'
    // Add authorized users here
];

// Configure session
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
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

// Middleware to check if user is authenticated and authorized
function requireAuth(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// Middleware to check if user is authorized
function requireAuthorizedAccess(req, res, next) {
    if (req.isAuthenticated() && AUTHORIZED_USERS.includes(req.user.email)) {
        return next();
    }
    res.status(403).send('Access denied. You are not authorized to access this page.');
}

module.exports = {
    requireAuth,
    requireAuthorizedAccess,
    AUTHORIZED_USERS
};
