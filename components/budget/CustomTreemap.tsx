"use client";

import { useState, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as d3 from "d3";

// Input data interface (from ManagementTab)
interface AllocationData {
  name: string;
  size: number;
  description?: string;
  isUnallocated: boolean;
  allocation?: {
    id: string;
    category: string;
    amount: number;
    description?: string;
  };
}

// Internal node structure with position/size from D3
interface TreeNode {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  data: {
    name: string;
    value: number; // D3 uses 'value' not 'size'
    isUnallocated?: boolean;
    allocation?: AllocationData;
  };
}

interface CustomTreemapProps {
  data: AllocationData[];
  currencyFormatter: (currency: string) => Intl.NumberFormat;
  budgetCurrency: string;
  onAllocationClick: (allocation: AllocationData) => void;
}

// Category color mapping for consistent colors
const categoryColors: Record<string, string> = {
  "Rent": "#4f46e5", // Indigo
  "Internet": "#7c3aed", // Violet
  "Mobile Internet": "#7c3aed", // Violet
  "Groceries": "#2563eb", // Blue
  "Eating Out": "#0891b2", // Cyan
  "Shopping": "#059669", // Emerald
  "Car Mortgage": "#65a30d", // Lime
  "House Mortgage": "#65a30d", // Lime
  "Other Mortgages or Debts": "#ca8a04", // Yellow
  "Transportation": "#ea580c", // Orange
  "Subscriptions": "#dc2626", // Red
  "Utilities": "#db2777", // Pink
  "Healthcare": "#c026d3", // Fuchsia
  "Savings": "#0891b2", // Cyan
  "Investments": "#0284c7", // Sky
  "Entertainment": "#db2777", // Pink
  "Insurance": "#4338ca", // Indigo
  "Education": "#0369a1", // Sky
  "Miscellaneous": "#57534e", // Stone
  "Custom": "#9333ea", // Purple
  "Unallocated": "#9ca3af", // Gray
};

// Category icon mapping
const categoryIcons: Record<string, string> = {
  "Rent": "🏠",
  "Internet": "🌐",
  "Mobile Internet": "📱",
  "Groceries": "🛒",
  "Eating Out": "🍽️",
  "Shopping": "🛍️",
  "Car Mortgage": "🚗",
  "House Mortgage": "🏡",
  "Other Mortgages or Debts": "💳",
  "Transportation": "🚌",
  "Subscriptions": "📺",
  "Utilities": "⚡",
  "Healthcare": "🏥",
  "Savings": "💰",
  "Investments": "📈",
  "Entertainment": "🎬",
  "Insurance": "🛡️",
  "Education": "📚",
  "Miscellaneous": "📦",
  "Custom": "⚙️",
  "Unallocated": "❓",
};

// Generate a consistent color based on category name
const getCategoryColor = (name: string, isUnallocated?: boolean): string => {
  if (isUnallocated) return categoryColors["Unallocated"];
  return categoryColors[name] || `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;
};

// Get category icon
const getCategoryIcon = (name: string, isUnallocated?: boolean): string => {
  if (isUnallocated) return categoryIcons["Unallocated"];
  return categoryIcons[name] || "📋";
};

// Custom Treemap Cell Component
const TreemapCell = memo(({
  node,
  currencyFormatter,
  budgetCurrency,
  onAllocationClick,
}: {
  node: TreeNode;
  currencyFormatter: (currency: string) => Intl.NumberFormat;
  budgetCurrency: string;
  onAllocationClick: (allocation: AllocationData) => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { x0, x1, y0, y1, data } = node;
  const width = x1 - x0;
  const height = y1 - y0;
  const color = getCategoryColor(data.name, data.isUnallocated);
  const icon = getCategoryIcon(data.name, data.isUnallocated);
  
  // Determine if cell is large enough to show text
  const isLargeEnough = width > 80 && height > 60;
  
  // Calculate font sizes based on cell dimensions
  const iconSize = Math.min(24, Math.max(12, Math.min(width, height) / 3));
  const titleFontSize = Math.max(8, Math.min(14, width / 8));
  const amountFontSize = Math.max(7, Math.min(12, width / 10));

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cell background with hover effect */}
      <motion.rect
        x={x0}
        y={y0}
        width={width}
        height={height}
        rx={8}
        ry={8}
        fill={color}
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth={isHovered ? 2 : 1}
        style={{ cursor: data.isUnallocated ? "default" : "pointer" }}
        onClick={() => {
          if (!data.isUnallocated && data.allocation) {
            onAllocationClick(data.allocation);
          }
        }}
        whileHover={!data.isUnallocated ? { 
          scale: 1.02,
          transition: { duration: 0.2 }
        } : {}}
      />
      
      {/* Cell content */}
      {isLargeEnough ? (
        <>
          {/* Category icon */}
          <text
            x={x0 + width / 2}
            y={y0 + height / 2 - 15}
            textAnchor="middle"
            fontSize={iconSize}
            style={{ pointerEvents: "none" }}
          >
            {icon}
          </text>
          
          {/* Category name */}
          <text
            x={x0 + width / 2}
            y={y0 + height / 2 + 5}
            textAnchor="middle"
            fill="rgba(255, 255, 255, 0.95)"
            fontSize={titleFontSize}
            fontWeight="600"
            style={{ pointerEvents: "none" }}
          >
            {data.name}
          </text>
          
          {/* Amount */}
          <text
            x={x0 + width / 2}
            y={y0 + height / 2 + 20}
            textAnchor="middle"
            fill="rgba(255, 255, 255, 0.9)"
            fontSize={amountFontSize}
            fontWeight="500"
            style={{ pointerEvents: "none" }}
          >
            {data.value != null && !isNaN(data.value) 
              ? currencyFormatter(budgetCurrency).format(data.value) 
              : ""}
          </text>
        </>
      ) : (
        // For small cells, only show icon
        <text
          x={x0 + width / 2}
          y={y0 + height / 2 + 5}
          textAnchor="middle"
          fontSize={iconSize}
          style={{ pointerEvents: "none" }}
        >
          {icon}
        </text>
      )}
      
      {/* Tooltip for small cells */}
      <AnimatePresence>
        {!isLargeEnough && isHovered && (
          <g>
            <foreignObject
              x={x0 + 10}
              y={y0 + 10}
              width={200}
              height={80}
            >
              <div className="bg-black/90 text-white text-xs p-3 rounded-lg shadow-xl border border-white/20 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{icon}</span>
                  <div className="font-semibold truncate">{data.name}</div>
                </div>
                <div className="font-mono text-sm font-bold text-green-400">
                  {data.value != null && !isNaN(data.value) 
                    ? currencyFormatter(budgetCurrency).format(data.value) 
                    : ""}
                </div>
                {!data.isUnallocated && (
                  <div className="text-xs text-gray-300 mt-1">
                    Click to edit
                  </div>
                )}
              </div>
            </foreignObject>
          </g>
        )}
      </AnimatePresence>
    </motion.g>
  );
});

TreemapCell.displayName = "TreemapCell";

// Main Custom Treemap Component
const CustomTreemap = ({
  data,
  currencyFormatter,
  budgetCurrency,
  onAllocationClick,
}: CustomTreemapProps) => {
  // Create D3 hierarchy and treemap layout
  const treemapData = useMemo(() => {
    // Create root node with children
    const root = {
      name: "root",
      children: data.map(item => ({
        name: item.name,
        value: item.size, // Use size directly from the data
        isUnallocated: item.isUnallocated,
        allocation: item.allocation
      }))
    };

    // Create D3 hierarchy
    const hierarchy = d3.hierarchy(root)
      .sum((d: { value?: number }) => d.value || 0)
      .sort((a: { value?: number }, b: { value?: number }) => (b.value || 0) - (a.value || 0));

    // Create treemap layout
    const treemapLayout = d3.treemap<{ name: string; children: Array<{ name: string; value: number; isUnallocated?: boolean; allocation?: AllocationData }> }>()
      .size([1000, 700])
      .padding(2)
      .round(true);

    // Generate treemap
    treemapLayout(hierarchy);

    // Return leaves (actual data nodes)
    const leaves = hierarchy.leaves() as unknown as TreeNode[];
    return leaves;
  }, [data]);

  return (
    <div className="w-full h-full">
      <svg 
        width="100%" 
        height="100%" 
        viewBox={`0 0 1000 700`}
        className="overflow-visible"
      >
        <g>
          {treemapData.map((node, index) => (
            <TreemapCell
              key={`${node.data.name}-${index}`}
              node={node}
              currencyFormatter={currencyFormatter}
              budgetCurrency={budgetCurrency}
              onAllocationClick={onAllocationClick}
            />
          ))}
        </g>
      </svg>
    </div>
  );
};

export default memo(CustomTreemap);