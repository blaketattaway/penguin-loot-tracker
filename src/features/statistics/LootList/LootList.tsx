import { List, ThemeIcon, Anchor, Text } from "@mantine/core";
import { IconStar } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { Item } from "../../../hooks/endpoints";
import { wowheadData, wowheadUrl } from "../../../utils";


interface ItemListProps {
  items: Item[];
  anchor: boolean;
}

const ItemList = ({ items, anchor }: ItemListProps) => {
  const { t, i18n } = useTranslation();
  const lng = i18n.resolvedLanguage;
  const uniqueItems = Array.from(new Set(items.map(item => item.id))).map(id => {
    return items.find(item => item.id === id)!;
  });

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
      {uniqueItems.map((item) => (
        <List.Item key={item.id}>
          {anchor ? (
            <Anchor
              key={lng}
              target="_blank"
              href={wowheadUrl(item.id, lng)}
              data-wowhead={wowheadData(item.id, lng)}
            >
              {item.name}
            </Anchor>
          ) : (
            <Text size="sm">{item.name}</Text>
          )}
        </List.Item>
      ))}
      {items.length === 0 && (
        <Text size="sm" c="dimmed">
          {t("lootList.empty")}
        </Text>
      )}
    </List>
  );
};

export default ItemList;
