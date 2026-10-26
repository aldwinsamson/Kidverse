# Kidverse

Kidverse is an interactive learning website for young students. Students sign up with their school ID, then access lessons, quizzes and games grouped by age level (1-3 years old, kindergarten, grade 1-2).

Built with Node.js, Express, EJS templates and MongoDB (Mongoose).

## Features

- Student sign-up and login (passwords hashed with bcrypt)
- Password reset with a 6-digit code sent by email (valid for 10 minutes)
- Session-based access: learning pages require a login
- Lessons, quizzes and games per age level
- Quiz scores saved per student

## Project structure

```
kidverse/
  src/            server code (routes, models, helpers)
  views/          EJS pages
  style/          CSS files
  background/ video/ clip/ image/ icon/ lesson-materials/ games/
                  static assets served from the site root
                  (not included in this repository, keep the folder names as they are)
```

Server files in `src/`:

| File | Purpose |
| --- | --- |
| `index.js` | app setup, sessions, page routes, startup |
| `env.js` | loads and validates environment variables |
| `config.js` | `User` model (student account) |
| `signupRoutes.js` | `POST /signup` |
| `loginRoutes.js` | `POST /login` |
| `logoutRoutes.js` | `POST /logout` |
| `passwordRoutes.js` | password reset: `/send-email-otp`, `/verify-code`, `/change-password` |
| `otp.js` | verification code model (expires automatically) |
| `mailer.js` | sends the verification email |
| `validators.js` | shared input rules |
| `userProgress.js`, `userProgressRoutes.js` | quiz scores, under `/api` |
| `profile.js`, `profileRoutes.js` | profile model and routes (not mounted yet) |

## Getting started

Requirements: Node.js 18 or newer and a MongoDB database (for example a free MongoDB Atlas cluster).

1. Install dependencies

   ```
   npm install
   ```

2. Create your environment file

   ```
   cp .env.example .env
   ```

   Then fill in `MONGO_URL`, `SESSION_SECRET`, `EMAIL_USER` and `EMAIL_PASS`. The server will not start if one of them is missing.

3. Run the app

   ```
   npm start        # production
   npm run dev      # auto-restarts on changes (nodemon)
   ```

   Open http://localhost:5000

## API overview

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/signup` | no | create a student account |
| POST | `/login` | no | log in with email and password |
| POST | `/logout` | session | end the session |
| POST | `/send-email-otp` | no | email a reset code |
| POST | `/verify-code` | session | check the reset code |
| POST | `/change-password` | session (verified) | set a new password |
| GET | `/api/user-progress` | session | all quiz scores of the logged-in student |
| GET | `/api/all-user-scores` | session | scores as a list |
| POST | `/api/user-progress/:quizId` | session | save a score (`quiz1`, `quiz2`, `quiz3`) |
| POST | `/api/save-progress` | session | save the hard quiz score (`quiz3`) |

## Security notes

- Secrets live in `.env`, which is git-ignored. Never commit it.
- The password reset needs a verified code before the password can change.
- Quiz progress is tied to the logged-in session, not to a user id sent by the browser.
- If an older version of this project was ever shared or pushed to a public place, rotate the database password and the mailbox password.

## Author

Aldwin Samson
