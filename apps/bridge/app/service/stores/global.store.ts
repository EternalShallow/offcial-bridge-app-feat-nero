import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// Language storage
export const languageAtom = atomWithStorage<'en' | 'zh'>('language', 'en');

// Language Hook
export const useLanguage = () => {
    const [language, setLanguage] = useAtom(languageAtom);
    return { language, setLanguage };
};
