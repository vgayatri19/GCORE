const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc    Register user
// @route   POST /auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role, department, clubRole, managedClub } = req.body;

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role,
            department,
            clubRole,
            managedClub
        });

        // Send response with message about pending approval
        res.status(200).render('login', { info: 'Registration successful! Your account is pending admin approval.' });
    } catch (err) {
        console.error(err);
        res.status(400).render('register', { error: err.message });
    }
};

// @desc    Login user
// @route   POST /auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).render('login', { error: 'Please provide an email and password' });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).render('login', { error: 'Invalid credentials' });
        }

        // Check if password matches (trimming handles trailing spaces from email copy-paste)
        const isMatch = await user.matchPassword(password.trim());

        if (!isMatch) {
            return res.status(401).render('login', { error: 'Invalid credentials' });
        }

        // Check if user is approved
        if (!user.isApproved && user.role !== 'Admin') {
            return res.status(401).render('login', { error: 'Your account is pending admin approval' });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        console.error(err);
        res.status(400).render('login', { error: err.message });
    }
};

// @desc    Log user out / clear cookie
// @route   GET /auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.redirect('/auth/login');
};

// @desc    Get current logged in user
// @route   GET /auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Forgot password
// @route   GET /auth/forgot-password
// @access  Public
exports.forgotPasswordForm = (req, res) => {
    res.render('forgot-password', { title: 'Forgot Password' });
};

const crypto = require('crypto');
const nodemailer = require('nodemailer');

// @desc    Handle forgot password request
// @route   POST /auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.render('forgot-password', { error: 'No user with that email' });
        }

        // Generate strong temporary password that passes strict User validation
        // (Must contain upper, lower, number, and special character. Min 8 chars)
        const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lower = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const specials = '@$!%*?&';
        
        let tp = '';
        tp += upper[Math.floor(Math.random() * upper.length)];
        tp += lower[Math.floor(Math.random() * lower.length)];
        tp += numbers[Math.floor(Math.random() * numbers.length)];
        tp += specials[Math.floor(Math.random() * specials.length)];
        tp += crypto.randomBytes(2).toString('hex'); // 4 more random hex chars
        
        // Shuffle to avoid predictable pattern
        const tempPassword = tp.split('').sort(() => 0.5 - Math.random()).join('');
        
        // Save new password (pre-save hook in User model will hash it automatically)
        user.password = tempPassword;
        await user.save();

        // Configure Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'dummy@gmail.com',
                pass: process.env.EMAIL_PASS || 'dummy'
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER || 'no-reply@gcore.com',
            to: user.email,
            subject: 'GCORE Password Reset',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #021849;">Password Reset</h2>
                    <p>Hello <strong>${user.name}</strong>,</p>
                    <p>Your password has been successfully reset. Please log in using the following temporary password:</p>
                    <div style="background: #f1f5f9; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                        <h3 style="margin: 0; color: #dc3545; letter-spacing: 2px;">${tempPassword}</h3>
                    </div>
                    <p>For security reasons, we strongly recommend changing this password from your profile settings immediately after logging in.</p>
                    <p style="margin-top: 30px; font-size: 0.9em; color: #6c757d;">Regards,<br>GCORE Institutional System</p>
                </div>
            `
        };

        // Attempt to send email
        try {
            await transporter.sendMail(mailOptions);
            res.render('verify-reset-code', { email: user.email });
        } catch (mailErr) {
            console.error('Email Dispatch Error:', mailErr);
            
            // If email fails because of missing .env credentials, fallback to DEV MODE feedback
            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                 console.log(`[DEV MODE] Temporary Password for ${user.email} is: ${tempPassword}`);
                 res.render('verify-reset-code', { email: user.email, error: `[DEV MODE] Email credentials missing. Temporary Password generated is: ${tempPassword}` });
            } else {
                 res.render('forgot-password', { error: 'Failed to send recovery email. Please contact the administrator.' });
            }
        }

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Verify temporary reset code
// @route   POST /auth/verify-reset-code
// @access  Public
exports.verifyResetCode = async (req, res) => {
    try {
        const { email, tempPassword } = req.body;
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) return res.render('verify-reset-code', { email, error: 'User not found' });
        
        const isMatch = await user.matchPassword(tempPassword.trim());
        if (!isMatch) {
            return res.render('verify-reset-code', { email, error: 'Invalid 8-character verification code.' });
        }
        
        // Code is valid, render actual reset password UI
        res.render('reset-password', { email, tempPassword: tempPassword.trim(), title: 'Set New Password' });
    } catch (err) {
        console.error(err);
        res.render('verify-reset-code', { email: req.body.email, error: 'Server Error' });
    }
};

// @desc    Reset password (Finalizes 3-Step Wizard)
// @route   POST /auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        const { email, tempPassword, password } = req.body;
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Validate the temp password again to prove authorization bounds
        const isMatch = await user.matchPassword(tempPassword);
        if (!isMatch) {
             return res.status(401).send('<div style="text-align:center; margin-top: 50px; font-family:sans-serif;"><h3>Security Error: Invalid Verification Token.</h3><a href="/auth/forgot-password" style="padding: 10px 20px; background: #021849; color: white; text-decoration: none; border-radius: 5px;">Restart Process</a></div>');
        }

        // Update password (will be hashed by pre-save hook)
        user.password = password;
        await user.save();

        // Dynamically log them in without sendTokenResponse redirect so we can fire the alert
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.cookie('token', token, { expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), httpOnly: true });

        res.send(`
            <script>
                alert("PASSWORD CHANGED");
                window.location.href = "/departments";
            </script>
        `);
    } catch (err) {
        console.error(err);
        res.render('reset-password', { email: req.body.email, tempPassword: req.body.tempPassword, error: err.message, title: 'Reset Password' });
    }
};

// @desc    Change logged-in user password
// @route   POST /auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('+password');
        if (!user) {
            return res.status(404).send('<div style="text-align:center; margin-top: 50px; font-family:sans-serif;"><h3>User not found.</h3><a href="/" style="padding: 10px 20px; background: #021849; color: white; text-decoration: none; border-radius: 5px;">Go Back</a></div>');
        }

        const { currentPassword, newPassword, confirmPassword } = req.body;

        const isMatch = await user.matchPassword(currentPassword.trim());
        if (!isMatch) {
            return res.status(401).send('<div style="text-align:center; margin-top: 50px; font-family:sans-serif;"><h3>Current Password is incorrect.</h3><a href="javascript:history.back()" style="padding: 10px 20px; background: #021849; color: white; text-decoration: none; border-radius: 5px;">Go Back and Try Again</a></div>');
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).send('<div style="text-align:center; margin-top: 50px; font-family:sans-serif;"><h3>New Passwords do not match.</h3><a href="javascript:history.back()" style="padding: 10px 20px; background: #021849; color: white; text-decoration: none; border-radius: 5px;">Go Back and Try Again</a></div>');
        }

        user.password = newPassword;
        await user.save();

        // Refresh session
        sendTokenResponse(user, 200, res);

    } catch (err) {
        console.error(err);
        if (err.name === 'ValidationError') {
             return res.status(400).send('<div style="text-align:center; margin-top: 50px; font-family:sans-serif; color: #dc3545"><h3>Invalid Password Format</h3><p>Password must be 8+ characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character.</p><a href="javascript:history.back()" style="padding: 10px 20px; background: #021849; color: white; text-decoration: none; border-radius: 5px;">Go Back</a></div>');
        }
        res.status(500).send('Server Error');
    }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });

    const options = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res
        .status(statusCode)
        .cookie('token', token, options)
        .redirect('/departments'); // Redirect to departments or dashboard
};
