'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface SpeedChartProps {
  data: { time: number; speed: number }[];
  color?: string;
}

export function SpeedChart({ data, color = "#eab308" }: SpeedChartProps) {
  return (
    <div className="w-full h-48 mt-8">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis 
            dataKey="time" 
            stroke="rgba(255,255,255,0.2)" 
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
            tickFormatter={(val) => `${val}s`}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.2)" 
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
            width={40}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
            itemStyle={{ color: color }}
            labelStyle={{ display: 'none' }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [`${Number(value).toFixed(1)} Mbps`, 'Speed']}
          />
          <Line 
            type="monotone" 
            dataKey="speed" 
            stroke={color} 
            strokeWidth={3} 
            dot={false}
            isAnimationActive={false} // Disable to prevent lag during fast updates
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
