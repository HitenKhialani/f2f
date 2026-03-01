import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, User, ChevronDown, LogOut, Settings, Globe, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useDarkMode } from '../../hooks/useDarkMode';

const TopNav = () => {
  const { user, role, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useDarkMode();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const userDropdownRef = useRef(null);
  const languageDropdownRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'mr', name: 'मराठी' },
    { code: 'gu', name: 'ગુજરાતી' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ' },
    { code: 'ta', name: 'தமிழ்' },
  ];

  const getRoleBadgeColor = () => {
    const colors = {
      ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
      FARMER: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
      DISTRIBUTOR: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
      TRANSPORTER: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
      RETAILER: 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300',
      CONSUMER: 'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300',
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  const getRoleLabel = () => {
    const labels = {
      ADMIN: t('roles.admin', 'Admin'),
      FARMER: t('roles.farmer', 'Farmer'),
      DISTRIBUTOR: t('roles.distributor', 'Distributor'),
      TRANSPORTER: t('roles.transporter', 'Transporter'),
      RETAILER: t('roles.retailer', 'Retailer'),
      CONSUMER: t('roles.consumer', 'Consumer'),
    };
    return labels[role] || role;
  };

  const handleLogout = async () => {
    setShowUserDropdown(false);
    await logout();
    navigate('/login');
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('appLanguage', lang);
    setShowLanguageDropdown(false);
  };

  const handleDarkModeToggle = () => {
    setIsDark(!isDark);
  };

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)) {
        setShowLanguageDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-emerald-50 dark:bg-cosmos-800 border-b border-emerald-200 dark:border-cosmos-700 sticky top-0 z-40">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left - Role Badge */}
          <div className={`px-4 py-1.5 rounded-full text-sm font-medium ${getRoleBadgeColor()}`}>
            {getRoleLabel()}
          </div>

          {/* Center - Empty for breadcrumb expansion */}
          <div className="flex items-center gap-4">
            {/* Placeholder for breadcrumb/title */}
          </div>

          {/* Right - User Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Language Switcher */}
            <div className="relative" ref={languageDropdownRef}>
              <button
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="p-2 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                title="Change language"
              >
                <Globe className="w-5 h-5" />
              </button>

              {showLanguageDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-cosmos-800 rounded-xl shadow-lg border border-emerald-100 dark:border-cosmos-700 py-2 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        i18n.language === lang.code
                          ? 'bg-emerald-100 dark:bg-cosmos-700 text-emerald-700 dark:text-cosmos-300 font-medium'
                          : 'text-emerald-700 dark:text-cosmos-400 hover:bg-emerald-50 dark:hover:bg-cosmos-700/50'
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={handleDarkModeToggle}
              className="p-2 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
              title="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Notifications */}
            <button className="relative p-2 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg transition-colors hidden md:flex">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Settings Icon Link */}
            <Link
              to="/settings"
              className="p-2 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </Link>

            {/* User Dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-emerald-600 dark:bg-emerald-700 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user?.username ? user.username.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <span className="text-sm font-medium text-emerald-900 dark:text-emerald-100 hidden md:block">
                  {user?.username || 'User'}
                </span>
                <ChevronDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-cosmos-800 rounded-xl shadow-lg border border-emerald-100 dark:border-cosmos-700 py-2 z-50">
                  <div className="px-4 py-2 border-b border-emerald-100 dark:border-cosmos-700">
                    <p className="text-sm font-medium text-emerald-900 dark:text-cosmos-300">{user?.username}</p>
                    <p className="text-xs text-emerald-600 dark:text-cosmos-400">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-emerald-700 dark:text-cosmos-300 hover:bg-emerald-50 dark:hover:bg-cosmos-700/50 transition-colors"
                    onClick={() => setShowUserDropdown(false)}
                  >
                    <User className="w-4 h-4" />
                    {t('navbar.profile', 'Profile')}
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-emerald-700 dark:text-cosmos-300 hover:bg-emerald-50 dark:hover:bg-cosmos-700/50 transition-colors"
                    onClick={() => setShowUserDropdown(false)}
                  >
                    <Settings className="w-4 h-4" />
                    {t('navbar.settings', 'Settings')}
                  </Link>
                  <div className="border-t border-emerald-100 dark:border-cosmos-700 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('navbar.logout', 'Logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
