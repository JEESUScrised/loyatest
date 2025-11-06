import React from 'react';
export const Button = ({ children, onClick, type = 'button', variant = 'primary', size = 'medium', disabled = false, loading = false, fullWidth = false, className = '' }) => {
    const baseClasses = 'btn';
    const variantClasses = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        success: 'btn-success',
        danger: 'btn-danger',
        warning: 'btn-warning',
        info: 'btn-info'
    };
    const sizeClasses = {
        small: 'btn-sm',
        medium: 'btn-md',
        large: 'btn-lg'
    };
    const classes = [
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'btn-full-width' : '',
        disabled || loading ? 'btn-disabled' : '',
        className
    ].filter(Boolean).join(' ');
    return (React.createElement("button", { type: type, onClick: onClick, disabled: disabled || loading, className: classes }, loading ? (React.createElement("span", { className: "btn-loading" },
        React.createElement("span", { className: "btn-spinner" }),
        "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430...")) : (children)));
};
