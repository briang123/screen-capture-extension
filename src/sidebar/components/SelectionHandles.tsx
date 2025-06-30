import React from 'react';
import { Z_INDEX } from '@/shared/constants';
import { getHandlePositions, HandlePosition } from '@/sidebar/utils/selectionHandlesUtils';

interface SelectionHandlesProps {
  width: number;
  height: number;
  onHandleMouseDown: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, handleKey: string) => void;
}

const HANDLE_LENGTH = 20;
const HANDLE_THICKNESS = 4;
const HANDLE_COLOR = '#fff';
const HANDLE_OFFSET = HANDLE_LENGTH / 2;

const CornerHandle: React.FC<{
  handle: HandlePosition;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, key: string) => void;
}> = ({ handle, onMouseDown }) => {
  let horzStyle = {};
  let vertStyle = {};
  if (handle.corner === 'tl') {
    horzStyle = {
      left: handle.x,
      top: handle.y - HANDLE_THICKNESS / 2,
      width: HANDLE_LENGTH,
      height: HANDLE_THICKNESS,
    };
    vertStyle = {
      left: handle.x - HANDLE_THICKNESS / 2,
      top: handle.y,
      width: HANDLE_THICKNESS,
      height: HANDLE_LENGTH,
    };
  } else if (handle.corner === 'tr') {
    horzStyle = {
      left: handle.x - HANDLE_LENGTH,
      top: handle.y - HANDLE_THICKNESS / 2,
      width: HANDLE_LENGTH,
      height: HANDLE_THICKNESS,
    };
    vertStyle = {
      left: handle.x - HANDLE_THICKNESS / 2,
      top: handle.y,
      width: HANDLE_THICKNESS,
      height: HANDLE_LENGTH,
    };
  } else if (handle.corner === 'bl') {
    horzStyle = {
      left: handle.x,
      top: handle.y - HANDLE_THICKNESS / 2,
      width: HANDLE_LENGTH,
      height: HANDLE_THICKNESS,
    };
    vertStyle = {
      left: handle.x - HANDLE_THICKNESS / 2,
      top: handle.y - HANDLE_LENGTH,
      width: HANDLE_THICKNESS,
      height: HANDLE_LENGTH,
    };
  } else if (handle.corner === 'br') {
    horzStyle = {
      left: handle.x - HANDLE_LENGTH,
      top: handle.y - HANDLE_THICKNESS / 2,
      width: HANDLE_LENGTH,
      height: HANDLE_THICKNESS,
    };
    vertStyle = {
      left: handle.x - HANDLE_THICKNESS / 2,
      top: handle.y - HANDLE_LENGTH,
      width: HANDLE_THICKNESS,
      height: HANDLE_LENGTH,
    };
  }
  return (
    <>
      <div
        data-selection-handle
        style={{
          position: 'absolute',
          background: HANDLE_COLOR,
          borderRadius: HANDLE_THICKNESS,
          cursor: handle.cursor,
          zIndex: Z_INDEX.SELECTION_HANDLE,
          ...horzStyle,
        }}
        onMouseDown={(e) => onMouseDown(e, handle.key)}
      />
      <div
        data-selection-handle
        style={{
          position: 'absolute',
          background: HANDLE_COLOR,
          borderRadius: HANDLE_THICKNESS,
          cursor: handle.cursor,
          zIndex: Z_INDEX.SELECTION_HANDLE,
          ...vertStyle,
        }}
        onMouseDown={(e) => onMouseDown(e, handle.key)}
      />
    </>
  );
};

const SelectionHandles: React.FC<SelectionHandlesProps> = ({
  width,
  height,
  onHandleMouseDown,
}) => {
  const positions = getHandlePositions(width, height);
  return (
    <>
      {positions.map((handle) => {
        if (handle.orientation === 'corner') {
          return <CornerHandle key={handle.key} handle={handle} onMouseDown={onHandleMouseDown} />;
        } else if (handle.orientation === 'horizontal') {
          return (
            <div
              key={handle.key}
              data-selection-handle
              style={{
                position: 'absolute',
                left: handle.x - HANDLE_OFFSET,
                top: handle.y - HANDLE_THICKNESS / 2,
                width: HANDLE_LENGTH,
                height: HANDLE_THICKNESS,
                background: HANDLE_COLOR,
                borderRadius: HANDLE_THICKNESS,
                cursor: handle.cursor,
                zIndex: Z_INDEX.SELECTION_HANDLE,
              }}
              onMouseDown={(e) => onHandleMouseDown(e, handle.key)}
            />
          );
        } else if (handle.orientation === 'vertical') {
          return (
            <div
              key={handle.key}
              data-selection-handle
              style={{
                position: 'absolute',
                left: handle.x - HANDLE_THICKNESS / 2,
                top: handle.y - HANDLE_OFFSET,
                width: HANDLE_THICKNESS,
                height: HANDLE_LENGTH,
                background: HANDLE_COLOR,
                borderRadius: HANDLE_THICKNESS,
                cursor: handle.cursor,
                zIndex: Z_INDEX.SELECTION_HANDLE,
              }}
              onMouseDown={(e) => onHandleMouseDown(e, handle.key)}
            />
          );
        }
        return null;
      })}
    </>
  );
};

export default SelectionHandles;
