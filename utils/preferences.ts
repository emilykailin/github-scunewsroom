export function validatePreferences(categories: string[], validOptions: string[]) {
    if (!Array.isArray(categories) || categories.length < 3) return false;
  
    // Ensure all selected categories are from valid options
    return categories.every((c) => validOptions.includes(c));
  }
  
  export function normalizePreferences(categories: string[]) {
    // Remove duplicates and trim whitespace
    const set = new Set(categories.map(c => c.trim()).filter(Boolean));
    return Array.from(set);
  }
  