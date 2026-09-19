const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
  validateRegister,
  validateLogin,
  validateChangePassword,
  validateUpdateProfile,
} = require('./src/validators/authValidators');

const runUnitTests = async () => {
  console.log('=== Running Auth Unit & Security Verification ===\n');

  // 1. Password Hashing & Comparison Test
  console.log('1. Testing Bcrypt Password Hashing & Matching...');
  const rawPassword = 'SecurePassword123!';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(rawPassword, salt);
  const isMatch = await bcrypt.compare(rawPassword, hash);
  const isWrongMatch = await bcrypt.compare('WrongPassword!', hash);

  if (!isMatch || isWrongMatch) {
    throw new Error('Bcrypt password verification failed');
  }
  console.log('✓ Bcrypt hashing and comparison functioning correctly');

  // 2. JWT Generation & Verification Test
  console.log('\n2. Testing JWT Signing, Verification & Expiry...');
  const secret = 'viora_development_super_secret_key_2026_secure';
  const payload = { id: '65f1a2b3c4d5e6f7a8b9c0d1', username: 'testuser', email: 'test@example.com' };
  const token = jwt.sign(payload, secret, { expiresIn: '1h' });
  const decoded = jwt.verify(token, secret);

  if (decoded.username !== payload.username || decoded.email !== payload.email) {
    throw new Error('JWT signing/verification mismatch');
  }
  console.log('✓ JWT signed and verified with correct payload');

  // 3. Validator: Register validation
  console.log('\n3. Testing Request Validators...');
  let errorCaught = false;
  try {
    validateRegister({ body: { username: 'a', email: 'invalid-email', password: '123' } }, {}, () => {});
  } catch (err) {
    errorCaught = true;
    console.log(`✓ validateRegister correctly rejected invalid input: "${err.message}"`);
  }
  if (!errorCaught) throw new Error('validateRegister failed to reject invalid payload');

  // 4. Validator: Password mismatch
  errorCaught = false;
  try {
    validateRegister(
      {
        body: {
          username: 'valid_user',
          email: 'valid@example.com',
          password: 'Password123!',
          confirmPassword: 'MismatchPassword!',
        },
      },
      {},
      () => {}
    );
  } catch (err) {
    errorCaught = true;
    console.log(`✓ validateRegister correctly detected password mismatch: "${err.message}"`);
  }
  if (!errorCaught) throw new Error('Password mismatch validation failed');

  // 5. Validator: Valid registration
  let nextCalled = false;
  validateRegister(
    {
      body: {
        username: 'valid_user',
        email: 'valid@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      },
    },
    {},
    () => { nextCalled = true; }
  );
  if (!nextCalled) throw new Error('Valid payload was not accepted');
  console.log('✓ validateRegister accepted valid payload successfully');

  // 6. Validator: Login validation
  errorCaught = false;
  try {
    validateLogin({ body: { email: 'bad' } }, {}, () => {});
  } catch (err) {
    errorCaught = true;
    console.log(`✓ validateLogin rejected missing password: "${err.message}"`);
  }
  if (!errorCaught) throw new Error('validateLogin failed');

  // 7. Validator: Change password validation
  errorCaught = false;
  try {
    validateChangePassword({ body: { currentPassword: 'old', newPassword: '123' } }, {}, () => {});
  } catch (err) {
    errorCaught = true;
    console.log(`✓ validateChangePassword rejected short new password: "${err.message}"`);
  }
  if (!errorCaught) throw new Error('validateChangePassword failed');

  console.log('\n>>> ALL AUTH UNIT TESTS PASSED WITH 100% SUCCESS! <<<\n');
};

runUnitTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
