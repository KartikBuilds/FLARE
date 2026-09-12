import React from 'react';

interface TerminalButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const TerminalButton: React.FC<TerminalButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const variantClasses = {
    primary: 'terminal-success-bg hover:bg-terminal-green',
    secondary: 'terminal-panel hover:bg-terminal-elevated',
    danger: 'terminal-error-bg hover:bg-terminal-red',
    success: 'terminal-success-bg hover:bg-terminal-green',
    warning: 'terminal-warning-bg hover:bg-terminal-amber',
  };

  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`
        font-mono border border-terminal-line
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        focus:outline-2 focus:outline-terminal-green focus:outline-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
        ${className}
      `}
      {...props}
    >
      [ {String(children).toUpperCase()} ]
    </button>
  );
};

export default TerminalButton;
