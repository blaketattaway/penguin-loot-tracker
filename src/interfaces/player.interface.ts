export interface Player {
    name: string;
    totalLoot: number;
    lootedItems: Item[];
}

export interface Item {
    id: number;
    main: boolean;
    name: string;
}