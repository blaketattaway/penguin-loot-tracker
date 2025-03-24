export interface Player {
    id?: string;
    name: string;
    lootedItems: Item[];
}

export interface Item {
    tableId: string;
    id: number;
    name: string;
    assignDate?: Date;
    assignedBy?: string;
}

export interface PriorityEntry {
    players: string[];
    priority: number;
}

export interface AssignedItem{
    player: Player;
    item: Item;
}