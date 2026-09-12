import React from 'react';

interface TerminalStatProps {
  label: string;
  value: string | number;
  unit?: string;
  status?: 'success' | 'warning' | 'error' | 'neutral';
  className?: string;
}

export const TerminalStat: React.FC<TerminalStatProps> = ({
  label,
  value,
  unit,
  status = 'neutral',
  className = '',
}) => {
  const statusColor = {
    success: 'terminal-green',
    warning: 'terminal-amber',
    error: 'terminal-red',
    neutral: 'terminal-white',
  }[status];

  return (
    <div
      className={`
        terminal-panel p-4
        flex flex-col gap-2
        ${className}
      `}
    >
      <div className="terminal-muted font-mono text-xs uppercase tracking-wide">
        {label}
      </div>
      <div className={`font-mono text-2xl font-bold ${statusColor}`}>
        {value}
        {unit && <span className="text-lg ml-1">{unit}</span>}
      </div>
    </div>
  );
};

export default TerminalStat;
