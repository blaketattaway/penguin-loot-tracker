type PriorityEntry<T> = { items: T[]; priority: number };

/**
 * Wowhead's power tooltip (loaded in index.html) is localized independently of
 * our app: it reads the `domain` param on the `data-wowhead` attribute and the
 * link's subdomain. Map our UI language to Wowhead's locale domain — `es` for
 * Spanish, `www` (English retail) otherwise. Note Wowhead's Spanish is a single
 * variant, so wording can differ slightly from Blizzard's es_MX item names.
 */
export const wowheadDomain = (lng?: string): "es" | "www" =>
  lng?.toLowerCase().startsWith("es") ? "es" : "www";

/** Builds the `data-wowhead` attribute value with the locale domain. */
export const wowheadData = (itemId: number, lng?: string): string =>
  `item=${itemId}&domain=${wowheadDomain(lng)}`;

/** Builds a locale-aware Wowhead item URL. */
export const wowheadUrl = (itemId: number, lng?: string): string =>
  `https://${wowheadDomain(lng)}.wowhead.com/item=${itemId}`;

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