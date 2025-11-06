import React, { useState, useRef, useEffect } from 'react';

export interface CodeInputProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export const CodeInput: React.FC<CodeInputProps> = ({
  length = 6,
  value = '',
  onChange,
  onComplete,
  placeholder = 'Введите код',
  disabled = false,
  error,
  className = ''
}) => {
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    if (newValue.length <= length) {
      setInputValue(newValue);
      onChange?.(newValue);
      
      if (newValue.length === length) {
        onComplete?.(newValue);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && inputValue.length === 0) {
      // Можно добавить логику для перехода к предыдущему полю
    }
  };

  const classes = [
    'code-input',
    error ? 'code-input-error' : '',
    disabled ? 'code-input-disabled' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="code-input-container">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={length}
        className={classes}
        autoComplete="off"
        spellCheck={false}
      />
      {error && (
        <div className="code-input-error-message">
          {error}
        </div>
      )}
      <div className="code-input-hint">
        Введите {length}-значный код
      </div>
    </div>
  );
};
