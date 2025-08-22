import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);

  // Check user preference on first load
  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    setDarkMode(isDarkMode || (!localStorage.getItem('darkMode') && prefersDark));
  }, []);

  // Apply theme changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  function toggleDarkMode() {
    setDarkMode(prevMode => !prevMode);
  }

  const value = {
    darkMode,
    toggleDarkMode
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeContext;
