export function validatePreferences(categories: string[]) {
    return Array.isArray(categories) && categories.length >= 3;
  }
  