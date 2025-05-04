// src/types/react-flow-fix.d.ts
/**
 * Temporary fix for React Flow v11 compatibility issues with React 18 types.
 * See: https://github.com/wbkd/react-flow/issues/3815
 * Remove this file once React Flow releases a version fully compatible with React 19 / future React versions if applicable.
 */
declare namespace React {
    interface DOMAttributes<T> {
      onResize?: ReactEventHandler<T> | undefined;
      onResizeCapture?: ReactEventHandler<T> | undefined;
      nonce?: string | undefined;
    }
}
