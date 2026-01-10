import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook that synchronizes the HTML document's lang attribute with the current i18n language.
 * This is important for SEO and accessibility.
 */
export function useDocumentLanguage(): void {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Update the document's lang attribute with base language code (e.g., 'en' from 'en-US')
    document.documentElement.lang = i18n.language?.substring(0, 2) || 'en';

    // Also update the dir attribute for RTL languages (if needed in the future)
    // const rtlLanguages = ['ar', 'he', 'fa'];
    // document.documentElement.dir = rtlLanguages.includes(lang) ? 'rtl' : 'ltr';
  }, [i18n.language]);
}

export default useDocumentLanguage;
