export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;

export const validateName = (name) => {
  if (!name || typeof name !== 'string') return 'Name is required.';
  const len = name.trim().length;
  if (len < 20 || len > 60) {
    return 'Name must be between 20 and 60 characters.';
  }
  return null;
};

export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return 'Email is required.';
  if (!EMAIL_REGEX.test(email.trim())) {
    return 'Please provide a valid email address.';
  }
  return null;
};

export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return 'Password is required.';
  if (!PASSWORD_REGEX.test(password)) {
    return 'Password must be 8–16 chars with at least 1 uppercase and 1 special char.';
  }
  return null;
};

export const validateAddress = (address) => {
  if (!address || typeof address !== 'string' || address.trim().length === 0) {
    return 'Address is required.';
  }
  if (address.trim().length > 400) {
    return 'Address cannot exceed 400 characters.';
  }
  return null;
};

export const validateStoreName = (name) => {
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return 'Store name is required.';
  }
  if (name.trim().length < 3 || name.trim().length > 100) {
    return 'Store name must be between 3 and 100 characters.';
  }
  return null;
};

export const validateRating = (rating) => {
  const num = Number(rating);
  if (!Number.isInteger(num) || num < 1 || num > 5) {
    return 'Rating must be an integer between 1 and 5.';
  }
  return null;
};
