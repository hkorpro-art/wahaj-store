"use client";

import { Component, type ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: (props: FallbackProps) => ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("ErrorBoundary caught:", error);
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          reset: () => this.setState({ error: null })
        });
      }
      return <ErrorFallback error={this.state.error} reset={() => this.setState({ error: null })} />;
    }

    return this.props.children;
  }
}

type ErrorFallbackProps = {
  error: Error;
  reset: () => void;
};

export function ErrorFallback({ error, reset }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-wahaj-bg p-6 text-center" dir="rtl">
      <div className="max-w-md rounded-[8px] border border-wahaj-border bg-white/75 p-8 shadow-soft">
        <p className="font-thmanyah-text text-sm font-medium text-wahaj-rose">WAHAJ</p>
        <h1 className="mt-3 font-thmanyah-display text-2xl font-medium text-wahaj-ink">حدث خطأ غير متوقع</h1>
        <p className="mt-2 text-sm text-wahaj-text/70">نأسف للإزعاج. يرجى تحديث الصفحة والمحاولة مرة أخرى.</p>
        <p className="mt-4 rounded bg-wahaj-rose/5 px-3 py-2 text-xs text-wahaj-text/50 font-mono truncate" dir="ltr">
          {error.message}
        </p>
        <button
          onClick={reset}
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-wahaj-ink px-6 text-sm font-bold text-white transition hover:opacity-90"
        >
          تحديث الصفحة
        </button>
      </div>
    </div>
  );
}

export type FallbackProps = {
  error: Error;
  reset: () => void;
};
