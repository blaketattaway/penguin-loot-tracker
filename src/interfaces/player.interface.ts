export interface Player {
    name: string;
    lootedItems: Item[];
}

export interface Item {
    id: number;
    main: boolean;
    name: string;
}