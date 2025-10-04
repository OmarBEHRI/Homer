"use client";

interface ColorSelectorProps {
  value: string;
  onChange: (value: string) => void;
  colors: string[];
}

export function ColorSelector({ value, onChange, colors }: ColorSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {/* No color option */}
        <button
          type="button"
          className={`
            w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center
            ${!value ? "border-gray-600" : "hover:border-gray-400"}
          `}
          onClick={() => onChange("")}
          title="No color"
        >
          {!value && (
            <div className="w-3 h-3 bg-gray-400 rounded-full" />
          )}
        </button>

        {/* Color options */}
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            className={`
              w-8 h-8 rounded-full border-2 transition-all
              ${value === color ? "border-gray-600 scale-110" : "border-gray-300 hover:border-gray-400"}
            `}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
            title={color}
          />
        ))}
      </div>
      
      {value && (
        <div className="text-xs text-gray-500">
          Selected: <span className="font-mono">{value}</span>
        </div>
      )}
    </div>
  );
}
