import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const LanguageSwitcher = () => {
  const { currentLanguage, toggleLanguage, languages, t } = useLanguage();

  const currentLang = languages.find(l => l.code === currentLanguage);

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
      title={t('language.switch')}
    >
      <Languages className="w-4 h-4" />
      <span className="hidden sm:inline">{currentLang?.nativeName || currentLang?.name}</span>
      <span className="sm:hidden">{currentLanguage === 'en' ? 'EN' : 'HI'}</span>
    </button>
  );
};

export default LanguageSwitcher;
