
import React, { useEffect, useState } from 'react';
import { fetchMarketNews, fetchCryptoNews } from '../services/marketService';
import { NewsArticle } from '../types';
import { ExternalLink, Calendar, Newspaper, TrendingUp, Bitcoin } from 'lucide-react';

export const NewsView: React.FC = () => {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState<'stocks' | 'crypto'>('stocks');

    useEffect(() => {
        const loadNews = async () => {
            setLoading(true);
            try {
                let data: NewsArticle[] = [];
                if (category === 'stocks') {
                    data = await fetchMarketNews();
                } else {
                    data = await fetchCryptoNews();
                }
                setNews(data);
            } catch (error) {
                console.error("Failed to load news", error);
            } finally {
                setLoading(false);
            }
        };
        loadNews();
    }, [category]);

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Market News</h1>
                    <p className="text-gray-500 dark:text-gray-400">Latest updates from global markets</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <a 
                        href="https://www.investing.com/news/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hidden md:flex items-center space-x-2 bg-white dark:bg-white/10 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-white/20 transition-colors"
                    >
                        <ExternalLink size={16} />
                        <span>Investing.com</span>
                    </a>
                </div>
            </div>

            {/* Category Toggle Buttons */}
            <div className="flex space-x-4 mb-8">
                <button 
                    onClick={() => setCategory('stocks')}
                    className={`flex-1 md:flex-none flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                        category === 'stocks' 
                            ? 'bg-apple-blue text-white shadow-lg shadow-apple-blue/30' 
                            : 'bg-white dark:bg-apple-card text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                >
                    <TrendingUp size={18} />
                    <span>Stocks</span>
                </button>
                <button 
                    onClick={() => setCategory('crypto')}
                    className={`flex-1 md:flex-none flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                        category === 'crypto' 
                            ? 'bg-apple-blue text-white shadow-lg shadow-apple-blue/30' 
                            : 'bg-white dark:bg-apple-card text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                >
                    <Bitcoin size={18} />
                    <span>Crypto</span>
                </button>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-apple-blue border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {news.length === 0 ? (
                        <div className="col-span-full text-center py-20 text-gray-500">
                            No recent news available.
                        </div>
                    ) : (
                        news.map((article, index) => (
                            <div key={index} className="bg-white dark:bg-apple-card border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
                                <div className="h-40 overflow-hidden relative">
                                    {article.image ? (
                                        <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-transform hover:scale-105 duration-500" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                                            <Newspaper size={40} className="text-gray-400" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-xs px-2 py-1 rounded">
                                        {article.site}
                                    </div>
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex items-center space-x-2 mb-3">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${category === 'crypto' ? 'text-orange-500 bg-orange-50 dark:bg-orange-900/30' : 'text-apple-blue bg-blue-50 dark:bg-blue-900/30'}`}>
                                            {article.symbol || (category === 'crypto' ? 'CRYPTO' : 'MARKET')}
                                        </span>
                                        <span className="text-xs text-gray-500 flex items-center">
                                            <Calendar size={12} className="mr-1" />
                                            {new Date(article.publishedDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight">
                                        {article.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-4 flex-1">
                                        {article.text}
                                    </p>
                                    <a 
                                        href={article.url} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="text-apple-blue text-sm font-medium hover:underline mt-auto inline-flex items-center"
                                    >
                                        Read Full Story <ExternalLink size={12} className="ml-1" />
                                    </a>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};
