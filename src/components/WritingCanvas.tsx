import { useRef, useEffect, useState } from 'react';
import type { WritingState } from '../engine/stats';
import { motion, AnimatePresence } from 'framer-motion';

interface WritingCanvasProps {
    writingState: WritingState;
}

export function WritingCanvas({ writingState }: WritingCanvasProps) {
    const allItems = [
        ...writingState.paragraphs.map((p, i) => ({ text: p, id: `p-${i}` })),
        ...writingState.pendingSentences.map((p, i) => ({ text: p, id: `s-${i}` }))
    ];

    const visibleItems = allItems.slice(-5);

    const textRef = useRef<HTMLSpanElement>(null);
    const [lineHeight, setLineHeight] = useState(0);
    const [textOffset, setTextOffset] = useState(0);

    useEffect(() => {
        if (!textRef.current) return;

        const el = textRef.current;
        const totalHeight = el.scrollHeight;

        const computed = window.getComputedStyle(el);
        const lh = parseFloat(computed.lineHeight) || parseFloat(computed.fontSize) * 1.5;
        setLineHeight(lh);

        if (totalHeight > lh + 4) {
            setTextOffset(totalHeight - lh);
        } else {
            setTextOffset(0);
        }
    }, [writingState.currentLine]);

    return (
        <div className="relative w-full h-full flex flex-col font-serif overflow-hidden">
            <div className="absolute top-[5%] bottom-[65%] w-full flex flex-col justify-end items-center pointer-events-none select-none px-4 md:px-8">
                <AnimatePresence>
                    {visibleItems.map((item, i) => (
                        <motion.div
                            key={item.id}
                            layout // Enable layout animation for smooth position changes
                            initial={{ opacity: 0, y: 20 }}
                            animate={{
                                opacity: 0.1 + (i * 0.15),
                                filter: `blur(${Math.max(0, (visibleItems.length - 1 - i) * 1.5)}px)`,
                                y: 0
                            }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="text-lg md:text-2xl text-center w-full max-w-2xl mb-3"
                            style={{
                                color: 'var(--text-muted)'
                            }}
                        >
                            {item.text}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
            <div
                className="absolute top-[35%] w-full flex justify-center px-4 md:px-8 z-10 overflow-hidden"
                style={{ maxHeight: lineHeight > 0 ? `${lineHeight + 8}px` : '3em' }}
            >
                <div className="w-full max-w-3xl text-center">
                    <span
                        ref={textRef}
                        className="text-2xl md:text-4xl leading-relaxed text-[var(--text-main)] whitespace-pre-wrap inline-block transition-transform duration-100"
                        style={{ transform: `translateY(-${textOffset}px)` }}
                    >
                        {writingState.currentLine}
                        {/* Custom Cursor */}
                        <motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                            className="inline-block w-[2px] md:w-[3px] h-[1em] bg-[var(--accent)] align-middle ml-1"
                        />
                    </span>
                </div>
            </div>

            {/* Input hint (optional) */}
            {writingState.currentLine.length === 0 && writingState.paragraphs.length === 0 && writingState.pendingSentences.length === 0 && (
                <div className="absolute top-[45%] w-full text-center text-[var(--text-dim)] text-sm opacity-50">
                    Begin typing...
                </div>
            )}
        </div>
    );
}
