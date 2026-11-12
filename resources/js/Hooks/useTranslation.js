import { usePage } from '@inertiajs/react';
import { translations } from '@/i18n/translations';

export function useTranslation() {
    // Toma el idioma compartido desde Laravel (por defecto 'es')
    const { props } = usePage();
    const locale = props.locale || props.auth?.user?.locale || 'es';

    const t = (key, replacements = {}) => {
        const keys = key.split('.');
        let value = translations[locale] || translations['es'];

        for (const k of keys) {
            value = value?.[k];
        }

        // Fallback al español si no existe la traducción
        if (!value) {
            let fallback = translations['es'];
            for (const k of keys) {
                fallback = fallback?.[k];
            }
            value = fallback || key;
        }

        // Reemplazo de variables dinámicas (ej: {number})
        if (typeof value === 'string') {
            Object.keys(replacements).forEach((placeholder) => {
                value = value.replace(`{${placeholder}}`, replacements[placeholder]);
            });
        }

        return value;
    };

    return { t, locale };
}