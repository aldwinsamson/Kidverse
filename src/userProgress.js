const mongoose = require('mongoose');

const { Schema } = mongoose;

const quizSchema = new Schema({
    quizId: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        default: 0
    }
}, { _id: false });

// one document per student, holding the latest score of each quiz
const userProgressSchema = new Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    quizzes: [quizSchema]
}, { timestamps: true });

module.exports = mongoose.model('UserProgress', userProgressSchema);
