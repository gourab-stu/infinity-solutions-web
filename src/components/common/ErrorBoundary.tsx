import { Component, type ReactNode, type ErrorInfo } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Unhandled Application Error in ERP UI:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            height: "100vh",
            width: "100vw",
            backgroundColor: "#f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            fontFamily: "var(--font-main)",
          }}
        >
          <div
            style={{
              maxWidth: "520px",
              backgroundColor: "#ffffff",
              border: "1px solid var(--border-medium)",
              borderRadius: "var(--radius-sm)",
              padding: "2rem",
              boxShadow: "var(--shadow-lg)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "var(--radius-xs)",
                backgroundColor: "#fff1f2",
                color: "#e11d48",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1rem",
              }}
            >
              <AlertTriangle size={28} />
            </div>

            <h2
              style={{
                fontSize: "1.15rem",
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: "0.4rem",
              }}
            >
              Unexpected Application Error
            </h2>
            <p
              style={{
                fontSize: "0.78rem",
                color: "#64748b",
                marginBottom: "1.25rem",
                lineHeight: 1.4,
              }}
            >
              The application encountered an unexpected runtime state. Your
              database and records remain secure.
            </p>

            {this.state.error?.message && (
              <div
                style={{
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "var(--radius-xs)",
                  padding: "0.65rem 0.85rem",
                  fontSize: "0.72rem",
                  fontFamily: "var(--font-mono)",
                  color: "#be123c",
                  textAlign: "left",
                  marginBottom: "1.25rem",
                  wordBreak: "break-word",
                }}
              >
                {this.state.error.message}
              </div>
            )}

            <button
              className="btn btn-primary"
              onClick={this.handleReload}
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                gap: "0.4rem",
              }}
            >
              <RefreshCw size={14} /> Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
