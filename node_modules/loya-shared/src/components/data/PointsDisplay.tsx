import React from 'react';

export interface PointsDisplayProps {
  points: number;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'gradient' | 'card' | 'minimal';
  showIcon?: boolean;
  className?: string;
}

export const PointsDisplay: React.FC<PointsDisplayProps> = ({
  points,
  label = 'Баллы',
  size = 'medium',
  variant = 'default',
  showIcon = true,
  className = ''
}) => {
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

  const formatPoints = (points: number): string => {
    return points.toLocaleString('ru-RU');
  };

  return (
    <div className={classes}>
      {showIcon && (
        <div className="points-icon">
          💎
        </div>
      )}
      <div className="points-content">
        <div className="points-value">
          {formatPoints(points)}
        </div>
        {label && (
          <div className="points-label">
            {label}
          </div>
        )}
      </div>
    </div>
  );
};
