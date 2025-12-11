
import React, { useState } from 'react';
import { User, AuthState } from '../types';
import { Lock, Mail, User as UserIcon, ArrowRight } from 'lucide-react';

interface AuthProps {
    onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock authentication
        if (email && password) {
            onLogin({
                email,
                name: name || email.split('@')[0]
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black relative overflow-hidden transition-colors duration-300">
            {/* Minimal Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            
            <div className="w-full max-w-md p-8 bg-white dark:bg-[#050505] border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl z-10 mx-4 transition-colors duration-300">
                <div className="text-center mb-8">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center border border-gray-100 dark:border-white/5">
                        <img 
                            src="logo.png" 
                            alt="Rookie Tracker" 
                            className="w-16 h-16 object-contain dark:invert" 
                            onError={(e) => {
                                e.currentTarget.onerror = null; 
                                e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/3309/3309991.png';
                            }}
                        />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-mono tracking-tight">ROOKIE<span className="text-apple-blue">.</span></h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Professional Asset Tracking</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div className="relative group">
                            <UserIcon className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-gray-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-all font-medium placeholder-gray-400"
                            />
                        </div>
                    )}
                    <div className="relative group">
                        <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" size={20} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-gray-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-all font-medium placeholder-gray-400"
                        />
                    </div>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" size={20} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-gray-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-all font-medium placeholder-gray-400"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-3.5 rounded-xl hover:opacity-90 transition-all flex items-center justify-center space-x-2 mt-4 shadow-lg"
                    >
                        <span>{isLogin ? 'Enter' : 'Join Rookie'}</span>
                        <ArrowRight size={18} strokeWidth={3} />
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                    >
                        {isLogin ? "Need an account? Create one" : "Have an account? Sign in"}
                    </button>
                </div>
            </div>
        </div>
    );
};
