const express = require('express');

const router = express.Router();

// this used to call app.post, but app doesn't exist in this file,
// which crashed the server on startup. the router is the right target
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Failed to logout');
        }
        res.clearCookie('connect.sid');
        res.status(200).send('Logout successful');
    });
});

module.exports = router;
