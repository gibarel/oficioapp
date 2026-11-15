import React from 'react';

export default function ApplicationLogo(props) {
    return (
        <img 
            src="/images/oficioapp-logo.svg" 
            alt="OficioApp Logo" 
            {...props} 
            className={`h-9 w-auto ${props.className || ''}`}
        />
    );
}