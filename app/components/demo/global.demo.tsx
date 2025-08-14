import { useTheme } from 'next-themes';

import { useTranslation } from 'react-i18next';

import { useLanguage } from '@/service/stores/global.store';

export function GlobalDemo() {
    const { t } = useTranslation();
    const { theme, setTheme } = useTheme();
    const { language, setLanguage } = useLanguage();

    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-4">
                <span>{t('theme')}:</span>
                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="px-4 py-2 bg-blue-500 text-t1 rounded hover:bg-blue-600"
                >
                    {theme === 'dark' ? t('light') : t('dark')}
                </button>
            </div>

            <div className="flex items-center space-x-4">
                <span>{t('language')}:</span>
                <button
                    onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
                    className="px-4 py-2 bg-green-500 text-t1 rounded hover:bg-green-600"
                >
                    {language === 'en' ? '中文' : 'English'}
                </button>
            </div>
        </div>
    );
}
