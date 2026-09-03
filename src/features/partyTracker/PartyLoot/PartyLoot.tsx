import {
  Anchor,
  Badge,
  Group,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconCrown, IconGift, IconPaw } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

import { PartyAttendee } from "../../../hooks/endpoints";
import { wowheadData, wowheadUrl } from "../../../utils";

interface PartyLootProps {
  attendees: PartyAttendee[];
}

/**
 * The party raffle: who came, and which TCG pet they drew.
 *
 * Presented in the same visual language as raid loot — Wowhead-linked item
 * names, one row per person — but it is a separate record end to end. Party
 * pets are stored in their own table and never reach the assignment endpoint,
 * because letting a raffle prize count as looted would quietly skew the
 * priority ranking the guild uses to settle real loot.
 */
const PartyLoot = ({ attendees }: PartyLootProps) => {
  const { t, i18n } = useTranslation();
  const lng = i18n.resolvedLanguage;

  if (attendees.length === 0) return null;

  // A pet counts whether or not we could tie it to a Blizzard item: some raffle prizes are
  // known by the companion's name, and the item that teaches it is called something else.
  const withPets = attendees.filter(
    (attendee) => attendee.petItemId || attendee.petName
  );

  const renderPet = (attendee: PartyAttendee) => {
    if (attendee.isOrganizer)
      return (
        <Group gap={6} wrap="nowrap">
          <Tooltip label={t("party.loot.organizerTooltip")} withArrow>
            <ThemeIcon variant="light" color="gold" size="sm" radius="xl">
              <IconGift size={13} stroke={1.8} />
            </ThemeIcon>
          </Tooltip>
          <Text size="sm" c="dimmed">
            {t("party.loot.organizerPet")}
          </Text>
        </Group>
      );

    // Named but not linked: the prize is known by the companion's name, and Blizzard's item
    // index has no item by that name (the loot card that teaches it is titled differently).
    // Showing the name as plain text is right — far better than claiming they got nothing,
    // and honest about there being no item to link to.
    if (!attendee.petItemId)
      return attendee.petName ? (
        <Text size="sm">{attendee.petName}</Text>
      ) : (
        <Text size="sm" c="dimmed">
          {t("party.loot.noPet")}
        </Text>
      );

    return (
      <Anchor
        // Re-keying on the language makes Wowhead's tooltip script re-read the
        // locale domain, the same trick the raid loot tables use.
        key={lng}
        data-wowhead={wowheadData(attendee.petItemId, lng)}
        href={wowheadUrl(attendee.petItemId, lng)}
        target="_blank"
        size="sm"
      >
        {attendee.petName ?? `#${attendee.petItemId}`}
      </Anchor>
    );
  };

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-end" wrap="wrap">
        <Stack gap={2}>
          <Title order={3} fw={800} fz={22}>
            {t("party.loot.title")}
          </Title>
          <Text size="sm" c="dimmed">
            {t("party.loot.subtitle")}
          </Text>
        </Stack>

        <Group gap="xs">
          <Badge variant="light" color="arcane" radius="sm">
            {t("party.loot.attendeeCount", { count: attendees.length })}
          </Badge>
          <Badge variant="light" color="gold" radius="sm">
            {t("party.loot.petCount", { count: withPets.length })}
          </Badge>
        </Group>
      </Group>

      {/* The tracker's whole point is a trustworthy record; say plainly that
          this one is kept apart from it. */}
      <Text size="xs" c="dimmed">
        {t("party.loot.disclaimer")}
      </Text>

      <Table.ScrollContainer minWidth={380}>
        <Table striped highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t("party.loot.attendee")}</Table.Th>
              <Table.Th>{t("party.loot.pet")}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {attendees.map((attendee) => (
              <Table.Tr key={attendee.name}>
                <Table.Td>
                  <Group gap={6} wrap="nowrap">
                    {attendee.isOrganizer ? (
                      <Tooltip label={t("party.loot.organizerTooltip")} withArrow>
                        <ThemeIcon variant="light" color="gold" size="sm" radius="xl">
                          <IconCrown size={13} stroke={1.8} />
                        </ThemeIcon>
                      </Tooltip>
                    ) : (
                      <ThemeIcon variant="light" color="arcane" size="sm" radius="xl">
                        <IconPaw size={13} stroke={1.8} />
                      </ThemeIcon>
                    )}
                    <Text size="sm" fw={attendee.isOrganizer ? 700 : 500}>
                      {attendee.name}
                    </Text>
                  </Group>
                </Table.Td>
                <Table.Td>{renderPet(attendee)}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Stack>
  );
};

export default PartyLoot;
