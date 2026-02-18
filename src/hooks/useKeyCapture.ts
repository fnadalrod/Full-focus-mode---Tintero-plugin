import { useEffect, useCallback, useState } from 'react';
import type { WritingState } from '../engine/stats';

interface KeyCaptureProps {
    isActive: boolean;
    backspaceMode: 'within-word' | 'disabled';
    onUpdate: (state: WritingState) => void;
    onActivity: () => void;
}

const initialState: WritingState = {
    paragraphs: [],
    currentLine: '',
    pendingSentences: [],
    cursorPosition: 0,
    wordTimestamps: [],
    sessionStart: Date.now(),
    pauses: [],
    lastKeystroke: Date.now()
};

export function useKeyCapture({ isActive, backspaceMode, onUpdate, onActivity }: KeyCaptureProps) {
    const [state, setState] = useState<WritingState>(initialState);

    useEffect(() => {
        if (isActive) {
            setState({
                ...initialState,
                sessionStart: Date.now(),
                lastKeystroke: Date.now()
            });
        }
    }, [isActive]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isActive) return;

        onActivity();
        const now = Date.now();

        const blockedKeys = [
            'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
            'Home', 'End', 'PageUp', 'PageDown',
            'Delete'
        ];
        if (blockedKeys.includes(e.key)) {
            e.preventDefault();

            return;
        }

        if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x', 'z', 'y'].includes(e.key.toLowerCase())) {
            e.preventDefault();
            return;
        }

        let newPauses = [...state.pauses];
        if (now - state.lastKeystroke > 3000) {
            newPauses.push(now);
        }

        setState(prev => {
            let newState = { ...prev, lastKeystroke: now, pauses: newPauses };

            if (e.key === 'Enter') {
                e.preventDefault();
                const completeParagraph = [...prev.pendingSentences, prev.currentLine]
                    .filter(s => s.trim().length > 0)
                    .join(' ');

                const newTimestamps = [...prev.wordTimestamps];

                if (prev.currentLine.trim().length > 0) {
                    newTimestamps.push(now);
                }

                return {
                    ...newState,
                    paragraphs: completeParagraph ? [...prev.paragraphs, completeParagraph] : prev.paragraphs,
                    currentLine: '',
                    pendingSentences: [],
                    cursorPosition: 0,
                    wordTimestamps: newTimestamps
                };
            }

            if (e.key === 'Backspace') {
                e.preventDefault();

                if (backspaceMode === 'disabled') {
                    return newState;
                }

                if (prev.currentLine.length === 0) {
                    return newState;
                }

                const lastChar = prev.currentLine[prev.currentLine.length - 1];

                if (prev.currentLine.length > 0 && lastChar === ' ') {
                    return newState;
                }

                return {
                    ...newState,
                    currentLine: prev.currentLine.slice(0, -1),
                    cursorPosition: prev.cursorPosition - 1
                };
            }

            if (e.key === '.') {
                e.preventDefault();
                const sentenceWithPeriod = prev.currentLine + '.';

                if (prev.currentLine.trim().length > 0) {
                    const newTimestamps = [...prev.wordTimestamps];
                    newTimestamps.push(now);

                    return {
                        ...newState,
                        pendingSentences: [...prev.pendingSentences, sentenceWithPeriod],
                        currentLine: '',
                        cursorPosition: 0,
                        wordTimestamps: newTimestamps
                    };
                }
                return newState;
            }

            if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                const newLine = prev.currentLine + e.key;
                const newTimestamps = [...prev.wordTimestamps];

                if (e.key === ' ' && prev.currentLine.trim().length > 0) {
                    newTimestamps.push(now);
                }

                return {
                    ...newState,
                    currentLine: newLine,
                    cursorPosition: prev.cursorPosition + 1,
                    wordTimestamps: newTimestamps
                };
            }

            return newState;
        });
    }, [isActive, backspaceMode, state, onActivity]);

    useEffect(() => {
        if (isActive) {
            window.addEventListener('keydown', handleKeyDown);

            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [isActive, handleKeyDown]);

    useEffect(() => {
        if (isActive) {
            onUpdate(state);
        }
    }, [state, isActive, onUpdate]);

    return state;
}
