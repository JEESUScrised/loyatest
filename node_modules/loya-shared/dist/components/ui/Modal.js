import React, { useEffect } from 'react';
export const Modal = ({ isOpen, onClose, title, children, footer, size = 'medium', closeOnOverlayClick = true, closeOnEscape = true, className = '' }) => {
    useEffect(() => {
        if (!isOpen)
            return;
        const handleEscape = (e) => {
            if (e.key === 'Escape' && closeOnEscape) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, closeOnEscape, onClose]);
    if (!isOpen)
        return null;
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget && closeOnOverlayClick) {
            onClose();
        }
    };
    const sizeClasses = {
        small: 'modal-sm',
        medium: 'modal-md',
        large: 'modal-lg',
        fullscreen: 'modal-fullscreen'
    };
    const modalClasses = [
        'modal',
        sizeClasses[size],
        className
    ].filter(Boolean).join(' ');
    return (React.createElement("div", { className: "modal-overlay", onClick: handleOverlayClick },
        React.createElement("div", { className: modalClasses },
            React.createElement("div", { className: "modal-header" },
                title && React.createElement("h2", { className: "modal-title" }, title),
                React.createElement("button", { className: "modal-close", onClick: onClose, "aria-label": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C" }, "\u00D7")),
            React.createElement("div", { className: "modal-content" }, children),
            footer && (React.createElement("div", { className: "modal-footer" }, footer)))));
};
