import React, { createContext, useContext, useState } from 'react';

const KeyboardContext = createContext();

export const useKeyboard = () => useContext(KeyboardContext);

export function KeyboardProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentValue, setCurrentValue] = useState('');
  const [keyboardType, setKeyboardType] = useState('default');
  const [onSubmitCallback, setOnSubmitCallback] = useState(() => () => {});

  const openKeyboard = (initialValue = '', type = 'default', onSubmit = () => {}) => {
    setCurrentValue(initialValue);
    setKeyboardType(type);
    setOnSubmitCallback(() => onSubmit);
    setIsOpen(true);
  };

  const closeKeyboard = () => {
    setIsOpen(false);
    setCurrentValue('');
    setOnSubmitCallback(() => () => {});
  };

  const updateValue = (val) => setCurrentValue(val);

  return (
    <KeyboardContext.Provider value={{
      isOpen, currentValue, keyboardType, openKeyboard, closeKeyboard,
      updateValue, onSubmitCallback
    }}>
      {children}
    </KeyboardContext.Provider>
  );
}
