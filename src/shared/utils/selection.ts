import type { SelectionRect } from '@/sidebar/hooks/useAreaCapture';

export function isSelectionComplete(
  selection: SelectionRect | null | undefined,
  isSelecting: boolean
): boolean {
  if (!selection) return false;
  if (isSelecting) return false;
  if (selection.width > 0 && selection.height > 0) return true;
  return false;
}
