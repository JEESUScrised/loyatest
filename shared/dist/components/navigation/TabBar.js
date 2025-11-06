import React from 'react';
export const TabBar = ({ tabs, activeTab, onTabChange, variant = 'default', size = 'medium', className = '' }) => {
    const variantClasses = {
        default: 'tab-bar-default',
        pills: 'tab-bar-pills',
        underline: 'tab-bar-underline'
    };
    const sizeClasses = {
        small: 'tab-bar-sm',
        medium: 'tab-bar-md',
        large: 'tab-bar-lg'
    };
    const classes = [
        'tab-bar',
        variantClasses[variant],
        sizeClasses[size],
        className
    ].filter(Boolean).join(' ');
    return (React.createElement("div", { className: classes }, tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const tabClasses = [
            'tab',
            isActive ? 'tab-active' : '',
            tab.disabled ? 'tab-disabled' : ''
        ].filter(Boolean).join(' ');
        return (React.createElement("button", { key: tab.id, className: tabClasses, onClick: () => !tab.disabled && onTabChange(tab.id), disabled: tab.disabled },
            tab.icon && (React.createElement("span", { className: "tab-icon" }, tab.icon)),
            React.createElement("span", { className: "tab-label" }, tab.label),
            tab.badge && tab.badge > 0 && (React.createElement("span", { className: "tab-badge" }, tab.badge > 99 ? '99+' : tab.badge))));
    })));
};
