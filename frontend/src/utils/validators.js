import { validateEmail, validatePhone, validatePassword, validateName } from './constants/validationRules';

export const validateLoginForm = (values) => {
  const errors = {};
  if (!values.email) errors.email = 'Email is required';
  else if (!validateEmail(values.email)) errors.email = 'Invalid email format';
  if (!values.password) errors.password = 'Password is required';
  return errors;
};

export const validateRegisterForm = (values) => {
  const errors = {};
  if (!values.name) errors.name = 'Name is required';
  else if (!validateName(values.name)) errors.name = 'Name must be at least 2 characters';
  if (!values.email) errors.email = 'Email is required';
  else if (!validateEmail(values.email)) errors.email = 'Invalid email format';
  if (!values.password) errors.password = 'Password is required';
  else if (!validatePassword(values.password)) errors.password = 'Password must be at least 6 characters';
  if (values.password !== values.confirmPassword) errors.confirmPassword = 'Passwords do not match';
  if (!values.role) errors.role = 'Role is required';
  return errors;
};

export const validateCourseForm = (values) => {
  const errors = {};
  if (!values.title) errors.title = 'Title is required';
  if (!values.courseCode) errors.courseCode = 'Course code is required';
  if (!values.department) errors.department = 'Department is required';
  if (!values.credits) errors.credits = 'Credits is required';
  if (!values.description) errors.description = 'Description is required';
  return errors;
};

export const validateAssignmentForm = (values) => {
  const errors = {};
  if (!values.title) errors.title = 'Title is required';
  if (!values.course) errors.course = 'Course is required';
  if (!values.dueDate) errors.dueDate = 'Due date is required';
  if (!values.totalMarks) errors.totalMarks = 'Total marks is required';
  if (!values.description) errors.description = 'Description is required';
  return errors;
};

export const validateProfileForm = (values) => {
  const errors = {};
  if (!values.name) errors.name = 'Name is required';
  if (!values.email) errors.email = 'Email is required';
  else if (!validateEmail(values.email)) errors.email = 'Invalid email format';
  if (values.phone && !validatePhone(values.phone)) errors.phone = 'Invalid phone number';
  return errors;
};
