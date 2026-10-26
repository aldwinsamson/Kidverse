const path = require('path');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');

// must load first, it reads .env and validates it
const settings = require('./env');

const signupRoutes = require('./signupRoutes');
const loginRoutes = require('./loginRoutes');
const logoutRoutes = require('./logoutRoutes');
const passwordRoutes = require('./passwordRoutes');
const userProgressRoutes = require('./userProgressRoutes');

const app = express();

// paths are built from this file's location, so the app works
// no matter which folder it is started from
const projectRoot = path.join(__dirname, '..');

app.disable('x-powered-by');
app.set('view engine', 'ejs');
app.set('views', path.join(projectRoot, 'views'));

// needed so secure cookies work behind a proxy or load balancer
if (settings.isProduction) {
    app.set('trust proxy', 1);
}

app.use(session({
    secret: settings.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: settings.mongoUrl }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        sameSite: 'lax',
        secure: settings.isProduction
    }
}));

// small limit, these forms only send a few short fields
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/');
}

app.use('/signup', signupRoutes);
app.use('/', loginRoutes);
app.use('/', logoutRoutes);
app.use('/', passwordRoutes);
app.use('/api', userProgressRoutes);

// asset folders are served from the site root, so the folder names must stay
// as they are. (background, video, clip, image, icon, lesson-materials and games
// live next to this project and are not part of this repo)
['style', 'background', 'video', 'clip', 'image', 'icon', 'lesson-materials', 'games']
    .forEach((folder) => app.use(express.static(path.join(projectRoot, folder))));

// pages anyone can open
const publicPages = {
    '/': 'login',
    '/signup': 'signup',
    '/signup-category': 'signup-category',
    '/forgot-password': 'forgot-password',
    '/enter-code': 'enter-code',
    '/reset-password': 'reset-password'
};

Object.entries(publicPages).forEach(([route, view]) => {
    app.get(route, (req, res) => res.render(view));
});

// pages that need a login. the url is the same as the view name
const protectedPages = [
    'home',
    'homepage',
    'games',
    'enroll',
    'profile',
    'about-us',
    'privacy-policy',
    'terms-of-use',
    'subject-for-1-3-years-old',
    'sd-for-1-3-years-old',
    'sed-for-1-3-years-old',
    'sed-easy-quiz1',
    'sed-medium-quiz2',
    'sed-hard-quiz3',
    'subject-for-kindergarten',
    'math-for-kindergarten',
    'science-for-kindergarten',
    'ap-for-kindergarten',
    'values-for-kindergarten',
    'subject-for-grade-1-2',
    'math-for-grade-1-2',
    'science-for-grade-1-2',
    'ap-for-grade-1-2',
    'values-for-grade-1-2'
];

protectedPages.forEach((view) => {
    app.get(`/${view}`, isAuthenticated, (req, res) => res.render(view));
});

app.use((req, res) => {
    res.status(404).send('Page not found');
});

// last resort so an unexpected error never leaks a stack trace to the browser
app.use((err, req, res, next) => {
    console.error('unhandled error:', err);
    if (res.headersSent) {
        return next(err);
    }
    res.status(500).send('Internal Server Error');
});

async function start() {
    try {
        await mongoose.connect(settings.mongoUrl);
        console.log('Database connected successfully');
    } catch (err) {
        // without a database nothing works (login, sessions), so stop here
        console.error('Database cannot be connected', err);
        process.exit(1);
    }

    app.listen(settings.port, () => {
        console.log(`Server is running on port ${settings.port}`);
    });
}

start();
