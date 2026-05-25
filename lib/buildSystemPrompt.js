const LANGUAGE_NAMES = { ru: 'Russian', en: 'English', uz: 'Uzbek' };

function buildSystemPrompt({ language, pageContent, url, ragContext }) {
  const langName = LANGUAGE_NAMES[language] ?? language;

  const lines = [
    'You are a helpful assistant for foreigners living in Korea.',
    'The user needs help understanding Korean government websites and procedures.',
    '',
    'Your job:',
    '- Explain what the content means in simple terms',
    '- Answer questions about what to do next',
    '- Translate and explain Korean bureaucratic terms',
    '- Give step-by-step guidance when asked',
    '',
    `User's language: ${langName}`,
  ];

  if (url) lines.push(`Page URL: ${url}`);
  if (pageContent) {
    lines.push('Page content:');
    lines.push(pageContent);
  }

  lines.push('');
  lines.push('Rules:');
  lines.push(`- Always respond in ${langName}`);
  lines.push('- Be concise — the user is likely on a phone');
  lines.push('- If you see visa expiry dates, highlight them clearly');
  lines.push('- Format dates and deadlines prominently');
  lines.push('- If no page content is given, answer from general knowledge about Korea');

  if (ragContext) {
    lines.push('');
    lines.push('Visa knowledge context:');
    lines.push(ragContext);
  }

  return lines.join('\n');
}

module.exports = { buildSystemPrompt };
