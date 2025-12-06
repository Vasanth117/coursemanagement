export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[0-9]{10}$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  COURSE_CODE: /^[A-Z]{2,4}[0-9]{3}$/,
  ROLL_NUMBER: /^[0-9]{2}[A-Z]{3}[0-9]{4}$/
};

export const validateEmail = (email) => VALIDATION_RULES.EMAIL.test(email);
export const validatePhone = (phone) => VALIDATION_RULES.PHONE.test(phone);
export const validatePassword = (password) => password.length >= VALIDATION_RULES.PASSWORD_MIN_LENGTH;
export const validateName = (name) => name.length >= VALIDATION_RULES.NAME_MIN_LENGTH;
export const validateCourseCode = (code) => VALIDATION_RULES.COURSE_CODE.test(code);
export const validateRollNumber = (roll) => VALIDATION_RULES.ROLL_NUMBER.test(roll);
