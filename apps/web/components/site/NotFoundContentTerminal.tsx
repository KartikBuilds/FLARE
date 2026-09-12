import Link from "next/link";

export function NotFoundContentTerminal() {
  return (
    <section className="terminal-shell bg-terminal-bg min-h-screen flex items-center justify-center py-20 md:py-32">
      <div className="container-flare max-w-2xl mx-auto space-y-8">
        {/* Terminal Error Header */}
        <div className="terminal-panel p-6 space-y-4">
          <div className="font-mono text-xs terminal-muted uppercase tracking-widest">
            ┌─ FLARE://ERROR/404 ────────────────────────────────────┐
          </div>

          {/* Error Message */}
          <div className="space-y-4">
            <h1 className="font-mono text-3xl terminal-red font-bold">
              $ locate requested_path
            </h1>
            <div className="font-mono text-sm terminal-text">
              <div className="terminal-red">&gt; ERROR: PATH_NOT_FOUND</div>
            </div>
          </div>

          {/* ASCII Art */}
          <div className="my-8 p-4 terminal-panel font-mono text-xs terminal-green overflow-x-auto">
            <pre className="whitespace-pre">
{`
    ╭─ LOST ASSET ─╮
    │      ◯       │
    │     /|\\      │  [drifting away...]
    │      |       │
    │     / \\      │
    │          ○   │
    │       ○      │
    │            ○ │
    ╰──────────────╯

    [PROTOCOL_BOUNDARY]
         ↓
    [SAFE_ZONE]
`}
            </pre>
          </div>

          {/* Description */}
          <p className="font-mono text-sm terminal-text leading-relaxed">
            This asset took a wrong turn. The path you requested doesn't exist in
            the FLARE system. Assets, like code paths, must follow valid exit routes
            to be safely recovered.
          </p>

          {/* Status Line */}
          <div className="font-mono text-xs terminal-muted border-t border-terminal-line pt-4">
            REQUEST_PATH: [UNDEFINED]
            <br />
            STATUS_CODE: 404
            <br />
            ACTION_REQUIRED: [NAVIGATE_HOME | ANALYZE | READ_DOCS]
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="
              px-6 py-3 font-mono text-sm font-bold
              terminal-success-bg text-terminal-bg
              border border-terminal-green
              hover:opacity-90 transition-opacity
              text-center uppercase tracking-wide
            "
          >
            [ RETURN_HOME ]
          </Link>
          <Link
            href="/docs"
            className="
              px-6 py-3 font-mono text-sm font-bold
              terminal-panel text-terminal-white
              border border-terminal-line
              hover:bg-terminal-elevated transition-colors
              text-center uppercase tracking-wide
            "
          >
            [ OPEN_DOCS ]
          </Link>
          <Link
            href="/app"
            className="
              px-6 py-3 font-mono text-sm font-bold
              terminal-panel text-terminal-white
              border border-terminal-line
              hover:bg-terminal-elevated transition-colors
              text-center uppercase tracking-wide
            "
          >
            [ RUN_ANALYSIS ]
          </Link>
        </div>

        {/* Footer Message */}
        <div className="text-center font-mono text-xs terminal-muted">
          Remember: every asset needs a valid withdrawal path. This one just needs
          a new direction.
        </div>
      </div>
    </section>
  );
}

export default NotFoundContentTerminal;
