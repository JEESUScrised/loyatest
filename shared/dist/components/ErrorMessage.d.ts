import React from 'react';
interface ErrorMessageProps {
    error: string | Error | null;
    onRetry?: () => void;
    className?: string;
}
export declare const ErrorMessage: React.FC<ErrorMessageProps>;
export {};
