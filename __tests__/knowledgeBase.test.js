const { getRagContext } = require('../services/knowledgeBase');

test('getRagContext returns empty string', () => {
  expect(getRagContext()).toBe('');
});
