import React from 'react';

interface TerminalStatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'pending';
  label: string;
  className?: string;
}

export const TerminalStatusBadge: React.FC<TerminalStatusBadgeProps> = ({
  status,
  label,
  className = '',
}) => {
  const statusColors = {
    success: 'terminal-success-bg text-terminal-bg',
    warning: 'terminal-warning-bg text-terminal-bg',
    error: 'terminal-error-bg text-terminal-bg',
    info: 'bg-terminal-cyan text-terminal-bg',
    pending: 'bg-terminal-elevated terminal-text border border-terminal-line',
  };

  const statusSymbols = {
    success: '✓',
    warning: '⚠',
    error: '✕',
    info: 'ⓘ',
    pending: '◌',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-1
        font-mono text-xs
        border border-terminal-line rounded-none
        ${statusColors[status]}
        ${className}
      `}
    >
      <span className="font-bold">{statusSymbols[status]}</span>
      {label.toUpperCase()}
    </span>
  );
};

export default TerminalStatusBadge;
