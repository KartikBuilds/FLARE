import React from 'react';

interface TerminalWindowProps {
  title?: string;
  status?: string;
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const TerminalWindow: React.FC<TerminalWindowProps> = ({
  title,
  status,
  children,
  className = '',
  header,
  footer,
}) => {
  return (
    <div className={`terminal-panel rounded-none overflow-hidden ${className}`}>
      {/* Header */}
      {(title || status || header) && (
        <div className="terminal-box-bottom px-4 py-2 flex items-center justify-between bg-terminal-elevated">
          <div className="flex items-center gap-2">
            {title && (
              <div className="terminal-white font-mono text-sm">
                ┌─ {title}
              </div>
            )}
          </div>
          {status && (
            <div className="terminal-muted font-mono text-xs">{status}</div>
          )}
          {header && <div>{header}</div>}
        </div>
      )}

      {/* Content */}
      <div className="p-4">{children}</div>

      {/* Footer */}
      {footer && (
        <div className="terminal-box-top px-4 py-2 bg-terminal-elevated">
          {footer}
        </div>
      )}
    </div>
  );
};

export default TerminalWindow;
