import React from 'react';
export interface InputProps {
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    onBlur?: () => void;
    onFocus?: () => void;
    disabled?: boolean;
    required?: boolean;
    error?: string;
    label?: string;
    helperText?: string;
    size?: 'small' | 'medium' | 'large';
    fullWidth?: boolean;
    className?: string;
}
export declare const Input: React.FC<InputProps>;
