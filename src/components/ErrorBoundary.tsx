import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application boundary caught error:', error.message, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#08080a] px-6 text-center text-[#f4f4f0]">
          <p className="font-mono-tabular text-xs tracking-[0.2em] text-[#e5a93c]">
            R &amp; L STUDIO
          </p>
          <h1 className="mt-4 font-display text-3xl font-semibold">
            Something interrupted this view.
          </h1>
          <p className="mt-3 max-w-md text-sm text-[#a1a1aa]">
            Please reload the experience to re-establish connection with R &amp; L Studio.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-8 bg-[#e5a93c] px-6 py-3 text-xs font-semibold tracking-[0.14em] text-[#08080a] hover:bg-[#f0ba54] cursor-pointer"
          >
            RELOAD STUDIO
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
