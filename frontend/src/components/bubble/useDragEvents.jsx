import { useCallback, useRef } from "react";

const useDragEvents = ({ onDragMove }) => {
  const isDragging = useRef(false);

  const onPointerDown = useCallback(
    ({ target: el, pointerId, clientX, clientY }) => {
      el.setPointerCapture(pointerId);
      isDragging.current = { pointerId, clientX, clientY };
    },
    []
  );

  const onPointerUp = useCallback(({ target: el, pointerId }) => {
    isDragging.current = false;
    el.releasePointerCapture(pointerId);
  }, []);

  const onPointerMove = useCallback(
    ({ target: el, pointerId, clientX, clientY }) => {
      const { pointerId: pId, clientX: sx, clientY: sy } = isDragging.current;
      if (pId === pointerId) {
        onDragMove && onDragMove({ dx: clientX - sx, dy: clientY - sy });
        isDragging.current = { pointerId, clientX, clientY };
      }
    },
    [onDragMove]
  );

  return {
    isDragging,
    onPointerDown,
    onPointerUp,
    onPointerMove,
  };
};
export default useDragEvents;
