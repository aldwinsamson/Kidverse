// one place for the input rules so signup and password reset can't drift apart
// (the reset page has the same password regex on the client side)
const studentNameRegex = /^[A-Za-z.\s]+$/;
const schoolIdRegex = /^[0-9-]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#_])[A-Za-z\d@$!%*?&#_]{8,}$/;

const PASSWORD_RULE_MESSAGE =
    'Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters';

module.exports = {
    isValidStudentName: (value) => studentNameRegex.test(value),
    isValidSchoolId: (value) => schoolIdRegex.test(value),
    isValidEmail: (value) => emailRegex.test(value),
    isStrongPassword: (value) => strongPasswordRegex.test(value),
    PASSWORD_RULE_MESSAGE
};
