import React from 'react';
export interface CodeInputProps {
    length?: number;
    value?: string;
    onChange?: (value: string) => void;
    onComplete?: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    className?: string;
}
export declare const CodeInput: React.FC<CodeInputProps>;
