import React from 'react';

/**
 * Performance monitoring utilities
 */

// Type definitions for browser APIs
interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export interface PerformanceMetrics {
  navigation: PerformanceNavigationTiming | null;
  paint: PerformancePaintTiming[];
  marks: PerformanceMark[];
  measures: PerformanceMeasure[];
}

export interface WebVitals {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

/**
 * Get Core Web Vitals metrics
 */
export function getWebVitals(): WebVitals {
  const vitals: WebVitals = {};

  try {
    // Get navigation timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      vitals.ttfb = navigation.responseStart - navigation.requestStart;
    }

    // Get paint timing
    const paintEntries = performance.getEntriesByType('paint') as PerformancePaintTiming[];
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    if (fcp) {
      vitals.fcp = fcp.startTime;
    }

    // LCP is measured via PerformanceObserver (would need to be set up separately)
    // FID is measured via PerformanceObserver (would need to be set up separately)
    // CLS is measured via PerformanceObserver (would need to be set up separately)
  } catch (error) {
    console.warn('Performance metrics not available:', error);
  }

  return vitals;
}

/**
 * Performance marker for timing measurements
 */
export class PerformanceTracker {
  private marks: Map<string, number> = new Map();

  mark(name: string): void {
    try {
      const timestamp = performance.now();
      this.marks.set(name, timestamp);
      performance.mark(name);
    } catch (error) {
      console.warn(`Failed to mark ${name}:`, error);
    }
  }

  measure(name: string, startMark: string, endMark?: string): number | null {
    try {
      const end = endMark || performance.now();
      const start = this.marks.get(startMark);
      
      if (typeof start === 'number') {
        const duration = (typeof end === 'number' ? end : performance.now()) - start;
        performance.measure(name, startMark, endMark);
        return duration;
      }
    } catch (error) {
      console.warn(`Failed to measure ${name}:`, error);
    }
    return null;
  }

  getMetrics(): PerformanceMetrics {
    return {
      navigation: performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming || null,
      paint: performance.getEntriesByType('paint') as PerformancePaintTiming[],
      marks: performance.getEntriesByType('mark') as PerformanceMark[],
      measures: performance.getEntriesByType('measure') as PerformanceMeasure[],
    };
  }

  logMetrics(): void {
    const metrics = this.getMetrics();
    const vitals = getWebVitals();
    
    console.group('Performance Metrics');
    console.log('Web Vitals:', vitals);
    console.log('Navigation:', metrics.navigation);
    console.log('Paint Timing:', metrics.paint);
    console.log('Marks:', metrics.marks);
    console.log('Measures:', metrics.measures);
    console.groupEnd();
  }
}

/**
 * Global performance tracker instance
 */
export const performanceTracker = new PerformanceTracker();

/**
 * React component performance decorator
 */
export function withPerformanceTracking<T extends object>(
  Component: React.ComponentType<T>,
  componentName: string
): React.ComponentType<T> {
  return function PerformanceTrackedComponent(props: T) {
    React.useEffect(() => {
      performanceTracker.mark(`${componentName}-mount-start`);
      
      return () => {
        performanceTracker.mark(`${componentName}-unmount`);
        performanceTracker.measure(
          `${componentName}-lifetime`,
          `${componentName}-mount-start`,
          `${componentName}-unmount`
        );
      };
    }, []);

    React.useLayoutEffect(() => {
      performanceTracker.mark(`${componentName}-mount-complete`);
      performanceTracker.measure(
        `${componentName}-mount-time`,
        `${componentName}-mount-start`,
        `${componentName}-mount-complete`
      );
    });

    return React.createElement(Component, props);
  };
}

/**
 * Memory usage monitoring
 */
export function getMemoryUsage(): MemoryInfo | null {
  if ('memory' in performance) {
    return (performance as any).memory as MemoryInfo;
  }
  return null;
}

/**
 * Bundle size monitoring
 */
export function estimateBundleSize(): { estimated: number; unit: string } {
  const scripts = document.querySelectorAll('script[src]');
  let totalSize = 0;
  
  scripts.forEach(script => {
    const src = script.getAttribute('src');
    if (src && src.includes('/assets/')) {
      // Rough estimation based on common patterns
      totalSize += 100; // KB estimate per chunk
    }
  });

  return {
    estimated: totalSize,
    unit: 'KB'
  };
}