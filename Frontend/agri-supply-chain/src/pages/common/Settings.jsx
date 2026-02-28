import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings as SettingsIcon, Globe, Palette, Save } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { useToast } from '../../context/ToastContext';

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
    const [selectedLang, setSelectedLang] = useState(i18n.language || 'en');

    // Sync local state when i18n language changes (e.g., from outside)
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

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <SettingsIcon className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{t('settings.title', 'Settings')}</h1>
                        <p className="text-gray-600">{t('settings.languageDescription', 'Manage your preferences')}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Language Section */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <Globe className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">{t('settings.language', 'Language')}</h3>
                                <p className="text-sm text-gray-500 mb-4">{t('settings.languageDescription', 'Choose your preferred language for the application')}</p>

                                <div className="max-w-md">
                                    <select
                                        value={selectedLang}
                                        onChange={handleLanguageChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm"
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
        </MainLayout>
    );
};

export default Settings;
