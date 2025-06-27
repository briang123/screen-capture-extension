import { useState } from 'react';

export function useSidebarCollapse(initialCollapsed = false): [boolean, () => void] {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const handleToggleCollapse = () => setCollapsed((prev) => !prev);
  return [collapsed, handleToggleCollapse];
}
