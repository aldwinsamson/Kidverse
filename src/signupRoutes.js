const express = require('express');
const bcrypt = require('bcrypt');
const User = require('./config');
const validators = require('./validators');

const router = express.Router();
const SALT_ROUNDS = 10;

router.post('/', async (req, res) => {
    try {
        const { studentName, schoolId, email, password } = req.body;

        if (!studentName || !schoolId || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (!validators.isValidStudentName(studentName)) {
            return res.status(400).json({ error: 'Invalid student name. Please enter the real name.' });
        }

        if (!validators.isValidSchoolId(schoolId)) {
            return res.status(400).json({ error: 'Invalid school ID. Please enter numbers and hyphens only.' });
        }

        if (!validators.isValidEmail(email)) {
            return res.status(400).json({ error: 'Invalid email address' });
        }

        if (!validators.isStrongPassword(password)) {
            return res.status(400).json({ error: validators.PASSWORD_RULE_MESSAGE });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            // same wording as before, it avoids confirming which emails are registered
            return res.status(400).json({ error: 'invalid email address' });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        await User.create({ studentName, schoolId, email, password: hashedPassword });

        res.status(200).json({ message: 'Form submission successful' });
    } catch (error) {
        // the unique index catches two signups racing past the findOne above
        if (error.code === 11000) {
            return res.status(400).json({ error: 'invalid email address' });
        }
        console.error('signup failed:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
