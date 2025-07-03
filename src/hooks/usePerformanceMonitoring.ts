import { useEffect, useCallback } from 'react';
import { performanceTracker, getWebVitals, getMemoryUsage } from '@/lib/utils/performance';

// Type definitions for browser APIs
interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export interface PerformanceData {
  pageLoad: number;
  webVitals: ReturnType<typeof getWebVitals>;
  memory: MemoryInfo | null;
  timestamp: number;
}

/**
 * Hook for monitoring page performance
 */
export function usePerformanceMonitoring(pageName: string) {
  useEffect(() => {
    // Mark page load start
    performanceTracker.mark(`${pageName}-load-start`);

    // Monitor page load completion
    const handleLoad = () => {
      performanceTracker.mark(`${pageName}-load-complete`);
      const loadTime = performanceTracker.measure(
        `${pageName}-load-time`,
        `${pageName}-load-start`,
        `${pageName}-load-complete`
      );

      // Collect performance data
      const data: PerformanceData = {
        pageLoad: loadTime || 0,
        webVitals: getWebVitals(),
        memory: getMemoryUsage(),
        timestamp: Date.now(),
      };

      // Log in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Performance data for ${pageName}:`, data);
      }

      // In production, this would be sent to analytics
      // sendToAnalytics('page-performance', { page: pageName, ...data });
    };

    // Wait for page to be fully loaded
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, [pageName]);

  const trackInteraction = useCallback((action: string) => {
    performanceTracker.mark(`${pageName}-${action}`);
  }, [pageName]);

  return { trackInteraction };
}

/**
 * Hook for monitoring component rendering performance
 */
export function useRenderPerformance(componentName: string) {
  useEffect(() => {
    performanceTracker.mark(`${componentName}-render`);
  });

  const trackRerender = useCallback((reason?: string) => {
    const suffix = reason ? `-${reason}` : '';
    performanceTracker.mark(`${componentName}-rerender${suffix}`);
  }, [componentName]);

  return { trackRerender };
}