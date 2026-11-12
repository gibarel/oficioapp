import { usePage } from '@inertiajs/react';
import { translations } from '@/i18n/translations';

export function useTranslation() {
    const { props } = usePage();
    
    // Verificamos el idioma de la prop o usuario, y comprobamos que exista en el diccionario. Si no, forzamos 'es'.
    const rawLocale = props.locale || props.auth?.user?.locale;
    const locale = (rawLocale && translations[rawLocale]) ? rawLocale : 'es';

    const t = (key, replacements = {}) => {
        const keys = key.split('.');
        let value = translations[locale] || translations['es'];

        for (const k of keys) {
            value = value?.[k];
        }

        // Fallback al español si la clave no existe en el idioma actual
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