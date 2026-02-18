import { useState, useEffect } from 'react';
import { FileSelector } from '../components/FileSelector';
import { Clock, FileText, ChevronRight, Plus, Quote, LayoutTemplate, Timer } from 'lucide-react';


import { ConstellationBackground } from '../components/ConstellationBackground';
import { useSettings } from '../hooks/useSettings';

interface SetupProps {
    onStart: (fileId: string, fileName: string, duration: number, mode: 'append' | 'new') => void;
    hasSeenIntro: boolean;
    onIntroComplete: () => void;
}

const PHRASES = [
    "Full focus.",
    "No distraction.",
    "No turning back.",
    "Write until the timer stops."
];

export function Setup({ onStart, hasSeenIntro, onIntroComplete }: SetupProps) {
    const [selectedFile, setSelectedFile] = useState<{ id: string, name: string } | null>(null);
    const [duration, setDuration] = useState<number>(10 * 60 * 1000);
    const { settings, updateSetting } = useSettings();
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(-1);
    const [showIntro, setShowIntro] = useState(!hasSeenIntro);
    const [newFileName, setNewFileName] = useState("");
    const [isCreatingNew, setIsCreatingNew] = useState(false);

    useEffect(() => {
        if (!showIntro) {
            return;
        }

        if (hasSeenIntro) {
            setShowIntro(false);

            return;
        }

        let isMounted = true;

        const runSequence = async () => {
            await new Promise(r => setTimeout(r, 500));

            if (!isMounted) {
                return;
            }

            setCurrentPhraseIndex(0);

            for (let i = 0; i < PHRASES.length; i++) {
                await new Promise(r => setTimeout(r, 1500));

                if (!isMounted) {
                    return;
                }

                if (i < PHRASES.length - 1) {
                    const next = i + 1;
                    setCurrentPhraseIndex(next);
                }
            }

            await new Promise(r => setTimeout(r, 1000));

            if (!isMounted) {
                return;
            }

            setShowIntro(false);
            onIntroComplete();
        };

        runSequence();

        return () => {
            isMounted = false;
        };
    }, []);

    const durations = [
        { label: '5m', value: 5 * 60 * 1000 },
        { label: '10m', value: 10 * 60 * 1000 },
        { label: '15m', value: 15 * 60 * 1000 },
        { label: '20m', value: 20 * 60 * 1000 },
        { label: '30m', value: 30 * 60 * 1000 },
        { label: '∞', value: 0 },
    ];

    const handleStart = async () => {
        if (isCreatingNew) {
            if (!newFileName.trim()) return;
            onStart("NEW_FILE_PENDING", newFileName, duration, 'new');
        } else if (selectedFile) {
            onStart(selectedFile.id, selectedFile.name, duration, 'append');
        }
    };

    if (showIntro) {
        return (
            <div
                className="relative flex flex-col items-center justify-center min-h-screen bg-black text-center cursor-pointer overflow-hidden"
                onClick={() => {
                    console.log('[Setup] Intro skipped by user');
                    setShowIntro(false);
                    onIntroComplete();
                }}
            >
                <ConstellationBackground />
                <div className="relative z-10 h-24 flex items-center justify-center">
                    {currentPhraseIndex >= 0 && currentPhraseIndex < PHRASES.length && (
                        <h1
                            key={currentPhraseIndex}
                            className="text-3xl md:text-5xl font-serif text-[var(--text-main)] tracking-wider whitespace-nowrap"
                        >
                            {PHRASES[currentPhraseIndex]}
                        </h1>
                    )}
                </div>
                <div className="absolute bottom-8 text-white/20 text-xs animate-pulse">
                    Click to skip
                </div>
            </div>
        );
    }

    return (
        <div
            className="flex flex-col items-center justify-center min-h-screen p-8 text-center max-w-2xl mx-auto relative z-10"
        >
            {settings.showBackground && <ConstellationBackground />}

            <h1 className="text-5xl font-serif mb-4 tracking-wide text-[var(--accent)] uppercase relative z-10 drop-shadow-lg">Full Focus Mode</h1>

            <div className="w-full bg-[var(--bg-secondary)]/80 border border-[var(--border-dim)] rounded-none p-8 mb-8 text-left shadow-2xl backdrop-blur-md relative z-10">
                {/* File Selection */}
                <div className="mb-8 border-b border-[var(--border-dim)] pb-8">
                    <div className="flex justify-between items-center mb-4">
                        <label className="flex items-center gap-3 text-xs text-[var(--text-dim)] uppercase tracking-[0.2em] font-bold">
                            <FileText className="w-3 h-3" /> Select Target File
                        </label>
                        <button
                            onClick={() => setIsCreatingNew(!isCreatingNew)}
                            className="text-xs text-[var(--accent)] hover:text-white uppercase tracking-wider flex items-center gap-1"
                        >
                            {isCreatingNew ? "Select Existing" : <> <Plus className="w-3 h-3" /> Create New</>}
                        </button>
                    </div>

                    {isCreatingNew ? (
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={newFileName}
                                onChange={(e) => setNewFileName(e.target.value)}
                                placeholder="Enter file name..."
                                className="w-full bg-black/50 border border-[var(--border-dim)] p-4 text-[var(--text-main)] placeholder:text-[var(--text-dim)] outline-none focus:border-[var(--accent)] transition-colors"
                            />
                        </div>
                    ) : (
                        <>
                            <FileSelector onSelect={(id, name) => setSelectedFile({ id, name })} />
                            {selectedFile && (
                                <div className="mt-3 text-sm text-[var(--accent)] font-mono">
                                    &gt; {selectedFile?.name || 'Unknown'} SELECTED
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Duration */}
                <div className="mb-8 border-b border-[var(--border-dim)] pb-8">
                    <label className="flex items-center gap-3 text-xs text-[var(--text-dim)] mb-4 uppercase tracking-[0.2em] font-bold">
                        <Clock className="w-3 h-3" /> Duration
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                        {durations.map(d => (
                            <button
                                key={d.label}
                                onClick={() => setDuration(d.value)}
                                className={`py-3 text-xs font-mono transition-all border ${duration === d.value
                                    ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                                    : 'bg-transparent text-[var(--text-dim)] border-[var(--border-dim)] hover:border-[var(--text-muted)] hover:text-[var(--text-main)]'
                                    }`}
                            >
                                {d.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Settings (Moved inside) */}
                <div className="mb-8">
                    <label className="flex items-center gap-3 text-xs text-[var(--text-dim)] mb-4 uppercase tracking-[0.2em] font-bold">
                        <LayoutTemplate className="w-3 h-3" /> Preference
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <label className={`flex items-center justify-center p-3 border cursor-pointer transition-all gap-2 text-xs uppercase tracking-wider ${settings.showBackground ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--text-main)]' : 'border-[var(--border-dim)] text-[var(--text-dim)]'}`}>
                            <input
                                type="checkbox"
                                checked={settings.showBackground}
                                onChange={(e) => updateSetting('showBackground', e.target.checked)}
                                className="hidden"
                            />
                            <div className={`w-2 h-2 rounded-full ${settings.showBackground ? 'bg-[var(--accent)]' : 'bg-[var(--text-dim)]'}`} />
                            Stars
                        </label>

                        <label className={`flex items-center justify-center p-3 border cursor-pointer transition-all gap-2 text-xs uppercase tracking-wider ${settings.showQuotes ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--text-main)]' : 'border-[var(--border-dim)] text-[var(--text-dim)]'}`}>
                            <input
                                type="checkbox"
                                checked={settings.showQuotes}
                                onChange={(e) => updateSetting('showQuotes', e.target.checked)}
                                className="hidden"
                            />
                            <Quote className="w-3 h-3" /> Quotes
                        </label>

                        <label className={`flex items-center justify-center p-3 border cursor-pointer transition-all gap-2 text-xs uppercase tracking-wider ${settings.showTimer ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--text-main)]' : 'border-[var(--border-dim)] text-[var(--text-dim)]'}`}>
                            <input
                                type="checkbox"
                                checked={settings.showTimer}
                                onChange={(e) => updateSetting('showTimer', e.target.checked)}
                                className="hidden"
                            />
                            <Timer className="w-3 h-3" /> Timer
                        </label>
                    </div>
                </div>

                <button
                    disabled={(!selectedFile && !isCreatingNew) || (isCreatingNew && !newFileName.trim())}
                    onClick={handleStart}
                    className="group w-full py-5 bg-[var(--text-main)] text-black font-bold uppercase tracking-[0.2em] hover:bg-white disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-4"
                >
                    Begin Session
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}
