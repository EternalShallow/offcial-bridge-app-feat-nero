import { useEffect } from 'react';

import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import { useLanguage } from '@/service/stores/global.store';

import en from '../../public/locales/en/translation.json';
import zh from '../../public/locales/zh/translation.json';

// Initialize i18n
const initI18n = async () => {
    if (i18n.isInitialized) {
        return i18n;
    }

    return (
        i18n
            // https://github.com/i18next/i18next-browser-languageDetector
            .use(LanguageDetector)
            .use(initReactI18next)
            // https://www.i18next.com/overview/configuration-options
            .init({
                resources: {
                    en: { translation: en },
                    zh: { translation: zh },
                },
                lng: 'en',
                fallbackLng: 'en',
                interpolation: {
                    escapeValue: false,
                },
                react: {
                    useSuspense: false, // Disable Suspense to avoid SSR issues
                },
            })
    );
};

// Initialize i18n immediately
initI18n().catch(console.error);

const useI18n = () => {
    const { language } = useLanguage();

    useEffect(() => {
        if (i18n.isInitialized) {
            i18n.changeLanguage(language);
        }
    }, [language]);
};

export default useI18n;
