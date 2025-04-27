
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ActivityChartProps {
  data: Array<{
    day: string;
    sessions: number;
  }>;
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="sessions" fill="#3B82F6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};
