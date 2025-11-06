import React from 'react';
export interface PointsDisplayProps {
    points: number;
    label?: string;
    size?: 'small' | 'medium' | 'large';
    variant?: 'default' | 'gradient' | 'card' | 'minimal';
    showIcon?: boolean;
    className?: string;
}
export declare const PointsDisplay: React.FC<PointsDisplayProps>;
