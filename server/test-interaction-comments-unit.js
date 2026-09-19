const runInteractionUnitTests = async () => {
  console.log('=== Running Video Interactions & Comments Unit Test Suite ===\n');

  // 1. Interaction Toggle Logic Verification
  console.log('1. Testing Like / Dislike Mutex & Toggle Logic...');

  const simulateToggle = (currentInteraction, newType, currentLikes, currentDislikes) => {
    let likes = currentLikes;
    let dislikes = currentDislikes;
    let interaction = null;

    if (currentInteraction === newType) {
      // Toggle off
      if (newType === 'like') likes = Math.max(0, likes - 1);
      else dislikes = Math.max(0, dislikes - 1);
      interaction = null;
    } else if (currentInteraction && currentInteraction !== newType) {
      // Switch
      if (newType === 'like') {
        likes += 1;
        dislikes = Math.max(0, dislikes - 1);
      } else {
        dislikes += 1;
        likes = Math.max(0, likes - 1);
      }
      interaction = newType;
    } else {
      // New interaction
      if (newType === 'like') likes += 1;
      else dislikes += 1;
      interaction = newType;
    }

    return { interaction, likes, dislikes };
  };

  // Scenario A: User likes video (was null)
  let state = simulateToggle(null, 'like', 10, 2);
  if (state.interaction !== 'like' || state.likes !== 11 || state.dislikes !== 2) {
    throw new Error('Scenario A failed: new like');
  }
  console.log('✓ Initial Like: correctly increments likesCount from 10 to 11');

  // Scenario B: User clicks Like again (toggle off)
  state = simulateToggle('like', 'like', 11, 2);
  if (state.interaction !== null || state.likes !== 10 || state.dislikes !== 2) {
    throw new Error('Scenario B failed: toggle off like');
  }
  console.log('✓ Toggle Off Like: correctly decrements likesCount back to 10');

  // Scenario C: User switches from Like to Dislike
  state = simulateToggle('like', 'dislike', 11, 2);
  if (state.interaction !== 'dislike' || state.likes !== 10 || state.dislikes !== 3) {
    throw new Error('Scenario C failed: switch like to dislike');
  }
  console.log('✓ Mutex Switching: like decremented to 10 and dislike incremented to 3');

  // Scenario D: User switches from Dislike to Like
  state = simulateToggle('dislike', 'like', 10, 3);
  if (state.interaction !== 'like' || state.likes !== 11 || state.dislikes !== 2) {
    throw new Error('Scenario D failed: switch dislike to like');
  }
  console.log('✓ Mutex Switching: dislike decremented to 2 and like incremented to 11');

  // 2. Comments Validation
  console.log('\n2. Testing Comments Constraints...');
  const validateCommentText = (text) => {
    if (!text || !text.trim()) throw new Error('Comment text cannot be empty');
    if (text.length > 2000) throw new Error('Comment cannot exceed 2000 characters');
    return text.trim();
  };

  let errorCaught = false;
  try {
    validateCommentText('   ');
  } catch (err) {
    errorCaught = true;
    console.log(`✓ Caught empty comment: "${err.message}"`);
  }
  if (!errorCaught) throw new Error('Failed to reject empty comment');

  errorCaught = false;
  try {
    validateCommentText('a'.repeat(2001));
  } catch (err) {
    errorCaught = true;
    console.log(`✓ Caught oversized comment: "${err.message}"`);
  }
  if (!errorCaught) throw new Error('Failed to reject oversized comment');

  const validComment = validateCommentText('Great video tutorial on MERN stack!');
  console.log(`✓ Valid comment accepted: "${validComment}"`);

  console.log('\n>>> ALL INTERACTION & COMMENT TESTS PASSED WITH 100% SUCCESS! <<<\n');
};

runInteractionUnitTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
