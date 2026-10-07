// Validation Middleware enforcing Challenge Rules

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;

const validateUserFields = (req, res, next) => {
  const { name, email, password, address, role } = req.body;
  const errors = [];

  // Validate Name (20 to 60 characters)
  if (!name || typeof name !== 'string' || name.trim().length < 20 || name.trim().length > 60) {
    errors.push('Name must be between 20 and 60 characters.');
  }

  // Validate Email
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    errors.push('Please provide a valid email address.');
  }

  // Validate Password (if provided in registration or creation)
  if (password !== undefined) {
    if (!password || typeof password !== 'string' || !passwordRegex.test(password)) {
      errors.push('Password must be 8–16 chars with at least 1 uppercase and 1 special char.');
    }
  }

  // Validate Address (Max 400 characters, not empty)
  if (!address || typeof address !== 'string' || address.trim().length === 0 || address.trim().length > 400) {
    errors.push('Address is required and cannot exceed 400 characters.');
  }

  // Validate Role if provided
  if (role && !['ADMIN', 'NORMAL_USER', 'STORE_OWNER'].includes(role)) {
    errors.push('Invalid role specified.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors, message: errors[0] });
  }

  next();
};

const validatePasswordUpdate = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const errors = [];

  if (!currentPassword) {
    errors.push('Current password is required.');
  }

  if (!newPassword || typeof newPassword !== 'string' || !passwordRegex.test(newPassword)) {
    errors.push('Password must be 8–16 chars with at least 1 uppercase and 1 special char.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors, message: errors[0] });
  }

  next();
};

const validateStoreFields = (req, res, next) => {
  const { name, email, address } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 3 || name.trim().length > 100) {
    errors.push('Store name must be between 3 and 100 characters.');
  }

  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    errors.push('Please provide a valid email address for the store.');
  }

  if (!address || typeof address !== 'string' || address.trim().length === 0 || address.trim().length > 400) {
    errors.push('Store address is required and cannot exceed 400 characters.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors, message: errors[0] });
  }

  next();
};

const validateRatingField = (req, res, next) => {
  const { rating } = req.body;
  const numRating = Number(rating);

  if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
    return res.status(400).json({
      success: false,
      message: 'Rating must be an integer between 1 and 5.'
    });
  }

  req.body.rating = numRating;
  next();
};

module.exports = {
  validateUserFields,
  validatePasswordUpdate,
  validateStoreFields,
  validateRatingField
};
