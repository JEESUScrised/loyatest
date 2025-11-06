import React, { useState, useRef, useEffect } from 'react';
export const CodeInput = ({ length = 6, value = '', onChange, onComplete, placeholder = 'Введите код', disabled = false, error, className = '' }) => {
    const [inputValue, setInputValue] = useState(value);
    const inputRef = useRef(null);
    useEffect(() => {
        setInputValue(value);
    }, [value]);
    const handleChange = (e) => {
        const newValue = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (newValue.length <= length) {
            setInputValue(newValue);
            onChange === null || onChange === void 0 ? void 0 : onChange(newValue);
            if (newValue.length === length) {
                onComplete === null || onComplete === void 0 ? void 0 : onComplete(newValue);
            }
        }
    };
    const handleKeyDown = (e) => {
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
    return (React.createElement("div", { className: "code-input-container" },
        React.createElement("input", { ref: inputRef, type: "text", value: inputValue, onChange: handleChange, onKeyDown: handleKeyDown, placeholder: placeholder, disabled: disabled, maxLength: length, className: classes, autoComplete: "off", spellCheck: false }),
        error && (React.createElement("div", { className: "code-input-error-message" }, error)),
        React.createElement("div", { className: "code-input-hint" },
            "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 ",
            length,
            "-\u0437\u043D\u0430\u0447\u043D\u044B\u0439 \u043A\u043E\u0434")));
};
