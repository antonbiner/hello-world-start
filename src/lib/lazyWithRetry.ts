import { lazy, type ComponentType } from 'react';

/**
 * Chunk error detection helper
 */
function isChunkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes('failed to fetch dynamically imported module') ||
    msg.includes('loading chunk') ||
    msg.includes('error loading') ||
    error.name === 'ChunkLoadError'
  );
}

/**
 * React.lazy wrapper with retry + cache-bust on chunk load failure.
 * Prevents infinite reload loops via sessionStorage flag.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return lazy(() =>
    factory().catch((err) => {
      if (!isChunkError(err)) throw err;

      // Retry once with cache-bust
      return factory()
        .catch((retryErr) => {
          if (!isChunkError(retryErr)) throw retryErr;

          // Check if we already tried reloading
          const key = 'chunk-retry-reload';
          if (!sessionStorage.getItem(key)) {
            sessionStorage.setItem(key, '1');
            window.location.reload();
            // Return a never-resolving promise to prevent rendering during reload
            return new Promise<never>(() => {});
          }

          // Already reloaded once — clear flag and throw
          sessionStorage.removeItem(key);
          throw retryErr;
        });
    })
  );
}

/**
 * Variant for named exports (used by blockRegistry pattern).
 * Wraps a loader that returns a module with named exports.
 */
export function lazyBlockWithRetry(
  loader: () => Promise<Record<string, ComponentType<any>>>,
  exportName: string
): React.LazyExoticComponent<ComponentType<any>> {
  const factory = () =>
    loader().then((mod) => ({ default: mod[exportName] as ComponentType<any> }));

  return lazy(() =>
    factory().catch((err) => {
      if (!isChunkError(err)) throw err;

      return factory().catch((retryErr) => {
        if (!isChunkError(retryErr)) throw retryErr;

        const key = 'chunk-retry-reload';
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, '1');
          window.location.reload();
          return new Promise<never>(() => {});
        }
        sessionStorage.removeItem(key);
        throw retryErr;
      });
    })
  );
}
