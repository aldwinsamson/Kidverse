const crypto = require('crypto');
const express = require('express');
const bcrypt = require('bcrypt');
const Otp = require('./otp');
const User = require('./config');
const { sendVerificationCode } = require('./mailer');
const validators = require('./validators');

const router = express.Router();
const SALT_ROUNDS = 10;

// step 1: email a 6 digit code
router.post('/send-email-otp', async (req, res) => {
    const { email } = req.body;

    if (typeof email !== 'string' || !validators.isValidEmail(email)) {
        return res.status(400).send({ Status: 'Invalid email address' });
    }

    try {
        // remember who is resetting, and make sure an old verification can't carry over
        req.session.email = email;
        req.session.otpVerified = false;

        const user = await User.findOne({ email });

        // always answer the same way. otherwise this endpoint would tell
        // anyone which emails have an account, and we'd mail strangers for free
        if (user) {
            // randomInt is cryptographically secure, Math.random is not
            const otpCode = crypto.randomInt(100000, 1000000).toString();

            await Otp.findOneAndUpdate(
                { email },
                { otp: otpCode, createdAt: new Date() },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            await sendVerificationCode(email, otpCode);
        }

        res.status(200).send({ Status: 'Authentication code sent successfully!' });
    } catch (error) {
        console.error('send otp failed:', error);
        res.status(500).send({ Status: 'Failed to send email' });
    }
});

// step 2: check the code against the email from this session
router.post('/verify-code', async (req, res) => {
    const { code } = req.body;
    const email = req.session.email;

    if (!email) {
        return res.status(400).send({ Status: 'Session expired. Please request a new code.' });
    }

    try {
        // matching on the email too. before, any user's valid code worked for anyone
        const otpEntry = await Otp.findOne({ email, otp: String(code) });
        if (!otpEntry) {
            return res.status(404).send({ Status: 'Invalid verification code' });
        }

        await Otp.deleteOne({ _id: otpEntry._id });
        req.session.otpVerified = true;

        res.status(200).send({ Status: 'Verification successful!' });
    } catch (error) {
        console.error('verify code failed:', error);
        res.status(500).send({ Status: 'Internal Server Error' });
    }
});

// step 3: set the new password, only after the code was verified
router.post('/change-password', async (req, res) => {
    const { newPassword } = req.body;
    const email = req.session.email;

    // without this flag anyone could skip steps 1 and 2 and reset any account
    if (!email || !req.session.otpVerified) {
        return res.status(400).send({ Status: 'Session expired or not authenticated' });
    }

    if (typeof newPassword !== 'string' || !validators.isStrongPassword(newPassword)) {
        return res.status(400).send({ Status: validators.PASSWORD_RULE_MESSAGE });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send({ Status: 'User not found' });
        }

        user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await user.save();

        delete req.session.email;
        delete req.session.otpVerified;

        res.status(200).send({ Status: 'Password changed successfully!' });
    } catch (error) {
        console.error('change password failed:', error);
        res.status(500).send({ Status: 'Internal Server Error' });
    }
});

module.exports = router;
