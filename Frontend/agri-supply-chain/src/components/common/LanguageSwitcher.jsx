import React from 'react';
import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  ];

  const currentLang = languages.find(l => l.code === i18n.language);

  const toggleLanguage = () => {
    const currentIndex = languages.findIndex(l => l.code === i18n.language);
    const nextIndex = (currentIndex + 1) % languages.length;
    i18n.changeLanguage(languages[nextIndex].code);
    localStorage.setItem('appLanguage', languages[nextIndex].code);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
      title={t('settings.language', 'Language')}
    >
      <Languages className="w-4 h-4" />
      <span className="hidden sm:inline">{currentLang?.nativeName || currentLang?.name}</span>
      <span className="sm:hidden">{i18n.language.toUpperCase()}</span>
    </button>
  );
};

export default LanguageSwitcher;
