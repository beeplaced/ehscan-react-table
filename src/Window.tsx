import React, { useRef, useEffect, useState } from "react";
import { useDraggable } from "./tools/useDraggable"; // adjust path as needed
import './style/window.css'

export interface Props {
    trackMove?: (args?: any) => void;
    open: boolean;
    initialPosition?: { x: number; y: number };
    initialWidth?: number;
    initialBodyPadding?: number;
    header?: React.ReactNode;
    body?: React.ReactNode;
    footer?: React.ReactNode;
    onClose?: () => void;
}

export const Window: React.FC<Props> = ({
    trackMove,
    open,
    initialPosition = { x: 600, y: 100 },
    initialWidth = 400,
    initialBodyPadding = 20,
    header,
    body,
    footer,
    onClose,
}) => {
    const targetRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const resizeHandleRef = useRef<HTMLDivElement>(null);
    const bodyRef = useRef<HTMLDivElement>(null);
    const footerRef = useRef<HTMLDivElement>(null);
    const [bodyPadding] = useState(initialBodyPadding);
    const [windowWidth] = useState(initialWidth);

    useDraggable(open, targetRef, headerRef, bodyRef, resizeHandleRef, bodyPadding, trackMove);

    useEffect(() => { //init
        if (!bodyRef.current || !targetRef.current || !headerRef.current) return;
        const headerHeight = headerRef.current.offsetHeight;
        const topPosition = targetRef.current.getBoundingClientRect().top;
        const availableHeight = window.innerHeight - topPosition - 20; // 20px bottom margin
        const bodyMaxHeight = Math.max(100, availableHeight - headerHeight - 2 * bodyPadding);
        bodyRef.current.style.maxHeight = `${bodyMaxHeight}px`;
        bodyRef.current.style.overflowY = "auto";
    }, [bodyPadding]);

    const [fadeIn, setFadeIn] = useState(false)

    useEffect(() => {
        if (open === undefined) return;
        setTimeout(() => {
            setFadeIn(open)
        }, 0)
    }, [open])

    if (!open) return null;

    return (
        <div ref={targetRef} className={`ext-window${fadeIn ? ' fadein' : ''}`} style={{ left: `${initialPosition.x}px`, top: `${initialPosition.y}px`, minWidth: `${windowWidth}px` }}>
            {/* Header */}
            <div ref={headerRef} className="ext-window-header">
                {header ?? (
                    <>
                        <div className="ext-window-drag-handle">||</div>
                        <div className="ext-window-header-title">Header</div>
                        <div onClick={onClose}>close</div>
                    </>
                )}
            </div>
            {/* Body */}
            <div ref={bodyRef} className="ext-window-body _ewb" style={{ padding: `${bodyPadding}px` }} >
                {body ?? <>Body</>}
            </div>

            {/* Footer */}
            {footer && (
                <div ref={footerRef} className="ext-window-footer">
                    {footer}
                </div>
            )}

            {/* Resize handle */}
            <div className="resize-handle" ref={resizeHandleRef} />
        </div>
    );
}
