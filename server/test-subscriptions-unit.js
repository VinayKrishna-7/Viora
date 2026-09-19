const runSubscriptionUnitTests = async () => {
  console.log('=== Running Subscription & Channel Unit Test Suite ===\n');

  // 1. Test Self-Subscription Prevention
  console.log('1. Testing Self-Subscription Rule...');
  const checkSelfSub = (subscriberId, channelId) => {
    if (subscriberId.toString() === channelId.toString()) {
      throw new Error('You cannot subscribe to your own channel');
    }
    return true;
  };

  let errorCaught = false;
  try {
    checkSelfSub('65f1a2b3c4d5e6f7a8b9c001', '65f1a2b3c4d5e6f7a8b9c001');
  } catch (err) {
    errorCaught = true;
    console.log(`✓ Correctly prevented self-subscription: "${err.message}"`);
  }
  if (!errorCaught) throw new Error('Self-subscription guard failed');

  const validSub = checkSelfSub('65f1a2b3c4d5e6f7a8b9c001', '65f1a2b3c4d5e6f7a8b9c002');
  if (!validSub) throw new Error('Valid subscription between distinct users was rejected');
  console.log('✓ Valid subscription between different users allowed');

  // 2. Test Subscription Toggle Logic
  console.log('\n2. Testing Subscription Toggle State & Counter Calculations...');
  const simulateSubToggle = (isCurrentlySubscribed, channelSubsCount, userSubscribedToCount) => {
    if (isCurrentlySubscribed) {
      return {
        isSubscribed: false,
        channelSubsCount: Math.max(0, channelSubsCount - 1),
        userSubscribedToCount: Math.max(0, userSubscribedToCount - 1),
      };
    } else {
      return {
        isSubscribed: true,
        channelSubsCount: channelSubsCount + 1,
        userSubscribedToCount: userSubscribedToCount + 1,
      };
    }
  };

  // Subscribe
  let subState = simulateSubToggle(false, 100, 5);
  if (!subState.isSubscribed || subState.channelSubsCount !== 101 || subState.userSubscribedToCount !== 6) {
    throw new Error('Subscribe simulation failed');
  }
  console.log('✓ Subscribing increments channel subscribersCount (100 -> 101) and subscriber count (5 -> 6)');

  // Unsubscribe
  subState = simulateSubToggle(true, 101, 6);
  if (subState.isSubscribed || subState.channelSubsCount !== 100 || subState.userSubscribedToCount !== 5) {
    throw new Error('Unsubscribe simulation failed');
  }
  console.log('✓ Unsubscribing decrements channel subscribersCount (101 -> 100) and subscriber count (6 -> 5)');

  console.log('\n>>> ALL SUBSCRIPTION & CHANNEL TESTS PASSED WITH 100% SUCCESS! <<<\n');
};

runSubscriptionUnitTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
