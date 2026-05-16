"use client";

import { useEffect, useRef, useCallback, useTransition, useState } from "react";
import ReactMarkdown from 'react-markdown';
import { cn } from "@/lib/utils";
import {
    SendIcon,
    LoaderIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react"

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            textarea.style.height = `${minHeight}px`;
            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  containerClassName?: string;
  showRing?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, containerClassName, showRing = true, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    
    return (
      <div className={cn(
        "relative",
        containerClassName
      )}>
        <textarea
          className={cn(
            "flex min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
            "transition-all duration-200 ease-in-out",
            "placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed disabled:opacity-50",
            showRing ? "focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0" : "",
            className
          )}
          ref={ref}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {showRing && isFocused && (
          <motion.span 
            className="absolute inset-0 rounded-md pointer-events-none ring-2 ring-offset-0 ring-brand/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export function AnimatedAIChat({ 
  onSendMessage, 
  isTyping, 
  messages, 
  compact 
}: { 
  onSendMessage: (msg: string) => void, 
  isTyping: boolean, 
  messages: any[], 
  compact?: boolean 
}) {
    const [value, setValue] = useState("");
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: compact ? 40 : 60,
        maxHeight: 200,
    });
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim() && !isTyping) {
                handleSend();
            }
        }
    };

    const handleSend = () => {
        if (value.trim() && !isTyping) {
            onSendMessage(value.trim());
            setValue("");
            adjustHeight(true);
        }
    };

    return (
        <div className={cn("flex flex-col w-full h-full relative overflow-hidden rounded-2xl bg-muted border border-border shadow-xl", compact ? "" : "min-h-[500px]")}>
            {/* Background elements */}
            <div className="absolute inset-0 w-full h-full overflow-hidden top-0 left-0">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full mix-blend-normal filter blur-[80px] animate-pulse" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full mix-blend-normal filter blur-[80px] animate-pulse delay-700" />
            </div>

            <div className="relative z-10 flex flex-col h-full flex-grow">
               <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                 <AnimatePresence initial={false}>
                   {messages.map((m, idx) => (
                     <motion.div
                       key={idx}
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       className={cn("flex w-full", m.role === 'user' ? "justify-end" : "justify-start")}
                     >
                       <div className={cn(
                           "py-3 px-4 max-w-[85%] rounded-2xl text-sm leading-relaxed", 
m.role === 'user' 
                               ? "bg-brand/20 text-foreground border border-brand/30 rounded-br-sm" 
                               : "bg-muted/80 text-foreground/80 border border-border rounded-bl-sm"
                         )}
                         style={m.role === 'user' ? { whiteSpace: "pre-wrap" } : {}}
                       >
                         {m.role === 'user' ? (
                           m.content
                         ) : (
                           <div className="prose prose-invert prose-orange prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-card prose-pre:border prose-pre:border-border">
                             <ReactMarkdown>{m.content}</ReactMarkdown>
                           </div>
                         )}
                       </div>
                     </motion.div>
                   ))}
                   {isTyping && (
                     <motion.div
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, scale: 0.95 }}
                       className="flex justify-start w-full"
                     >
<div className="py-3 px-4 rounded-2xl bg-muted/80 border border-border rounded-bl-sm flex items-center gap-2">
                          <div className="text-sm text-muted-foreground">Thinking</div>
                         <TypingDots />
                       </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
                 <div ref={messagesEndRef} />
               </div>

                <div className={cn("p-4 sticky bottom-0 bg-card/90 backdrop-blur-md border-t border-border", compact ? "px-3 py-3" : "")}>
                    <div className="relative flex items-end">
                        <Textarea
                            ref={textareaRef}
                            value={value}
                            onChange={(e) => {
                                setValue(e.target.value);
                                adjustHeight();
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Type to elaborate further..."
                            containerClassName="w-full flex-1 mr-2"
                            className={cn(
                                "w-full px-4 py-2",
                                "resize-none",
                                "bg-background/50",
                                "border border-border",
                                "text-foreground text-sm",
                                "rounded-xl",
                                "focus-visible:ring-1 focus-visible:ring-brand/50 focus:border-brand/50",
                                "placeholder:text-muted-foreground",
                                compact ? "min-h-[40px]" : "min-h-[60px]"
                            )}
                            showRing={false}
                        />
                        <button
                            type="button"
                            onClick={handleSend}
                            disabled={isTyping || !value.trim()}
                            className={cn(
                                "p-3 rounded-xl transition-all flex-shrink-0 h-fit",
                                value.trim() && !isTyping
                                    ? "bg-brand hover:bg-brand/90 text-white shadow-lg shadow-brand/20"
                                    : "bg-muted text-muted-foreground cursor-not-allowed"
                            )}
                        >
                            {isTyping ? (
                                <LoaderIcon className="w-4 h-4 animate-spin text-muted-foreground" />
                            ) : (
                                <SendIcon className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TypingDots() {
    return (
        <div className="flex items-center ml-1">
            {[1, 2, 3].map((dot) => (
                <motion.div
                    key={dot}
                    className="w-1.5 h-1.5 bg-muted-foreground rounded-full mx-0.5"
                    initial={{ opacity: 0.3 }}
                    animate={{ 
                        opacity: [0.3, 0.9, 0.3],
                        scale: [0.85, 1.1, 0.85]
                    }}
                    transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: dot * 0.15,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
}
