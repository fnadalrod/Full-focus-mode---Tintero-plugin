import type { WritingState } from '../engine/stats';
import { motion, AnimatePresence } from 'framer-motion';

interface WritingCanvasProps {
    writingState: WritingState;
}

export function WritingCanvas({ writingState }: WritingCanvasProps) {
    const backgroundItems = [...writingState.paragraphs, ...writingState.pendingSentences];
    const visibleItems = backgroundItems.slice(-5);

    return (
        <div className="relative w-full max-w-3xl mx-auto h-full flex flex-col justify-center items-center font-serif">
            {/* Previous lines (Blurred) */}
            <div className="absolute bottom-[55%] w-full flex flex-col gap-4 items-center pointer-events-none select-none">
                <AnimatePresence>
                    {visibleItems.map((p, i) => (
                        <motion.div
                            key={visibleItems.length - i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{
                                opacity: 0.1 + (i * 0.1),
                                filter: `blur(${(visibleItems.length - i) * 2}px)`,
                                y: 0
                            }}
                            className="text-lg md:text-2xl text-center w-full max-w-2xl px-4 md:px-8"
                            style={{
                                color: 'var(--text-muted)'
                            }}
                        >
                            {p}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Active Line (Focused) */}
            <div className="relative z-10 w-full text-center px-4 md:px-8">
                <span className="text-2xl md:text-4xl leading-relaxed text-[var(--text-main)] whitespace-pre-wrap">
                    {writingState.currentLine}
                    {/* Custom Cursor */}
                    <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="inline-block w-[3px] h-[1em] bg-[var(--accent)] align-middle ml-1"
                    />
                </span>
            </div>

            {/* Input hint (optional) */}
            {writingState.currentLine.length === 0 && writingState.paragraphs.length === 0 && writingState.pendingSentences.length === 0 && (
                <div className="absolute top-[60%] text-white/20 text-sm">
                    Begin typing...
                </div>
            )}
        </div>
    );
}
