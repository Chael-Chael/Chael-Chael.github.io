export const messages = {
  common: { all: 'All', copyToClipboard: 'Copy to clipboard' },
  navigation: { openMainMenu: 'Open main menu' },
  theme: { system: 'System', light: 'Light', dark: 'Dark', currentTheme: 'Current theme', cycleTheme: 'Click to cycle theme' },
  profile: { email: 'Email', location: 'Location', workAddress: 'Work Address', click: 'Click', googleMap: 'Google Map', send: 'Send', sendEmail: 'Send Email', researchInterests: 'Research Interests', like: 'Like', liked: 'Liked', thanks: 'Thanks!' },
  home: { about: 'About', news: 'News', selectedPublications: 'Selected Publications', viewAll: 'View All' },
  publications: { searchPlaceholder: 'Search publications...', filters: 'Filters', year: 'Year', type: 'Type', noResults: 'No publications found matching your criteria.', abstract: 'Abstract', bibtex: 'BibTeX', code: 'Code' },
  blog: { title: 'Research Blog', description: 'Explorations in LLMs, Diffusion Models, and Multimodal Learning.', readMore: 'Read More', backToBlog: 'Back to Blog', noPosts: 'Stay tuned! More stories coming soon.', writtenBy: 'Written by' },
  footer: { lastUpdated: 'Last updated', builtWithPrism: 'Built with PRISM' },
};

export function useMessages() {
  return messages;
}
