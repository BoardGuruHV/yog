/**
 * @fileoverview Accessibility Utilities
 *
 * Helpers for building accessible React components following WCAG 2.1 guidelines.
 * Includes ARIA utilities, keyboard navigation, focus management, and screen reader helpers.
 *
 * @module lib/accessibility
 *
 * @example
 * ```tsx
 * import { useKeyboardNavigation, srOnly, ariaDescribedBy } from '@/lib/accessibility'
 *
 * function MyComponent() {
 *   const { containerProps, getItemProps } = useKeyboardNavigation(items)
 *
 *   return (
 *     <ul {...containerProps}>
 *       {items.map((item, i) => (
 *         <li key={item.id} {...getItemProps(i)}>{item.name}</li>
 *       ))}
 *     </ul>
 *   )
 * }
 * ```
 */

import { useCallback, useRef, useState, useEffect } from 'react'

// ============================================
// Screen Reader Utilities
// ============================================

/**
 * CSS class for visually hidden but screen-reader accessible content
 *
 * Use this for content that should be announced by screen readers
 * but not visible on screen.
 *
 * @example
 * ```tsx
 * <span className={srOnly}>Opens in new window</span>
 * ```
 */
export const srOnly =
  'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0'

/**
 * Props for visually hidden content (inline style version)
 *
 * @example
 * ```tsx
 * <span style={srOnlyStyles}>Screen reader only text</span>
 * ```
 */
export const srOnlyStyles: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
}

/**
 * Announces a message to screen readers using ARIA live regions
 *
 * @param message - Message to announce
 * @param priority - 'polite' (default) or 'assertive'
 *
 * @example
 * ```tsx
 * // After form submission
 * announce('Form submitted successfully')
 *
 * // For urgent messages
 * announce('Error: Please fix the form', 'assertive')
 * ```
 */
export function announce(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  // Create or get existing announcer element
  let announcer = document.getElementById('a11y-announcer')

  if (!announcer) {
    announcer = document.createElement('div')
    announcer.id = 'a11y-announcer'
    announcer.setAttribute('aria-live', priority)
    announcer.setAttribute('aria-atomic', 'true')
    Object.assign(announcer.style, srOnlyStyles)
    document.body.appendChild(announcer)
  } else {
    announcer.setAttribute('aria-live', priority)
  }

  // Clear and set message (triggers announcement)
  announcer.textContent = ''
  requestAnimationFrame(() => {
    announcer!.textContent = message
  })
}

// ============================================
// ARIA Helpers
// ============================================

/**
 * Generates aria-describedby for multiple description IDs
 *
 * @param ids - Array of element IDs that describe the element
 * @returns Object with aria-describedby prop or empty object
 *
 * @example
 * ```tsx
 * <input {...ariaDescribedBy(['hint-1', 'error-1'])} />
 * ```
 */
export function ariaDescribedBy(
  ids: (string | undefined | null)[]
): { 'aria-describedby'?: string } {
  const filtered = ids.filter(Boolean) as string[]
  return filtered.length > 0
    ? { 'aria-describedby': filtered.join(' ') }
    : {}
}

/**
 * Generates aria-labelledby for multiple label IDs
 *
 * @param ids - Array of element IDs that label the element
 * @returns Object with aria-labelledby prop or empty object
 */
export function ariaLabelledBy(
  ids: (string | undefined | null)[]
): { 'aria-labelledby'?: string } {
  const filtered = ids.filter(Boolean) as string[]
  return filtered.length > 0
    ? { 'aria-labelledby': filtered.join(' ') }
    : {}
}

/**
 * Common ARIA props for expandable elements (dropdowns, accordions)
 *
 * @param isExpanded - Whether the element is expanded
 * @param controlsId - ID of the controlled element
 * @returns ARIA props for the trigger element
 *
 * @example
 * ```tsx
 * <button {...ariaExpanded(isOpen, 'menu-content')}>
 *   Menu
 * </button>
 * <div id="menu-content" hidden={!isOpen}>...</div>
 * ```
 */
export function ariaExpanded(
  isExpanded: boolean,
  controlsId: string
): { 'aria-expanded': boolean; 'aria-controls': string } {
  return {
    'aria-expanded': isExpanded,
    'aria-controls': controlsId,
  }
}

/**
 * Props for current page/item in navigation
 *
 * @param isCurrent - Whether this is the current item
 * @param type - Type of current indicator
 * @returns ARIA current prop or empty object
 *
 * @example
 * ```tsx
 * <a href="/about" {...ariaCurrent(isAboutPage, 'page')}>About</a>
 * ```
 */
export function ariaCurrent(
  isCurrent: boolean,
  type: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' = 'page'
): { 'aria-current'?: typeof type } {
  return isCurrent ? { 'aria-current': type } : {}
}

// ============================================
// Keyboard Navigation Hooks
// ============================================

/**
 * Options for keyboard navigation
 */
interface KeyboardNavigationOptions {
  /** Orientation for arrow key navigation */
  orientation?: 'horizontal' | 'vertical' | 'both'
  /** Whether to loop at ends of list */
  loop?: boolean
  /** Callback when selection changes */
  onSelect?: (index: number) => void
}

/**
 * Hook for keyboard navigation in lists
 *
 * Implements arrow key navigation following WAI-ARIA patterns.
 *
 * @param itemCount - Number of items in the list
 * @param options - Navigation options
 * @returns Props and handlers for container and items
 *
 * @example
 * ```tsx
 * function Menu({ items }) {
 *   const { activeIndex, containerProps, getItemProps } = useKeyboardNavigation(
 *     items.length,
 *     { orientation: 'vertical', loop: true }
 *   )
 *
 *   return (
 *     <ul role="menu" {...containerProps}>
 *       {items.map((item, i) => (
 *         <li
 *           key={item.id}
 *           role="menuitem"
 *           {...getItemProps(i)}
 *           className={i === activeIndex ? 'active' : ''}
 *         >
 *           {item.label}
 *         </li>
 *       ))}
 *     </ul>
 *   )
 * }
 * ```
 */
export function useKeyboardNavigation(
  itemCount: number,
  options: KeyboardNavigationOptions = {}
) {
  const { orientation = 'vertical', loop = true, onSelect } = options
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLElement>(null)

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const { key } = event

      // Determine which keys to handle based on orientation
      const isVertical = orientation === 'vertical' || orientation === 'both'
      const isHorizontal = orientation === 'horizontal' || orientation === 'both'

      let newIndex = activeIndex

      if (isVertical && key === 'ArrowDown') {
        event.preventDefault()
        newIndex = activeIndex + 1
      } else if (isVertical && key === 'ArrowUp') {
        event.preventDefault()
        newIndex = activeIndex - 1
      } else if (isHorizontal && key === 'ArrowRight') {
        event.preventDefault()
        newIndex = activeIndex + 1
      } else if (isHorizontal && key === 'ArrowLeft') {
        event.preventDefault()
        newIndex = activeIndex - 1
      } else if (key === 'Home') {
        event.preventDefault()
        newIndex = 0
      } else if (key === 'End') {
        event.preventDefault()
        newIndex = itemCount - 1
      } else if (key === 'Enter' || key === ' ') {
        event.preventDefault()
        if (activeIndex >= 0) {
          onSelect?.(activeIndex)
        }
        return
      } else {
        return
      }

      // Handle looping or clamping
      if (loop) {
        if (newIndex < 0) newIndex = itemCount - 1
        if (newIndex >= itemCount) newIndex = 0
      } else {
        newIndex = Math.max(0, Math.min(itemCount - 1, newIndex))
      }

      setActiveIndex(newIndex)
    },
    [activeIndex, itemCount, loop, orientation, onSelect]
  )

  const getItemProps = useCallback(
    (index: number) => ({
      tabIndex: index === activeIndex ? 0 : -1,
      'aria-selected': index === activeIndex,
      onFocus: () => setActiveIndex(index),
      onClick: () => onSelect?.(index),
    }),
    [activeIndex, onSelect]
  )

  const containerProps = {
    ref: containerRef,
    onKeyDown: handleKeyDown,
    tabIndex: activeIndex === -1 ? 0 : -1,
  }

  return {
    activeIndex,
    setActiveIndex,
    containerProps,
    getItemProps,
  }
}

// ============================================
// Focus Management
// ============================================

/**
 * Hook for focus trapping within a container (for modals, dialogs)
 *
 * @param isActive - Whether focus trap is active
 * @returns Ref to attach to the container element
 *
 * @example
 * ```tsx
 * function Modal({ isOpen, onClose }) {
 *   const trapRef = useFocusTrap(isOpen)
 *
 *   return (
 *     <div ref={trapRef} role="dialog" aria-modal="true">
 *       <button>First focusable</button>
 *       <button onClick={onClose}>Close</button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    // Store currently focused element
    previousFocusRef.current = document.activeElement as HTMLElement

    // Find focusable elements
    const focusableSelector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',')

    const container = containerRef.current
    const focusables = container.querySelectorAll<HTMLElement>(focusableSelector)
    const firstFocusable = focusables[0]
    const lastFocusable = focusables[focusables.length - 1]

    // Focus first focusable element
    firstFocusable?.focus()

    // Handle tab key to trap focus
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          e.preventDefault()
          lastFocusable?.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          e.preventDefault()
          firstFocusable?.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
      // Restore focus when trap is deactivated
      previousFocusRef.current?.focus()
    }
  }, [isActive])

  return containerRef
}

/**
 * Hook for managing focus restoration
 *
 * Stores a reference to an element and restores focus when component unmounts.
 *
 * @returns Function to store the current focus target
 *
 * @example
 * ```tsx
 * function Dropdown() {
 *   const restoreFocus = useFocusRestore()
 *
 *   const handleOpen = () => {
 *     restoreFocus() // Store current focus
 *     // Open dropdown...
 *   }
 * }
 * ```
 */
export function useFocusRestore() {
  const focusTargetRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    return () => {
      focusTargetRef.current?.focus()
    }
  }, [])

  return useCallback(() => {
    focusTargetRef.current = document.activeElement as HTMLElement
  }, [])
}

// ============================================
// Reduced Motion
// ============================================

/**
 * Hook to detect user's reduced motion preference
 *
 * @returns Whether the user prefers reduced motion
 *
 * @example
 * ```tsx
 * function AnimatedComponent() {
 *   const prefersReducedMotion = useReducedMotion()
 *
 *   return (
 *     <div
 *       style={{
 *         transition: prefersReducedMotion ? 'none' : 'transform 0.3s'
 *       }}
 *     />
 *   )
 * }
 * ```
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return prefersReducedMotion
}

// ============================================
// Form Accessibility
// ============================================

/**
 * Generates accessible props for form fields
 *
 * @param id - The field ID
 * @param options - Options for hints, errors, and required state
 * @returns Props to spread on the input element
 *
 * @example
 * ```tsx
 * const fieldProps = getFieldProps('email', {
 *   hasError: !!errors.email,
 *   errorId: 'email-error',
 *   hintId: 'email-hint',
 *   required: true,
 * })
 *
 * <input type="email" {...fieldProps} />
 * <p id="email-hint">We'll never share your email</p>
 * {errors.email && <p id="email-error">{errors.email}</p>}
 * ```
 */
export function getFieldProps(
  id: string,
  options: {
    hasError?: boolean
    errorId?: string
    hintId?: string
    required?: boolean
  } = {}
): Record<string, unknown> {
  const { hasError, errorId, hintId, required } = options
  const describedBy: string[] = []

  if (hintId) describedBy.push(hintId)
  if (hasError && errorId) describedBy.push(errorId)

  return {
    id,
    'aria-invalid': hasError || undefined,
    'aria-required': required || undefined,
    ...ariaDescribedBy(describedBy),
  }
}

// ============================================
// Skip Link
// ============================================

/**
 * Props for a skip-to-content link
 *
 * Include at the very beginning of your page for keyboard users
 * to skip navigation and go directly to main content.
 *
 * @example
 * ```tsx
 * // In your layout
 * <a {...skipLinkProps} href="#main-content">
 *   Skip to main content
 * </a>
 * <nav>...</nav>
 * <main id="main-content">...</main>
 * ```
 */
export const skipLinkProps = {
  className: `
    absolute left-0 top-0 z-50
    -translate-y-full focus:translate-y-0
    bg-primary text-primary-foreground
    px-4 py-2 rounded-br
    transition-transform duration-200
  `.trim(),
} as const
