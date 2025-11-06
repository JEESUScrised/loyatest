import React from 'react';
export const Input = ({ type = 'text', placeholder, value, onChange, onBlur, onFocus, disabled = false, required = false, error, label, helperText, size = 'medium', fullWidth = true, className = '' }) => {
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
    return (React.createElement("div", { className: "input-container" },
        label && (React.createElement("label", { className: "input-label" },
            label,
            required && React.createElement("span", { className: "input-required" }, "*"))),
        React.createElement("input", { type: type, placeholder: placeholder, value: value, onChange: (e) => onChange === null || onChange === void 0 ? void 0 : onChange(e.target.value), onBlur: onBlur, onFocus: onFocus, disabled: disabled, required: required, className: inputClasses }),
        error && (React.createElement("div", { className: "input-error-message" }, error)),
        helperText && !error && (React.createElement("div", { className: "input-helper-text" }, helperText))));
};
