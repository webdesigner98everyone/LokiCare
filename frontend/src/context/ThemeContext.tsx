import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

export const colors = {
  light: {
    background: '#f8f9fa',
    card: '#fff',
    text: '#333',
    textSecondary: '#555',
    primary: '#0077b6',
    accent: '#00b4d8',
    border: '#ddd',
    inputBg: '#fafafa',
    tabBar: '#fff',
    tabBarBorder: '#eee',
  },
  dark: {
    background: '#121212',
    card: '#1e1e1e',
    text: '#e0e0e0',
    textSecondary: '#aaa',
    primary: '#4fc3f7',
    accent: '#00b4d8',
    border: '#333',
    inputBg: '#2a2a2a',
    tabBar: '#1e1e1e',
    tabBarBorder: '#333',
  },
};

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  c: typeof colors.light;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  c: colors.light,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>(systemScheme === 'dark' ? 'dark' : 'light');

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, c: colors[theme] }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
