import { Badge, Divider, Group, Stack, Text, Title } from "@mantine/core";
import { IconCalendar, IconMapPin } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

import { Party } from "../../../hooks/endpoints";

import PartyGags from "../PartyGags/PartyGags";
import PartyGallery from "../PartyGallery/PartyGallery";
import PartyLoot from "../PartyLoot/PartyLoot";

interface PartyEditionProps {
  party: Party;
  unlocked: boolean;
}

/** Everything about one edition, in the order the story is told. */
const PartyEdition = ({ party, unlocked }: PartyEditionProps) => {
  const { t, i18n } = useTranslation();

  const heldOn = party.heldOn
    ? new Date(party.heldOn).toLocaleDateString(i18n.resolvedLanguage, {
        day: "numeric",
        month: "long",
        year: "numeric",
        // The stored value is a calendar date at midnight UTC. Formatting it in
        // the reader's zone would shift it a day back for anyone west of UTC —
        // which is everyone here — so read it back in the zone it was written.
        timeZone: "UTC",
      })
    : null;

  return (
    <Stack gap="xl">
      <Stack gap="xs">
        <Group gap="sm" align="center" wrap="wrap">
          <Title order={2} fw={800} fz={{ base: 26, sm: 32 }} lh={1.15}>
            {party.title || t("party.edition.fallbackTitle", { year: party.year })}
          </Title>
          {party.isUpcoming && (
            <Badge variant="light" color="gold" radius="sm">
              {t("party.edition.upcoming")}
            </Badge>
          )}
        </Group>

        <Group gap="lg" wrap="wrap" c="dimmed">
          <Group gap={6} wrap="nowrap">
            <IconMapPin size={16} stroke={1.6} />
            <Text size="sm">
              {[party.venue, party.city, party.country]
                .filter(Boolean)
                .join(", ")}
            </Text>
          </Group>

          {heldOn && (
            <Group gap={6} wrap="nowrap">
              <IconCalendar size={16} stroke={1.6} />
              <Text size="sm">{heldOn}</Text>
            </Group>
          )}
        </Group>
      </Stack>

      {party.gags.length > 0 && (
        <>
          <Divider />
          <PartyGags year={party.year} gags={party.gags} />
        </>
      )}

      <Divider />
      <PartyLoot attendees={party.attendees} />

      <Divider />
      <PartyGallery year={party.year} unlocked={unlocked} />
    </Stack>
  );
};

export default PartyEdition;
