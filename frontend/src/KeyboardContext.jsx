import React, { createContext, useContext, useState } from 'react';

const KeyboardContext = createContext();

export const useKeyboard = () => useContext(KeyboardContext);

export function KeyboardProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentValue, setCurrentValue] = useState('');
  const [onSubmitCallback, setOnSubmitCallback] = useState(() => () => {});

  const openKeyboard = (initialValue, onSubmit) => {
    setCurrentValue(initialValue);
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
      isOpen, currentValue, openKeyboard, closeKeyboard,
      updateValue, onSubmitCallback
    }}>
      {children}
    </KeyboardContext.Provider>
  );
}
