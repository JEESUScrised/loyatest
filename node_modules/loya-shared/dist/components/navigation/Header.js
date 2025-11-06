import React from 'react';
export const Header = ({ title, subtitle, onBack, actions, variant = 'default', className = '' }) => {
    const variantClasses = {
        default: 'header-default',
        transparent: 'header-transparent',
        gradient: 'header-gradient'
    };
    const classes = [
        'header',
        variantClasses[variant],
        className
    ].filter(Boolean).join(' ');
    return (React.createElement("header", { className: classes },
        React.createElement("div", { className: "header-content" },
            onBack && (React.createElement("button", { className: "back-button", onClick: onBack, "aria-label": "\u041D\u0430\u0437\u0430\u0434" }, "\u2190")),
            React.createElement("div", { className: "header-text" },
                React.createElement("h1", { className: "header-title" }, title),
                subtitle && (React.createElement("p", { className: "header-subtitle" }, subtitle))),
            actions && (React.createElement("div", { className: "header-actions" }, actions)))));
};
