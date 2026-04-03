import React from "react";

const GlobalLoader: React.FC = () => {
    return (
        <div className="fixed inset-0 flex flex-col justify-center items-center z-50">
            {/* Inline style for keyframes */}
            <style>
                {`
          @keyframes upDown {
            0%, 100% { transform: scaleY(0.2); opacity: 0.5; }
            50% { transform: scaleY(1.5); opacity: 1; }
          }
        `}
            </style>

            {/* Bars */}
            <div className="flex items-center gap-1.5 h-24">
                {Array.from({ length: 10 }).map((_, i) => (
                    <div
                        key={i}
                        className="w-2 h-10 bg-gradient-to-t from-sky-400 to-purple-600 rounded-md shadow-[0_0_12px_rgba(168,85,247,0.8)]"
                        style={{
                            animation: `upDown 1s ease-in-out infinite`,
                            animationDelay: `${i * 0.1}s`,
                        }}
                    ></div>
                ))}
            </div>

            {/* Loading Text */}
            <div className="mt-5 text-foreground text-md tracking-widest animate-pulse">
                Loading Dashbord...
            </div>
        </div>
    );
};

export default GlobalLoader;