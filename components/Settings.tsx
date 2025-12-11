import React from 'react';
import { Clock, Check, Monitor, ShieldCheck, Moon, Sun } from 'lucide-react';

interface SettingsProps {
    refreshInterval: number;
    onIntervalChange: (interval: number) => void;
    theme: 'dark' | 'light';
    onThemeChange: (theme: 'dark' | 'light') => void;
}

export const Settings: React.FC<SettingsProps> = ({ refreshInterval, onIntervalChange, theme, onThemeChange }) => {
    const options = [
        { label: '30 Seconds (Live)', value: 30000, description: 'Best for active trading, higher data usage.' },
        { label: '1 Minute (Standard)', value: 60000, description: 'Balanced updates for general tracking.' },
        { label: '5 Minutes (Passive)', value: 300000, description: 'Minimal background data usage.' },
    ];

    return (
        <div className="p-6 md:p-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Preferences</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Customize your tracking experience</p>
            
            <div className="space-y-6">
                
                {/* Appearance Section */}
                <div className="bg-white/50 dark:bg-apple-card/50 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden">
                    <div className="p-5 border-b border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                            {theme === 'dark' ? <Moon size={20} className="text-apple-blue" /> : <Sun size={20} className="text-orange-500" />}
                            <span>Appearance</span>
                        </h2>
                    </div>
                    
                    <div className="p-5 flex items-center justify-between">
                        <div>
                            <span className="block font-medium text-lg text-gray-900 dark:text-white">Dark Mode</span>
                            <span className="text-sm text-gray-500">Toggle application theme</span>
                        </div>
                        <button 
                            onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}
                            className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${theme === 'dark' ? 'bg-apple-green' : 'bg-gray-300'}`}
                        >
                            <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>
                </div>

                {/* Refresh Rate Section */}
                <div className="bg-white/50 dark:bg-apple-card/50 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden">
                    <div className="p-5 border-b border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                            <Clock size={20} className="text-apple-blue" />
                            <span>Refresh Rate</span>
                        </h2>
                    </div>
                    
                    <div className="divide-y divide-gray-200 dark:divide-white/5">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => onIntervalChange(option.value)}
                                className="w-full flex items-center justify-between p-5 hover:bg-gray-100 dark:hover:bg-white/5 transition-all group text-left"
                            >
                                <div>
                                    <span className={`block font-medium text-lg ${refreshInterval === option.value ? 'text-apple-blue dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                        {option.label}
                                    </span>
                                    <span className="text-sm text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400">
                                        {option.description}
                                    </span>
                                </div>
                                {refreshInterval === option.value && (
                                    <div className="bg-apple-blue/10 dark:bg-apple-blue/20 p-2 rounded-full border border-apple-blue/20 dark:border-apple-blue/50">
                                        <Check size={18} className="text-apple-blue" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Info Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/50 dark:bg-apple-card/50 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-6">
                        <h3 className="text-gray-900 dark:text-white font-semibold mb-4 flex items-center space-x-2">
                            <Monitor size={18} className="text-gray-400" />
                            <span>Application Info</span>
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Version</span>
                                <span className="text-gray-900 dark:text-white font-mono">1.2.0 (Beta)</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Data Sources</span>
                                <span className="text-gray-900 dark:text-white">CoinGecko & FMP</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">AI Model</span>
                                <span className="text-gray-900 dark:text-white">Gemini 2.5 Flash</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/50 dark:bg-apple-card/50 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-6">
                        <h3 className="text-gray-900 dark:text-white font-semibold mb-4 flex items-center space-x-2">
                            <ShieldCheck size={18} className="text-gray-400" />
                            <span>Data Privacy</span>
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                            Market data is fetched directly from public APIs. Your watchlist and preferences are stored locally on your device.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};