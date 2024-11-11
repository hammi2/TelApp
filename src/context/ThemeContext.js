import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

const lightColors = {
    background: '#FFFFFF',
    text: '#333333',
    primary: '#4A90E2',
    secondary: '#6E7F8D',
    accent: '#FF6B6B',
    border: '#E5E5EA',
    icon: '#4A90E2',
  };
  
const darkColors = {
  background: '#1C1C1E',
  text: '#FFFFFF',
  primary: '#8A2BE2',
  secondary: '#808080',
  accent: '#FF375F',
  border: '#38383A',
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const theme = {
    isDarkMode,
    colors: isDarkMode ? darkColors : lightColors,
    toggleTheme: () => {
      setIsDarkMode(prevMode => !prevMode);
      AsyncStorage.setItem('isDarkMode', JSON.stringify(!isDarkMode));
    },
  };

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('isDarkMode');
      if (savedTheme !== null) {
        setIsDarkMode(JSON.parse(savedTheme));
      }
    } catch (error) {
      console.error('خطأ في تحميل الثيم:', error);
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);