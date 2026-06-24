import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  onReset?: () => void;
}
interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught", error, info);
  }

  reset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.error) {
      return (
        <div className="card m-4 flex flex-col items-center gap-3 p-8 text-center">
          <p className="text-lg font-semibold">Something went wrong</p>
          <p className="muted max-w-md text-sm">{this.state.error.message}</p>
          <button
            onClick={this.reset}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/** Inline error state for a data panel, with a retry callback. */
export function QueryError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="card flex flex-col items-center gap-3 p-8 text-center">
      <p className="font-medium">Failed to load data</p>
      <p className="muted max-w-md text-sm">{message}</p>
      <button
        onClick={onRetry}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
      >
        Retry
      </button>
    </div>
  );
}
