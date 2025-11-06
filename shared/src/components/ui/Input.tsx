import React from 'react';

export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  required = false,
  error,
  label,
  helperText,
  size = 'medium',
  fullWidth = true,
  className = ''
}) => {
  const baseClasses = 'input';
  const sizeClasses = {
    small: 'input-sm',
    medium: 'input-md',
    large: 'input-lg'
  };

  const inputClasses = [
    baseClasses,
    sizeClasses[size],
    fullWidth ? 'input-full-width' : '',
    error ? 'input-error' : '',
    disabled ? 'input-disabled' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="input-container">
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={onBlur}
        onFocus={onFocus}
        disabled={disabled}
        required={required}
        className={inputClasses}
      />
      {error && (
        <div className="input-error-message">
          {error}
        </div>
      )}
      {helperText && !error && (
        <div className="input-helper-text">
          {helperText}
        </div>
      )}
    </div>
  );
};
