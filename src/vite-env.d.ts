/// <reference types="vite/client" />

interface Window {
  electronAPI: {
    sendMessage: (channel: string, data: unknown) => void;
    onMessage: (channel: string, func: (...args: unknown[]) => void) => void;
  };
}
