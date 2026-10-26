const mongoose = require('mongoose');

const OTP_LIFETIME_SECONDS = 10 * 60;

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    otp: {
        type: String,
        required: true
    },
    // mongo deletes the document on its own once this ttl passes,
    // so old codes can never be reused
    createdAt: {
        type: Date,
        default: Date.now,
        expires: OTP_LIFETIME_SECONDS
    }
});

module.exports = mongoose.model('otp', otpSchema);
