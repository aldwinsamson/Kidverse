const mongoose = require('mongoose');

// student account. file keeps its original name because other modules import it
const loginSchema = new mongoose.Schema({
    studentName: {
        type: String,
        required: true,
        trim: true
    },
    schoolId: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('User', loginSchema);
