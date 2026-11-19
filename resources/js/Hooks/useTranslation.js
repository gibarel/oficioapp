import { usePage } from '@inertiajs/react';
import { translations } from '@/i18n/translations';

export function useTranslation() {
    const { props } = usePage();
    
    // Forzamos 'es' directamente para descartar problemas con las props de Inertia por ahora
    const locale = 'es'; 

    const t = (key, replacements = {}) => {
        const keys = key.split('.');
        
        // Buscamos primero en español, si no en el locale actual
        let value = translations['es'];
        for (const k of keys) {
            value = value?.[k];
        }

        // Si aún así no se encuentra, devolvemos la llave para identificarla
        if (!value) {
            return key;
        }

        if (typeof value === 'string') {
            Object.keys(replacements).forEach((placeholder) => {
                value = value.replace(`{${placeholder}}`, replacements[placeholder]);
            });
        }

        return value;
    };

    return { t, locale };
}