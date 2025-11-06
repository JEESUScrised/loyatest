import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueData {
  date: string;
  revenue: number;
  points: number;
  customers: number;
}

interface RevenueChartProps {
  data: RevenueData[];
  title?: string;
  height?: number;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ 
  data, 
  title = "Динамика выручки",
  height = 300 
}) => {
  const formatTooltipValue = (value: number, name: string) => {
    switch (name) {
      case 'revenue':
        return [`${new Intl.NumberFormat('ru-RU').format(value)} ₽`, 'Выручка'];
      case 'points':
        return [`${new Intl.NumberFormat('ru-RU').format(value)}`, 'Баллы'];
      case 'customers':
        return [`${new Intl.NumberFormat('ru-RU').format(value)}`, 'Клиенты'];
      default:
        return [value, name];
    }
  };

  const formatXAxisLabel = (tickItem: string) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  return (
    <div className="revenue-chart">
      <h4>{title}</h4>
      <div className="chart-container" style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxisLabel}
              stroke="#666"
              fontSize={12}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
              tickFormatter={(value) => new Intl.NumberFormat('ru-RU').format(value)}
            />
            <Tooltip 
              formatter={formatTooltipValue}
              labelFormatter={(label) => `Дата: ${new Date(label).toLocaleDateString('ru-RU')}`}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#007bff" 
              strokeWidth={2}
              dot={{ fill: '#007bff', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#007bff', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="points" 
              stroke="#28a745" 
              strokeWidth={2}
              dot={{ fill: '#28a745', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#28a745', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
