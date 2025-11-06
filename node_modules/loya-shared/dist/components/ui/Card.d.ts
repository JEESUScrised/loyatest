import React from 'react';
export interface CardProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    variant?: 'default' | 'elevated' | 'outlined' | 'filled';
    size?: 'small' | 'medium' | 'large';
    className?: string;
    onClick?: () => void;
}
export declare const Card: React.FC<CardProps>;
