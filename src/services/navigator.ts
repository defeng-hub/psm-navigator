

export const navigatorService = {
  generateUrl: (template: string, psm: string, variables: Record<string, string> = {}): string => {
    let url = template.replace(/{psm}/g, psm);
    
    // Replace custom variables
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{${key}}`, 'g');
      url = url.replace(regex, value);
    }
    
    return url;
  },

  extractVariables: (template: string): string[] => {
    const matches = template.match(/{([a-zA-Z0-9_]+)}/g) || [];
    return matches
      .map(m => m.slice(1, -1)) // Remove {}
      .filter(v => v !== 'psm'); // Exclude standard psm variable
  },

  openUrl: (url: string) => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url });
    } else {
      window.open(url, '_blank');
    }
  }
};
