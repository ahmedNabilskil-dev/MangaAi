// src/types/react-draggable-fix.d.ts

// This declaration helps resolve potential issues with react-draggable types,
// especially when using nodeRef in strict mode with newer React versions.
// If you encounter type errors related to DraggableCore or Draggable's props,
// adjusting this file might be necessary.

declare module 'react-draggable' {
    import * as React from 'react';

    export interface DraggableBounds {
        left?: number;
        right?: number;
        top?: number;
        bottom?: number;
    }

    export interface DraggableProps extends DraggableCoreProps {
        axis: 'both' | 'x' | 'y' | 'none';
        bounds?: DraggableBounds | string | false;
        defaultClassName: string;
        defaultClassNameDragging: string;
        defaultClassNameDragged: string;
        defaultPosition: ControlPosition;
        positionOffset?: PositionOffsetControlPosition;
        position?: ControlPosition;
        scale: number;
    }

    export type DraggableEventHandler = (
        e: MouseEvent | TouchEvent,
        data: DraggableData
    ) => void | false;

    export interface DraggableData {
        node: HTMLElement;
        x: number;
        y: number;
        deltaX: number;
        deltaY: number;
        lastX: number;
        lastY: number;
    }

    export interface DraggableCoreProps {
        allowAnyClick: boolean;
        cancel: string;
        disabled: boolean;
        enableUserSelectHack: boolean;
        offsetParent: HTMLElement;
        grid?: [number, number];
        handle: string;
        nodeRef?: React.RefObject<HTMLElement>; // Ensure nodeRef is part of the props
        onStart: DraggableEventHandler;
        onDrag: DraggableEventHandler;
        onStop: DraggableEventHandler;
        onMouseDown: (e: MouseEvent) => void;
    }

    export interface ControlPosition {
        x: number;
        y: number;
    }
    export interface PositionOffsetControlPosition {
        x: number | string;
        y: number | string;
    }

    // Ensure the default export has the correct type including nodeRef
    export default class Draggable extends React.Component<Partial<DraggableProps>> {}
    export class DraggableCore extends React.Component<Partial<DraggableCoreProps>> {}
}
