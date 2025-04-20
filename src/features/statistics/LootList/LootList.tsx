import { List, ThemeIcon, Anchor, Text } from "@mantine/core";
import { IconStar } from "@tabler/icons-react";

import { Item } from "../../../interfaces/player.interface";

interface ItemListProps {
  items: Item[];
  anchor: boolean;
}

const ItemList = ({ items, anchor }: ItemListProps) => {
  return (
    <List
      spacing="xs"
      center
      icon={
        <ThemeIcon color="yellow" size={14} radius="xl">
          <IconStar size={12} />
        </ThemeIcon>
      }
    >
      {items.map((item) => (
        <List.Item key={item.id}>
          {anchor ? (
            <Anchor
              target="_blank"
              href={`https://www.wowhead.com/item=${item.id}`}
              data-wowhead={`item=${item.id}`}
            >
              {item.name}
            </Anchor>
          ) : (
            <Text size="sm">{item.name}</Text>
          )}
        </List.Item>
      ))}
      {items.length === 0 && <Text size="sm">No items looted 🥺</Text>}
    </List>
  );
};

export default ItemList;
