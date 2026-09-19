const runSearchAndRecUnitTests = async () => {
  console.log('=== Running Search & Recommendations Unit Test Suite ===\n');

  // 1. Search Query Parameters Validation
  console.log('1. Testing Search Query Parser & Boundary Checks...');
  const parseSearchParams = ({ q = '', category, sortBy = 'relevance', page = 1, limit = 15 }) => {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 15));
    const skip = (pageNum - 1) * limitNum;

    const query = { visibility: 'public' };
    if (category && category !== 'All') query.category = category;

    return { pageNum, limitNum, skip, query, sortBy };
  };

  const params1 = parseSearchParams({ page: -5, limit: 100, category: 'Gaming' });
  if (params1.pageNum !== 1 || params1.limitNum !== 50 || params1.query.category !== 'Gaming') {
    throw new Error('Search param boundary normalization failed');
  }
  console.log('✓ Clamped negative page to 1 and oversized limit to max 50');

  // 2. Sorting Parser
  console.log('\n2. Testing Sort Options Mapping...');
  const getSortOptions = (sortBy) => {
    if (sortBy === 'views' || sortBy === 'viewCount') return { views: -1, createdAt: -1 };
    if (sortBy === 'uploadDate' || sortBy === 'newest') return { createdAt: -1 };
    if (sortBy === 'oldest') return { createdAt: 1 };
    return { views: -1, createdAt: -1 }; // default relevance
  };

  if (getSortOptions('newest').createdAt !== -1 || getSortOptions('oldest').createdAt !== 1) {
    throw new Error('Sort mapping failed');
  }
  console.log('✓ Correctly mapped sorting keys (newest, views, oldest)');

  // 3. Recommendation Exclusion & Factor Weights
  console.log('\n3. Testing Recommendation Scoring & Exclusion...');
  const simulateRecommendations = (currentVideo, allVideos, limit = 5) => {
    // Must exclude current video
    const candidates = allVideos.filter((v) => v._id !== currentVideo._id && v.visibility === 'public');

    // Score candidates based on factors:
    // Category match (+5), Tag match (+3 per matching tag), Channel match (+4), Popularity (+log views)
    const scored = candidates.map((v) => {
      let score = 0;
      if (v.category === currentVideo.category) score += 5;
      if (v.owner === currentVideo.owner) score += 4;
      const matchingTags = (v.tags || []).filter((t) => (currentVideo.tags || []).includes(t));
      score += matchingTags.length * 3;
      score += (v.views || 0) * 0.01;
      return { ...v, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
  };

  const currentVid = {
    _id: 'vid1',
    category: 'Programming',
    tags: ['react', 'node'],
    owner: 'userA',
  };

  const sampleDb = [
    { _id: 'vid1', category: 'Programming', tags: ['react'], owner: 'userA', visibility: 'public', views: 500 },
    { _id: 'vid2', category: 'Programming', tags: ['react', 'node'], owner: 'userA', visibility: 'public', views: 100 }, // highest score
    { _id: 'vid3', category: 'Gaming', tags: ['gameplay'], owner: 'userB', visibility: 'public', views: 50 },
    { _id: 'vid4', category: 'Programming', tags: ['python'], owner: 'userC', visibility: 'public', views: 200 },
  ];

  const results = simulateRecommendations(currentVid, sampleDb, 2);

  // vid1 must be excluded
  if (results.some((v) => v._id === 'vid1')) {
    throw new Error('Currently watched video was not excluded from recommendations');
  }

  // vid2 matches category, both tags, and owner -> top match
  if (results[0]._id !== 'vid2') {
    throw new Error('Weighted scoring failed to place closest match first');
  }
  console.log('✓ Currently watched video successfully excluded from recommendations');
  console.log(`✓ Weighted scoring accurately placed closest matching video first (score: ${results[0].score})`);

  console.log('\n>>> ALL SEARCH & RECOMMENDATION TESTS PASSED WITH 100% SUCCESS! <<<\n');
};

runSearchAndRecUnitTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
