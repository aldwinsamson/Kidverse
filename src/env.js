// loads .env once and fails fast, so a missing secret is caught at boot
// instead of showing up later as a confusing runtime error
require('dotenv').config();

const dns = require('dns');

// some networks drop the txt/srv dns lookups that atlas (mongodb+srv) needs,
// so this lets .env point node at a dns server that answers them
if (process.env.DNS_SERVERS) {
    dns.setServers(process.env.DNS_SERVERS.split(',').map((server) => server.trim()));
}

const required = ['MONGO_URL', 'SESSION_SECRET', 'EMAIL_USER', 'EMAIL_PASS'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
    console.error(`missing environment variables: ${missing.join(', ')}`);
    console.error('copy .env.example to .env and fill in the values');
    process.exit(1);
}

module.exports = {
    port: process.env.PORT || 5000,
    isProduction: process.env.NODE_ENV === 'production',
    mongoUrl: process.env.MONGO_URL,
    sessionSecret: process.env.SESSION_SECRET,
    email: {
        service: process.env.EMAIL_SERVICE || 'outlook',
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
};