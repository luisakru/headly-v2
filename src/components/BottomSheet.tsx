import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '../i18n/context';
import styles from './BottomSheet.module.css';

const CLOSE_DRAG_DISTANCE = 80;

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  const { t } = useI18n();
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const wasDragged = useRef(false);
  const [dragOffset, setDragOffset] = useState(0);

  useEffect(() => {
    if (!open) return;
    sheetRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open, onClose]);

  if (!open) return null;

  const startDrag = (event: PointerEvent) => {
    dragStartY.current = event.clientY;
    wasDragged.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: PointerEvent) => {
    if (dragStartY.current === null) return;
    const offset = Math.max(0, event.clientY - dragStartY.current);
    if (offset > 4) wasDragged.current = true;
    setDragOffset(offset);
  };

  const endDrag = () => {
    if (dragStartY.current === null) return;
    dragStartY.current = null;
    setDragOffset(0);
    if (dragOffset > CLOSE_DRAG_DISTANCE) onClose();
  };

  return createPortal(
    <div className={styles.backdrop} onClick={onClose}>
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={styles.sheet}
        style={dragOffset ? { transform: `translateY(${dragOffset}px)` } : undefined}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={styles.dragArea}
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <button
            type="button"
            className={styles.handle}
            aria-label={t.common.close}
            // A drag that ends on the handle also fires a click; only a plain tap closes.
            onClick={() => !wasDragged.current && onClose()}
          />
          {title && <h2 className={styles.title}>{title}</h2>}
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
