export const getAccountStorageKey = (key, user) => {
  const userKey = user?.id ?? user?.email ?? 'guest';
  return `${key}:${userKey}`;
};

export const readStoredJson = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    if (saved && saved !== 'undefined') {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error(`Error parsing ${key}`, error);
    localStorage.removeItem(key);
  }

  return fallback;
};

export const writeStoredJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};
