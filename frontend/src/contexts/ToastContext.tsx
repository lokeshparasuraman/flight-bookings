import React, { createContext, useContext, useState, useCallback } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, message: string, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          let bgClass = "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-l-4";
          let icon = "🔔";
          let borderColor = "border-booking-blue";

          switch (toast.type) {
            case "success":
              borderColor = "border-green-500";
              icon = "🎉";
              break;
            case "error":
              borderColor = "border-red-500";
              icon = "❌";
              break;
            case "warning":
              borderColor = "border-amber-500";
              icon = "⚠️";
              break;
            case "info":
              borderColor = "border-blue-500";
              icon = "ℹ️";
              break;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center p-4 rounded-xl shadow-lg border border-gray-150 dark:border-gray-700 transition-all duration-300 animate-slide-up ${bgClass} ${borderColor}`}
              role="alert"
            >
              <div className="text-xl mr-3">{icon}</div>
              <div className="flex-1 text-sm font-semibold pr-2">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Dismiss notification"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
