import React, { useCallback } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Box } from '@mui/material';
import { ProductCard, ProductCardProps } from './ProductCard';

interface DraggableProductCardProps extends Omit<ProductCardProps, 'isDragging' | 'isDropTarget'> {
  id: string;
}

export const DraggableProductCard: React.FC<DraggableProductCardProps> = ({
  id,
  product,
  isGroupingMode,
  ...props
}) => {
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
    transform
  } = useDraggable({
    id: id,
    disabled: !isGroupingMode,
  });

  const {
    setNodeRef: setDropRef,
    isOver
  } = useDroppable({
    id: `drop-${id}`,
    disabled: !isGroupingMode || isDragging,
  });

  // Combine refs so the card is both draggable and droppable
  const setRefs = useCallback((node: HTMLDivElement | null) => {
    setDragRef(node);
    setDropRef(node);
  }, [setDragRef, setDropRef]);

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 1000 : 'auto',
  } : undefined;

  return (
    <Box
      ref={setRefs}
      style={style}
      {...(isGroupingMode ? { ...listeners, ...attributes } : {})}
      sx={{
        height: '100%',
        touchAction: isGroupingMode ? 'none' : 'auto',
      }}
    >
      <ProductCard
        {...props}
        product={product}
        isGroupingMode={isGroupingMode}
        isDragging={isDragging}
        isDropTarget={isOver && !isDragging}
      />
    </Box>
  );
};
