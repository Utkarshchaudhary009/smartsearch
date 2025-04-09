"use client";

import React from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface BarChartProps {
  data: Array<Record<string, string | number>>;
  keys: string[];
  colors?: string[];
  xAxisKey?: string;
  height?: number;
  stacked?: boolean;
  horizontal?: boolean;
  title?: string;
  className?: string;
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

export function BarChart({
  data,
  keys,
  colors = defaultColors,
  xAxisKey = "name",
  height = 300,
  stacked = false,
  horizontal = false,
  title,
  className,
}: BarChartProps) {
  if (!data || data.length === 0 || !keys || keys.length === 0) {
    return <div className='text-center p-4'>No data available</div>;
  }

  return (
    <div className={className}>
      {title && <h3 className='text-lg font-medium mb-3'>{title}</h3>}
      <ResponsiveContainer
        width='100%'
        height={height}
      >
        {horizontal ? (
          <RechartsBarChart
            data={data}
            layout='vertical'
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis type='number' />
            <YAxis
              dataKey={xAxisKey}
              type='category'
            />
            <Tooltip />
            <Legend />
            {keys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
                stackId={stacked ? "stack" : undefined}
              />
            ))}
          </RechartsBarChart>
        ) : (
          <RechartsBarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {keys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
                stackId={stacked ? "stack" : undefined}
              />
            ))}
          </RechartsBarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
