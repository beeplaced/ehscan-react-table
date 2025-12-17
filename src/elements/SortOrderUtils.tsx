import { useState } from 'react';

export type SortOrder = {
  tag: string;
  dir: 'asc' | 'desc';
};

/**
 * Returns the initial sort order from localStorage or default.
 */
const getInitialSortOrder = (
  localStorageTag: string | null,
  defaultSortOrder: SortOrder
): SortOrder => {
  if (!localStorageTag) return defaultSortOrder;
  try {
    const savedStorage = JSON.parse(localStorage.getItem(localStorageTag) || '{}');
    if (!savedStorage.tag || !savedStorage.dir) return defaultSortOrder;
    return { tag: savedStorage.tag, dir: savedStorage.dir } as SortOrder;
  } catch (e) {
    console.error('Failed to parse sortOrder from localStorage', e);
    return defaultSortOrder;
  }
}

export const useSortOrder = (localStorageTag: string | null, defaultSortOrder: SortOrder) => {
  const [sortOrder, setSortOrder] = useState<SortOrder>(() => getInitialSortOrder(localStorageTag, defaultSortOrder));
  return [sortOrder, setSortOrder] as const;
}

type Row = { [key: string]: any; id: number };

export const sortRows = (rows: Row[], sortOrder: SortOrder): Row[] => {
  const { tag, dir } = sortOrder;
  if (!tag) return rows;

  return [...rows].sort((a, b) => {
    const valA = a[tag];
    const valB = b[tag];

    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;

    if (typeof valA === 'number' && typeof valB === 'number') {
      return dir === 'asc' ? valA - valB : valB - valA;
    }

    const strA = valA.toString().toLowerCase();
    const strB = valB.toString().toLowerCase();

    if (strA < strB) return dir === 'asc' ? -1 : 1;
    if (strA > strB) return dir === 'asc' ? 1 : -1;
    return 0;
  });
}