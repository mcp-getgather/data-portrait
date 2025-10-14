import { useCallback } from 'react';

export const useAnalytics = () => {
  const trackEvent = useCallback(
    (event: string, properties: Record<string, any> = {}) => {
      fetch('/getgather/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          properties,
        }),
      }).catch((error) => {
        console.warn('Failed to send analytics event:', error);
      });
    },
    []
  );

  const identifyUser = useCallback((properties: Record<string, any> = {}) => {
    fetch('/getgather/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identify: true,
        properties,
      }),
    }).catch((error) => {
      console.warn('Failed to send analytics identify:', error);
    });
  }, []);

  return {
    trackEvent,
    identifyUser,
  };
};
