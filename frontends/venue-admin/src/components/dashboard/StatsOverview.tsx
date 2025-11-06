import React from 'react';

interface StatCard {
  id: string;
  label: string;
  value: number | string;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: string;
}

interface StatsOverviewProps {
  stats: StatCard[];
  onStatClick?: (statId: string) => void;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, onStatClick }) => {
  const formatValue = (value: number | string): string => {
    if (typeof value === 'number') {
      return new Intl.NumberFormat('ru-RU').format(value);
    }
    return value;
  };

  const getChangeColor = (changeType?: 'positive' | 'negative' | 'neutral'): string => {
    switch (changeType) {
      case 'positive':
        return 'var(--success-color)';
      case 'negative':
        return 'var(--danger-color)';
      default:
        return 'var(--muted-color)';
    }
  };

  const getChangeIcon = (changeType?: 'positive' | 'negative' | 'neutral'): string => {
    switch (changeType) {
      case 'positive':
        return '↗';
      case 'negative':
        return '↘';
      default:
        return '→';
    }
  };

  return (
    <div className="stats-overview">
      <h3>Общая статистика</h3>
      <div className="stats-grid">
        {stats.map((stat) => (
          <div 
            key={stat.id}
            className="stat-card"
            onClick={() => onStatClick?.(stat.id)}
          >
            <div className="stat-header">
              {stat.icon && <span className="stat-icon">{stat.icon}</span>}
              <span className="stat-label">{stat.label}</span>
            </div>
            <div className="stat-value">{formatValue(stat.value)}</div>
            {stat.change !== undefined && (
              <div 
                className="stat-change"
                style={{ color: getChangeColor(stat.changeType) }}
              >
                {getChangeIcon(stat.changeType)} {Math.abs(stat.change)}%
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsOverview;
