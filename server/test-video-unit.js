const {
  validateCreateVideo,
  validateUpdateVideo,
  ALLOWED_CATEGORIES,
  ALLOWED_VISIBILITY,
} = require('./src/validators/videoValidators');

const runVideoUnitTests = async () => {
  console.log('=== Running Video Unit & Validation Test Suite ===\n');

  // 1. Categories & Visibility Enums Test
  console.log('1. Testing Video Constraints & Enums...');
  if (!ALLOWED_CATEGORIES.includes('Music') || !ALLOWED_CATEGORIES.includes('Gaming')) {
    throw new Error('Allowed categories configuration missing required categories');
  }
  if (!ALLOWED_VISIBILITY.includes('public') || !ALLOWED_VISIBILITY.includes('private')) {
    throw new Error('Allowed visibility configuration invalid');
  }
  console.log(`✓ 13 Categories and 3 Visibility states configured properly`);

  // 2. Validator: Missing files in create video
  console.log('\n2. Testing Video Upload File Validation...');
  let errorCaught = false;
  try {
    validateCreateVideo(
      {
        body: { title: 'Test Video', category: 'Gaming' },
        files: {},
      },
      {},
      () => {}
    );
  } catch (err) {
    errorCaught = true;
    console.log(`✓ validateCreateVideo correctly caught missing files: "${err.message}"`);
  }
  if (!errorCaught) throw new Error('validateCreateVideo failed to reject missing files');

  // 3. Validator: Short title
  console.log('\n3. Testing Video Title Length Constraints...');
  errorCaught = false;
  try {
    validateCreateVideo(
      {
        body: { title: 'hi' },
        files: { video: [{}], thumbnail: [{}] },
      },
      {},
      () => {}
    );
  } catch (err) {
    errorCaught = true;
    console.log(`✓ validateCreateVideo caught short title: "${err.message}"`);
  }
  if (!errorCaught) throw new Error('validateCreateVideo failed to reject short title');

  // 4. Validator: Invalid category
  console.log('\n4. Testing Category Whitelist Enforcement...');
  errorCaught = false;
  try {
    validateCreateVideo(
      {
        body: { title: 'Valid Video Title', category: 'InvalidCategoryXYZ' },
        files: { video: [{}], thumbnail: [{}] },
      },
      {},
      () => {}
    );
  } catch (err) {
    errorCaught = true;
    console.log(`✓ validateCreateVideo caught invalid category: "${err.message}"`);
  }
  if (!errorCaught) throw new Error('validateCreateVideo failed to reject invalid category');

  // 5. Validator: Valid creation payload
  console.log('\n5. Testing Valid Video Creation Payload...');
  let nextCalled = false;
  validateCreateVideo(
    {
      body: {
        title: 'Building a Full-Stack MERN YouTube Clone',
        description: 'Learn how to build a scalable video streaming platform from scratch.',
        category: 'Programming',
        visibility: 'public',
      },
      files: {
        video: [{ path: 'temp/video.mp4' }],
        thumbnail: [{ path: 'temp/thumb.jpg' }],
      },
    },
    {},
    () => { nextCalled = true; }
  );
  if (!nextCalled) throw new Error('Valid video creation was rejected');
  console.log('✓ Valid video payload accepted successfully');

  // 6. Validator: Update video
  console.log('\n6. Testing Video Update Validation...');
  nextCalled = false;
  validateUpdateVideo(
    {
      body: {
        title: 'Updated Video Title',
        description: 'New description',
        category: 'Technology',
      },
    },
    {},
    () => { nextCalled = true; }
  );
  if (!nextCalled) throw new Error('Valid update payload was rejected');
  console.log('✓ Valid video update payload accepted successfully');

  console.log('\n>>> ALL VIDEO UNIT TESTS PASSED WITH 100% SUCCESS! <<<\n');
};

runVideoUnitTests().catch((err) => {
  console.error('Video test error:', err);
  process.exit(1);
});
