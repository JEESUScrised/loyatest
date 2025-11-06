import React from 'react';
export interface Tab {
    id: string;
    label: string;
    icon?: React.ReactNode;
    badge?: number;
    disabled?: boolean;
}
export interface TabBarProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    variant?: 'default' | 'pills' | 'underline';
    size?: 'small' | 'medium' | 'large';
    className?: string;
}
export declare const TabBar: React.FC<TabBarProps>;
