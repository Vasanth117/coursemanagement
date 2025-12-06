export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },

  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch {
      return false;
    }
  }
};

export const TOKEN_KEY = 'token';
export const USER_KEY = 'user';
export const THEME_KEY = 'theme';

export const getToken = () => storage.get(TOKEN_KEY);
export const setToken = (token) => storage.set(TOKEN_KEY, token);
export const removeToken = () => storage.remove(TOKEN_KEY);

export const getUser = () => storage.get(USER_KEY);
export const setUser = (user) => storage.set(USER_KEY, user);
export const removeUser = () => storage.remove(USER_KEY);

export const getTheme = () => storage.get(THEME_KEY) || 'light';
export const setTheme = (theme) => storage.set(THEME_KEY, theme);
