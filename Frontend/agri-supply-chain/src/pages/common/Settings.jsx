import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings as SettingsIcon, Globe, Sun, Moon, Save } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { useToast } from '../../context/ToastContext';
import { useDarkMode } from '../../hooks/useDarkMode';

const languages = [
    { code: 'en', name: 'English', script: 'English' },
    { code: 'hi', name: 'Hindi', script: 'हिन्दी' },
    { code: 'mr', name: 'Marathi', script: 'मराठी' },
    { code: 'gu', name: 'Gujarati', script: 'ગુજરાતી' },
    { code: 'pa', name: 'Punjabi', script: 'ਪੰਜਾਬੀ' },
    { code: 'ta', name: 'Tamil', script: 'தமிழ்' }
];

const Settings = () => {
    const { t, i18n } = useTranslation();
    const toast = useToast();
    const [isDark, setIsDark] = useDarkMode();
    const [selectedLang, setSelectedLang] = useState(i18n.language || 'en');

    // Sync local state when i18n language changes
    useEffect(() => {
        setSelectedLang(i18n.language);
    }, [i18n.language]);

    const handleLanguageChange = (e) => {
        const lang = e.target.value;
        setSelectedLang(lang);
        i18n.changeLanguage(lang);
        localStorage.setItem('appLanguage', lang);
        toast.success(t('toast.successSave', 'Settings saved successfully'));
    };

    const handleDarkModeToggle = () => {
        setIsDark(!isDark);
        toast.success(t('toast.successSave', 'Settings saved successfully'));
    };

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto space-y-6 text-gray-900 dark:text-gray-100">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center">
                        <SettingsIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">{t('settings.title', 'Settings')}</h1>
                        <p className="text-gray-600 dark:text-gray-400">{t('settings.description', 'Manage your preferences')}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Dark Mode Section */}
                    <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-emerald-100 dark:border-emerald-900 overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex-shrink-0">
                                    {isDark ? (
                                        <Moon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                    ) : (
                                        <Sun className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                    )}
                                </div>
                                <div className="flex-1 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold">{t('settings.appearance', 'Appearance')}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.appearanceDescription', 'Switch between light and dark mode')}</p>
                                    </div>
                                    
                                    {/* Dark Mode Toggle Switch */}
                                    <button
                                        role="switch"
                                        aria-checked={isDark}
                                        onClick={handleDarkModeToggle}
                                        className={`relative inline-flex items-center h-8 w-16 rounded-full transition-colors flex-shrink-0 ${
                                            isDark ? 'bg-emerald-600' : 'bg-gray-200'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                                                isDark ? 'translate-x-9' : 'translate-x-1'
                                            }`}
                                        />
                                        <span className={`absolute inset-0 flex items-center justify-center text-xs font-semibold ${
                                            isDark ? 'left-1 text-emerald-600' : 'right-1 text-gray-600'
                                        }`}>
                                            {isDark ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Language Section */}
                    <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-emerald-100 dark:border-emerald-900 overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex-shrink-0">
                                    <Globe className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold">{t('settings.language', 'Language')}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('settings.languageDescription', 'Choose your preferred language for the application')}</p>

                                    <div className="max-w-md">
                                        <select
                                            value={selectedLang}
                                            onChange={handleLanguageChange}
                                            className="w-full px-4 py-3 border border-emerald-200 dark:border-emerald-800 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-surface-dark text-gray-900 dark:text-gray-100 shadow-sm transition-colors"
                                        >
                                            {languages.map((lang) => (
                                                <option key={lang.code} value={lang.code}>
                                                    {lang.script} ({lang.name})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Settings;
