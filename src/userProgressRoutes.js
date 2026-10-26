const express = require('express');
const UserProgress = require('./userProgress');

const router = express.Router();

const QUIZ_IDS = ['quiz1', 'quiz2', 'quiz3'];

// the pages still send a placeholder userId, so identity comes from the
// session instead. a client should never decide whose progress it writes
function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Please log in first' });
    }
    next();
}

router.use(requireLogin);

function isValidScore(score) {
    return Number.isFinite(score) && score >= 0;
}

async function loadScores(userId) {
    const doc = await UserProgress.findOne({ userId }).lean();
    const scores = Object.fromEntries(QUIZ_IDS.map((id) => [id, 0]));
    if (doc) {
        doc.quizzes.forEach(({ quizId, score }) => {
            scores[quizId] = score;
        });
    }
    return scores;
}

async function saveScore(userId, quizId, score) {
    const updated = await UserProgress.updateOne(
        { userId, 'quizzes.quizId': quizId },
        { $set: { 'quizzes.$.score': score } }
    );

    // first attempt at this quiz, add it (creates the document if needed)
    if (updated.matchedCount === 0) {
        await UserProgress.updateOne(
            { userId },
            { $push: { quizzes: { quizId, score } } },
            { upsert: true }
        );
    }
}

// all quiz scores of the logged in student
router.get('/user-progress', async (req, res) => {
    try {
        const progress = await loadScores(req.session.user.id);
        const quizScore = Object.values(progress).reduce((sum, value) => sum + value, 0);
        res.status(200).json({ progress, quizScore });
    } catch (error) {
        console.error('fetching progress failed:', error);
        res.status(500).json({ error: 'An error occurred while fetching user progress' });
    }
});

// same data in the flat shape the easy quiz page reads (quiz1, quiz2...)
router.get('/user-progress/:userId', async (req, res) => {
    try {
        res.status(200).json(await loadScores(req.session.user.id));
    } catch (error) {
        console.error('fetching progress failed:', error);
        res.status(500).json({ error: 'An error occurred while fetching user progress' });
    }
});

// list shape used by the "Score" button
router.get('/all-user-scores', async (req, res) => {
    try {
        const progress = await loadScores(req.session.user.id);
        const scores = Object.entries(progress).map(([quiz, score]) => ({ quiz, score }));
        res.status(200).json({ scores });
    } catch (error) {
        console.error('fetching scores failed:', error);
        res.status(500).json({ error: 'An error occurred while fetching scores' });
    }
});

// save the score of one quiz (easy and medium quiz pages)
router.post('/user-progress/:quizId', async (req, res) => {
    const { quizId } = req.params;
    const score = Number(req.body.score);

    if (!QUIZ_IDS.includes(quizId)) {
        return res.status(400).json({ error: 'Unknown quiz' });
    }
    if (!isValidScore(score)) {
        return res.status(400).json({ error: 'score must be a non-negative number' });
    }

    try {
        await saveScore(req.session.user.id, quizId, score);
        res.status(200).json({ message: 'User progress saved successfully' });
    } catch (error) {
        console.error('saving progress failed:', error);
        res.status(500).json({ error: 'An error occurred while saving user progress' });
    }
});

// the hard quiz page posts a single score here, so it maps to quiz3
router.post('/save-progress', async (req, res) => {
    const score = Number(req.body.progress);

    if (!isValidScore(score)) {
        return res.status(400).json({ error: 'progress must be a non-negative number' });
    }

    try {
        await saveScore(req.session.user.id, 'quiz3', score);
        res.status(200).json({ message: 'User progress saved successfully' });
    } catch (error) {
        console.error('saving progress failed:', error);
        res.status(500).json({ error: 'An error occurred while saving user progress' });
    }
});

module.exports = router;
