const express = require('express');
const bcrypt = require('bcrypt');
const User = require('./config');

const router = express.Router();

router.post('/login', async (req, res) => {
    // the form field is named "username" but it holds the email
    const { username, password } = req.body;

    if (typeof username !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ status: 'error', message: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({ email: username });
        const isMatch = user ? await bcrypt.compare(password, user.password) : false;

        // one message and one status for both cases, so the response
        // doesn't reveal whether the email exists
        if (!isMatch) {
            return res.status(401).json({ status: 'error', message: 'User not found' });
        }

        // keep only what pages need, never the password hash
        req.session.user = {
            id: user._id.toString(),
            email: user.email,
            studentName: user.studentName
        };
        res.status(200).json({ status: 'success', message: 'Login successful' });
    } catch (error) {
        console.error('login failed:', error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});

module.exports = router;
