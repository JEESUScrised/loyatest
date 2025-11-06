import React from 'react';
export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'small' | 'medium' | 'large' | 'fullscreen';
    closeOnOverlayClick?: boolean;
    closeOnEscape?: boolean;
    className?: string;
}
export declare const Modal: React.FC<ModalProps>;
