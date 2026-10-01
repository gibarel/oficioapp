import React from 'react';

const variants = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    primary: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
};

export default function Badge({ children, variant = 'default', className = '' }) {
    const style = variants[variant] || variants.default;

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style} ${className}`}
        >
            {children}
        </span>
    );
}