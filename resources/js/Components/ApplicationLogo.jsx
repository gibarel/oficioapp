import React from 'react';

export default function ApplicationLogo({ className = '', ...props }) {
    return (
        <div className={`inline-flex items-center gap-2.5 select-none ${className}`} {...props}>
            {/* Octágono estilo Perrovaca */}
            <svg
                viewBox="0 0 100 100"
                className="h-9 w-9 shrink-0"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <polygon
                    points="30,6 70,6 94,30 94,70 70,94 30,94 6,70 6,30"
                    stroke="#1e3a3a"
                    strokeWidth="8"
                    strokeLinejoin="round"
                />
                {/* Prompt de consola >_ adentro del octágono */}
                <path
                    d="M32 38 L48 50 L32 62"
                    stroke="#1e3a3a"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <line
                    x1="54"
                    y1="62"
                    x2="70"
                    y2="62"
                    stroke="#52757d"
                    strokeWidth="7"
                    strokeLinecap="round"
                />
            </svg>

            {/* Texto en tipografía monoespaciada */}
            <span className="font-mono font-bold text-lg tracking-tight text-[#1e3a3a]">
                Oficio<span className="text-[#52757d]">App</span>
            </span>
        </div>
    );
}