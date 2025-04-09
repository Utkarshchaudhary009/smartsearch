"use client";

import React from "react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
    [key: string]: string | number;
  }>;
  colors?: string[];
  dataKey?: string;
  nameKey?: string;
  height?: number;
  title?: string;
  className?: string;
  donut?: boolean;
  innerRadius?: number;
  outerRadius?: number;
}

const defaultColors = [
  "#3B82F6", // blue-500
  "#10B981", // emerald-500
  "#F97316", // orange-500
  "#8B5CF6", // violet-500
  "#EC4899", // pink-500
  "#06B6D4", // cyan-500
  "#F59E0B", // amber-500
  "#6366F1", // indigo-500
];

export function PieChart({
  data,
  colors = defaultColors,
  dataKey = "value",
  nameKey = "name",
  height = 300,
  title,
  className,
  donut = false,
  innerRadius = 60,
  outerRadius = 80,
}: PieChartProps) {
  if (!data || data.length === 0) {
    return <div className='text-center p-4'>No data available</div>;
  }

  return (
    <div className={className}>
      {title && <h3 className='text-lg font-medium mb-3'>{title}</h3>}
      <ResponsiveContainer
        width='100%'
        height={height}
      >
        <RechartsPieChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx='50%'
            cy='50%'
            innerRadius={donut ? innerRadius : 0}
            outerRadius={outerRadius}
            fill='#8884d8'
            paddingAngle={2}
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value}`, "Value"]} />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
