import React from 'react';
export const Card = ({ children, title, subtitle, header, footer, variant = 'default', size = 'medium', className = '', onClick }) => {
    const baseClasses = 'card';
    const variantClasses = {
        default: 'card-default',
        elevated: 'card-elevated',
        outlined: 'card-outlined',
        filled: 'card-filled'
    };
    const sizeClasses = {
        small: 'card-sm',
        medium: 'card-md',
        large: 'card-lg'
    };
    const classes = [
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        onClick ? 'card-clickable' : '',
        className
    ].filter(Boolean).join(' ');
    return (React.createElement("div", { className: classes, onClick: onClick },
        (title || subtitle || header) && (React.createElement("div", { className: "card-header" }, header || (React.createElement(React.Fragment, null,
            title && React.createElement("h3", { className: "card-title" }, title),
            subtitle && React.createElement("p", { className: "card-subtitle" }, subtitle))))),
        React.createElement("div", { className: "card-content" }, children),
        footer && (React.createElement("div", { className: "card-footer" }, footer))));
};
