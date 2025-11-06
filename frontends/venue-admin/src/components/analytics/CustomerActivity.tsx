import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ActivityData {
  hour: string;
  customers: number;
  transactions: number;
  revenue: number;
}

interface CustomerActivityProps {
  data: ActivityData[];
  title?: string;
  height?: number;
}

const CustomerActivity: React.FC<CustomerActivityProps> = ({ 
  data, 
  title = "Активность клиентов по часам",
  height = 300 
}) => {
  const formatTooltipValue = (value: number, name: string) => {
    switch (name) {
      case 'customers':
        return [`${new Intl.NumberFormat('ru-RU').format(value)}`, 'Клиенты'];
      case 'transactions':
        return [`${new Intl.NumberFormat('ru-RU').format(value)}`, 'Транзакции'];
      case 'revenue':
        return [`${new Intl.NumberFormat('ru-RU').format(value)} ₽`, 'Выручка'];
      default:
        return [value, name];
    }
  };

  return (
    <div className="customer-activity">
      <h4>{title}</h4>
      <div className="chart-container" style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="hour" 
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
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
            <Bar 
              dataKey="customers" 
              fill="#007bff" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="transactions" 
              fill="#28a745" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CustomerActivity;
