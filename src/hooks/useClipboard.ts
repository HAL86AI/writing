import { useState, useCallback } from 'react';

export const useClipboard = (timeout = 2000) => {
  const [copied, setCopied] = useState(false);

  const copy = useCallback((text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), timeout);
    });
  }, [timeout]);

  return { copied, copy };
};
