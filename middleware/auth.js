const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
    }
    // Set token from cookie
    else if (req.cookies.token) {
        token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) {
        // If it's an API call, return 401
        if (req.originalUrl.startsWith('/api')) {
            return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
        }
        // If it's a page load, redirect to login
        return res.redirect('/login');
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id);

        if (!req.user.isApproved && req.user.role !== 'Admin') {
            return res.status(401).render('login', { error: 'Your account is pending admin approval' });
        }

        next();
    } catch (err) {
        console.error(err);
        if (req.originalUrl.startsWith('/api')) {
            return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
        }
        return res.redirect('/login');
    }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            if (req.originalUrl.startsWith('/api')) {
                return res.status(403).json({
                    success: false,
                    error: `User role ${req.user.role} is not authorized to access this route`
                });
            }
            return res.status(403).send('Not Authorized');
        }
        next();
    };
};
