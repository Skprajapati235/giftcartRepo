"use client";

import React, { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => !isLoading && onCancel()}
      />
      
      {/* Modal Content */}
      <div className="relative bg-card w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200 border border-border-theme">
        <div className="absolute top-4 right-4">
          <button 
            onClick={() => !isLoading && onCancel()}
            className="p-2 bg-hover-theme hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-8 pb-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="text-rose-500" size={36} />
          </div>
          
          <h2 className="text-2xl font-black text-foreground mb-3">{title}</h2>
          <p className="text-slate-500 font-medium text-sm leading-relaxed">{message}</p>
        </div>
        
        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={() => !isLoading && onCancel()}
            disabled={isLoading}
            className="flex-1 py-4 px-4 bg-hover-theme hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-black text-sm transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-4 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-rose-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
