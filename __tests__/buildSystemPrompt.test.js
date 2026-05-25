const { buildSystemPrompt } = require('../lib/buildSystemPrompt');

test('includes language in prompt', () => {
  const prompt = buildSystemPrompt({ language: 'ru', pageContent: '', url: '', ragContext: '' });
  expect(prompt).toContain('ru');
});

test('includes url when provided', () => {
  const prompt = buildSystemPrompt({
    language: 'en',
    pageContent: '',
    url: 'https://www.hikorea.go.kr',
    ragContext: '',
  });
  expect(prompt).toContain('https://www.hikorea.go.kr');
});

test('includes pageContent when provided', () => {
  const prompt = buildSystemPrompt({
    language: 'en',
    pageContent: 'visa expires 2025-01-01',
    url: '',
    ragContext: '',
  });
  expect(prompt).toContain('visa expires 2025-01-01');
});

test('omits page content section when pageContent is empty', () => {
  const prompt = buildSystemPrompt({ language: 'en', pageContent: '', url: '', ragContext: '' });
  expect(prompt).not.toContain('Page content:');
});

test('includes ragContext when provided', () => {
  const prompt = buildSystemPrompt({
    language: 'en',
    pageContent: '',
    url: '',
    ragContext: 'E-7 visa requires employer sponsorship',
  });
  expect(prompt).toContain('E-7 visa requires employer sponsorship');
});
