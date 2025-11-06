import React from 'react';
export const PointsDisplay = ({ points, label = 'Баллы', size = 'medium', variant = 'default', showIcon = true, className = '' }) => {
    const sizeClasses = {
        small: 'points-display-sm',
        medium: 'points-display-md',
        large: 'points-display-lg'
    };
    const variantClasses = {
        default: 'points-display-default',
        gradient: 'points-display-gradient',
        card: 'points-display-card',
        minimal: 'points-display-minimal'
    };
    const classes = [
        'points-display',
        sizeClasses[size],
        variantClasses[variant],
        className
    ].filter(Boolean).join(' ');
    const formatPoints = (points) => {
        return points.toLocaleString('ru-RU');
    };
    return (React.createElement("div", { className: classes },
        showIcon && (React.createElement("div", { className: "points-icon" }, "\uD83D\uDC8E")),
        React.createElement("div", { className: "points-content" },
            React.createElement("div", { className: "points-value" }, formatPoints(points)),
            label && (React.createElement("div", { className: "points-label" }, label)))));
};
