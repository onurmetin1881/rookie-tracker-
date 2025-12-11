
import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, Check } from 'lucide-react';

interface TutorialProps {
    onComplete: () => void;
    onSkip: () => void;
}

interface Step {
    title: string;
    content: string;
    target: string | null;
}

const steps: Step[] = [
    {
        title: "Welcome to Rookie Tracker",
        content: "Your professional dashboard for tracking Crypto, US Stocks, and Turkish Markets. Let's get you oriented.",
        target: null
    },
    {
        title: "Smart Navigation",
        content: "Use the sidebar (or bottom bar on mobile) to switch between different market views and your dashboard.",
        target: "nav-dashboard"
    },
    {
        title: "Universal Search",
        content: "Instantly find stocks, ETFs, or cryptocurrencies. Just start typing a symbol or name.",
        target: "search-bar"
    },
    {
        title: "Your Watchlist",
        content: "Keep track of your favorite assets here. You can add assets to this list from their detail view.",
        target: "nav-watchlist"
    },
    {
        title: "Customization",
        content: "Adjust refresh rates and view application preferences in the Settings menu.",
        target: "nav-settings"
    }
];

export const Tutorial: React.FC<TutorialProps> = ({ onComplete, onSkip }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });

    const updateTargetRect = useCallback(() => {
        const step = steps[currentStep];
        if (!step.target) {
            setTargetRect(null);
            return;
        }

        // Find the visible element with the data-tour attribute
        const elements = document.querySelectorAll(`[data-tour="${step.target}"]`);
        let visibleElement: Element | null = null;

        for (let i = 0; i < elements.length; i++) {
            const el = elements[i] as HTMLElement;
            if (el.offsetParent !== null) { // Check visibility
                visibleElement = el;
                break;
            }
        }

        if (visibleElement) {
            const rect = visibleElement.getBoundingClientRect();
            // Add some padding
            setTargetRect(rect);
        } else {
            // Fallback if element not found/visible
            setTargetRect(null);
        }
    }, [currentStep]);

    useEffect(() => {
        updateTargetRect();
        const handleResize = () => {
            setWindowSize({ w: window.innerWidth, h: window.innerHeight });
            updateTargetRect();
        };
        
        // Short delay to ensure DOM is ready/rendered
        const timeout = setTimeout(updateTargetRect, 100);

        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', updateTargetRect, true);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', updateTargetRect, true);
            clearTimeout(timeout);
        };
    }, [currentStep, updateTargetRect]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    const isLastStep = currentStep === steps.length - 1;

    // Calculate Tooltip Position
    let tooltipStyle: React.CSSProperties = {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
    };

    if (targetRect) {
        // Simple heuristic: place below if space allows, otherwise above
        const spaceBelow = windowSize.h - targetRect.bottom;
        const spaceAbove = targetRect.top;
        const tooltipHeight = 200; // approx

        if (spaceBelow > tooltipHeight || spaceBelow > spaceAbove) {
            tooltipStyle = {
                top: targetRect.bottom + 20,
                left: targetRect.left + (targetRect.width / 2),
                transform: 'translateX(-50%)',
            };
        } else {
            tooltipStyle = {
                bottom: windowSize.h - targetRect.top + 20,
                left: targetRect.left + (targetRect.width / 2),
                transform: 'translateX(-50%)',
            };
        }
    }

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden">
            {/* Spotlight Overlay */}
            {targetRect ? (
                <div 
                    className="absolute bg-transparent transition-all duration-500 ease-in-out box-content border-2 border-apple-blue rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.75)]"
                    style={{
                        top: targetRect.top - 4,
                        left: targetRect.left - 4,
                        width: targetRect.width + 8,
                        height: targetRect.height + 8,
                    }}
                />
            ) : (
                <div className="absolute inset-0 bg-black/75 transition-opacity duration-500" />
            )}

            {/* Tooltip Card */}
            <div 
                className={`absolute w-[90vw] max-w-sm transition-all duration-500 ease-in-out flex flex-col items-center md:items-start ${!targetRect && 'translate-x-[-50%] translate-y-[-50%] left-1/2 top-1/2'}`}
                style={targetRect ? tooltipStyle : {}}
            >
                <div className="bg-white dark:bg-[#1c1c1e] text-gray-900 dark:text-white p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl relative w-full">
                    {/* Progress Dots */}
                    <div className="flex space-x-1.5 mb-4 justify-center md:justify-start">
                        {steps.map((_, idx) => (
                            <div 
                                key={idx}
                                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-6 bg-apple-blue' : 'w-1.5 bg-gray-300 dark:bg-gray-600'}`}
                            />
                        ))}
                    </div>

                    <h3 className="text-xl font-bold mb-2 text-center md:text-left">{steps[currentStep].title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed text-center md:text-left">
                        {steps[currentStep].content}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-200 dark:border-white/5">
                        <button 
                            onClick={onSkip}
                            className="text-gray-500 hover:text-gray-900 dark:hover:text-white text-sm font-medium px-2 transition-colors"
                        >
                            Skip
                        </button>
                        <button 
                            onClick={handleNext}
                            className="bg-apple-blue hover:bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-semibold transition-colors flex items-center space-x-1"
                        >
                            <span>{isLastStep ? 'Get Started' : 'Next'}</span>
                            {isLastStep ? <Check size={16} /> : <ChevronRight size={16} />}
                        </button>
                    </div>

                    {!targetRect && (
                        <button 
                            onClick={onSkip} 
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};