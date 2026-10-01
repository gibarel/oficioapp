import React, { useEffect } from 'react';

export default function Modal({
    children,
    show = false,
    maxWidth = '2xl',
    closeable = true,
    onClose = () => {},
}) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && show && closeable) {
                onClose();
            }
        };

        if (show) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [show, closeable, onClose]);

    if (!show) return null;

    const maxWidthClass = {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-md',
        lg: 'sm:max-w-lg',
        xl: 'sm:max-w-xl',
        '2xl': 'sm:max-w-2xl',
    }[maxWidth];

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto px-4 py-6 sm:px-0 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 transform transition-all"
                onClick={() => closeable && onClose()}
            >
                <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" />
            </div>

            {/* Modal Container */}
            <div
                className={`mb-6 bg-white rounded-xl overflow-hidden shadow-xl transform transition-all sm:w-full ${maxWidthClass} z-10`}
            >
                {children}
            </div>
        </div>
    );
}