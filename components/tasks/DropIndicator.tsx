"use client";

interface DropIndicatorProps {
  isVisible: boolean;
  position: "top" | "bottom";
}

export function DropIndicator({ isVisible, position }: DropIndicatorProps) {
  if (!isVisible) return null;

  return (
    <div 
      className={`w-full h-0.5 bg-blue-500 rounded-full transition-all duration-200 ${
        position === "top" ? "-mt-1" : "-mb-1"
      }`}
      style={{
        boxShadow: "0 0 8px rgba(59, 130, 246, 0.5)",
      }}
    />
  );
}
