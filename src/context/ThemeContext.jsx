import { createContext, useContext, useState, useEffect } from 'react';

// ThemeContext provides `theme` and `toggleTheme` to the whole app.
// Any component can call useTheme() instead of prop-drilling.
const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Initialise from localStorage, or fall back to OS preference
  const getInitial = () => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  };

  const [theme, setTheme] = useState(getInitial);

  // Sync the <html data-theme> attribute whenever theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    // Brief "wipe" animation on body, then swap theme
    document.body.classList.add('theme-transitioning');
    setTimeout(() => {
      setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    }, 30);
    setTimeout(() => document.body.classList.remove('theme-transitioning'), 480);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Convenience hook — import { useTheme } instead of useContext(ThemeContext)
export function useTheme() {
  return useContext(ThemeContext);
}
