// Placeholder AI service module
// Implement calls to your chosen AI provider (OpenAI, local models, etc.)

module.exports = {
  analyzeRequest: async function({ text, images, videos }) {
    // return { category, title, description, missingQuestions }
    return {
      category: 'uncategorized',
      title: 'Suggested title (placeholder)',
      description: 'Suggested description (placeholder)',
      missingQuestions: []
    };
  }
};
