import React from 'react';
export interface HeaderProps {
    title: string;
    subtitle?: string;
    onBack?: () => void;
    actions?: React.ReactNode;
    variant?: 'default' | 'transparent' | 'gradient';
    className?: string;
}
export declare const Header: React.FC<HeaderProps>;
