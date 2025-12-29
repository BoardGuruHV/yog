/**
 * Dynamic Import Utilities
 *
 * Lazy loading configurations for heavy components to optimize bundle size.
 * Use these with next/dynamic for code splitting.
 *
 * Example usage:
 * ```tsx
 * import dynamic from 'next/dynamic'
 * import { dynamicOptions } from '@/lib/dynamic-imports'
 *
 * const HeavyComponent = dynamic(
 *   () => import('@/components/HeavyComponent'),
 *   dynamicOptions.heavy
 * )
 * ```
 */

import type { DynamicOptions } from 'next/dynamic'

// ============================================
// Loading Components
// ============================================

/**
 * Simple loading spinner component
 */
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-8 h-8 border-4 border-yoga-primary/20 border-t-yoga-primary rounded-full animate-spin" />
    </div>
  )
}

/**
 * Skeleton loading for cards
 */
export function CardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 rounded-lg h-48 mb-4" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  )
}

/**
 * Full page loading
 */
export function PageLoading() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-yoga-primary/20 border-t-yoga-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Loading...</p>
      </div>
    </div>
  )
}

// ============================================
// Dynamic Import Options
// ============================================

/**
 * Options for heavy components (TensorFlow, Three.js, etc.)
 * - No SSR to avoid server-side loading of browser-only libs
 * - Shows loading spinner while loading
 */
export const dynamicOptions = {
  /**
   * For heavy components like PoseCamera, 3D viewers
   */
  heavy: {
    ssr: false,
    loading: () => <PageLoading />,
  } satisfies DynamicOptions,

  /**
   * For medium-weight components like charts
   */
  medium: {
    ssr: false,
    loading: () => <LoadingSpinner />,
  } satisfies DynamicOptions,

  /**
   * For components that can render on server but are non-critical
   */
  deferred: {
    ssr: true,
    loading: () => <LoadingSpinner />,
  } satisfies DynamicOptions,

  /**
   * For components with no loading state needed
   */
  silent: {
    ssr: false,
  } satisfies DynamicOptions,
}

// ============================================
// Preload Utilities
// ============================================

/**
 * Preload a component when user is likely to need it
 * Call this on hover or when approaching the feature
 */
export function preloadComponent(
  loader: () => Promise<{ default: React.ComponentType<unknown> }>
) {
  // Start loading the component
  loader()
}

/**
 * Preload multiple components
 */
export function preloadComponents(
  loaders: Array<() => Promise<{ default: React.ComponentType<unknown> }>>
) {
  loaders.forEach((loader) => loader())
}

// ============================================
// Route-based Preloading Configuration
// ============================================

/**
 * Configuration for route-based preloading
 * Add component loaders here when components are created
 *
 * Example:
 * ```ts
 * export const routePreloads: Record<string, Array<() => Promise<unknown>>> = {
 *   '/practice/camera': [() => import('@/components/practice/PoseCamera')],
 *   '/dashboard': [() => import('@/components/dashboard/Charts')],
 * }
 * ```
 */
export const routePreloads: Record<string, Array<() => Promise<unknown>>> = {}

/**
 * Preload components for a specific route
 */
export function preloadForRoute(pathname: string) {
  // Find matching route pattern
  for (const [pattern, loaders] of Object.entries(routePreloads)) {
    const regex = new RegExp(
      `^${pattern.replace(/\[.*?\]/g, '[^/]+')}$`
    )
    if (regex.test(pathname)) {
      loaders.forEach((loader) => loader())
      break
    }
  }
}
