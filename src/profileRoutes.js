// note: not mounted in index.js yet, the profile page currently renders without it.
// kept here so it can be wired up later
const express = require('express');
const Profile = require('./profile');

const router = express.Router();

// profile of the logged in student
router.get('/view', async (req, res) => {
    try {
        const profile = await Profile.findOne({ email: req.session.user.email });
        if (!profile) {
            return res.status(404).send('Profile not found');
        }
        res.render('profile', { user: profile });
    } catch (err) {
        console.error('loading profile failed:', err);
        res.status(500).send('Server error');
    }
});

// create or update the profile of the logged in student
router.post('/', async (req, res) => {
    try {
        const { name, age, studentNumber } = req.body;
        // email comes from the session so nobody can edit another student's profile
        const { email } = req.session.user;

        const profile = await Profile.findOneAndUpdate(
            { email },
            { name, age, studentNumber, email },
            { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
        );
        res.json(profile);
    } catch (err) {
        console.error('saving profile failed:', err);
        res.status(500).json({ error: 'Failed to save profile' });
    }
});

module.exports = router;
