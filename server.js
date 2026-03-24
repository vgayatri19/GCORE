const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const path = require('path');

// Load env vars
dotenv.config();

// Connect to database
const connectDB = require('./config/db');
connectDB();

const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

const app = express();

// Set security headers
app.use(helmet({
    contentSecurityPolicy: false, // For development ease with CDNs
}));

// Dev logging middleware
if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 100
});
app.use('/api', limiter);

// Middleware to make req.query and req.params writable for legacy sanitization packages (Express 5 Compatibility)
app.use((req, res, next) => {
    Object.defineProperty(req, 'query', {
        value: { ...req.query },
        writable: true,
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(req, 'params', {
        value: { ...req.params },
        writable: true,
        enumerable: true,
        configurable: true
    });
    next();
});

// Prevent NoSQL injection
app.use(mongoSanitize());

// Prevent HTTP param pollution
app.use(hpp());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to set user in locals
const jwt = require('jsonwebtoken');
app.use(async (req, res, next) => {
    let token;
    if (req.cookies.token) {
        token = req.cookies.token;
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // We could fetch user here, but for speed just passing decoded payload if enough
            // Or better, fetch user to be sure
            const User = require('./models/User');
            res.locals.user = await User.findById(decoded.id);
        } catch (e) {
            res.locals.user = null;
        }
    } else {
        res.locals.user = null;
    }
    next();
});

// Set View Engine
app.set('view engine', 'ejs');

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/admin', require('./routes/admin'));
app.use('/departments', require('./routes/departments'));
app.use('/placements', require('./routes/placements'));
app.use('/events', require('./routes/events'));
app.use('/', require('./routes/core'));

// 404 Handler
app.use((req, res, next) => {
    res.status(404).render('404', { title: '404 - Not Found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        title: '500 - Server Error',
        error: process.env.NODE_ENV === 'production' ? {} : err
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
