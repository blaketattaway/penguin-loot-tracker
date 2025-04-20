type PriorityEntry<T> = { items: T[]; priority: number };

/**
 * Calculates the priority of items based on a provided key function.
 * The items are sorted and grouped by their priority.
 *
 * @param items - Array of items to calculate priority for.
 * @param keyFn - Function to extract the key for sorting and priority calculation.
 * @returns An array of objects containing the items and their corresponding priority.
 */
export const calculatePriority = <T>(
  items: T[],
  keyFn: (item: T) => number
): PriorityEntry<T>[] => {
  const sortedItems = [...items].sort((a, b) => keyFn(a) - keyFn(b));

  return sortedItems.reduce<PriorityEntry<T>[]>((priorityList, item, index, array) => {
    const currentValue = keyFn(item);
    const previousValue = index > 0 ? keyFn(array[index - 1]) : currentValue;
    const priority = index > 0 && currentValue > previousValue
      ? priorityList[priorityList.length - 1].priority + 1
      : priorityList.length > 0
        ? priorityList[priorityList.length - 1].priority
        : 1;

    if (priorityList.length === 0 || priorityList[priorityList.length - 1].priority !== priority) {
      priorityList.push({ items: [item], priority });
    } else {
      priorityList[priorityList.length - 1].items.push(item);
    }

    return priorityList;
  }, []);
};