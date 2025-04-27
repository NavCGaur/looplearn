
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const mockData = [
  { week: 'W1', accuracy: 75 },
  { week: 'W2', accuracy: 78 },
  { week: 'W3', accuracy: 80 },
  { week: 'W4', accuracy: 85 },
  { week: 'W5', accuracy: 82 },
  { week: 'W6', accuracy: 88 },
];

export const AccuracyTrend = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={mockData}>
        <XAxis dataKey="week" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="accuracy"
          stroke="#10B981"
          strokeWidth={2}
          dot={{ fill: '#10B981' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
