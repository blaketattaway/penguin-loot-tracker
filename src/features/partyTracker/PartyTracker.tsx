import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Button,
  Center,
  Container,
  Group,
  Loader,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconConfetti,
  IconLock,
  IconMapPin,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

import { ApiError, toBlizzardLocale, useGetPartiesQuery } from "../../hooks/endpoints";
import usePartyAccess, { usePartyVisibility } from "../../hooks/usePartyAccess";

import PartyEdition from "./PartyEdition/PartyEdition";
import PartyGate from "./PartyGate/PartyGate";
import PartyMap from "./PartyMap/PartyMap";

/**
 * Penguin Party Tracker — the guild's yearly party, one section per edition.
 *
 * The selected year lives in the url (/party/2026) so a pin click is a real
 * navigation: back goes back, and a link sent in guild chat opens the right
 * year.
 *
 * Anyone without access gets the gate instead. "Access" means the guild code
 * or an officer session — the same pair the API's PartyAccess policy takes, so
 * an officer is never asked for a code the backend would have waived.
 */
const PartyTracker = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { year: yearParam } = useParams();
  const { lock } = usePartyAccess();
  const { canView, hasCode } = usePartyVisibility();

  const locale = toBlizzardLocale(i18n.resolvedLanguage);
  const {
    data: parties,
    isLoading,
    isError,
    error,
  } = useGetPartiesQuery(canView, locale);

  // Only a 401 means the code is the problem. Anything else (the API down, a
  // 500, a bad deploy) gets reported as what it is — telling someone to
  // re-enter a perfectly good code sends them to fix the wrong thing.
  const status = error instanceof ApiError ? error.status : null;

  const selectedYear = yearParam ? Number(yearParam) : null;

  // Default to the most recent party that actually happened. An announced-but-
  // not-yet-held edition sorts first by year, and landing on its empty album
  // would be a worse first impression than the night everyone remembers.
  const selected =
    parties?.find((party) => party.year === selectedYear) ??
    parties?.find((party) => !party.isUpcoming) ??
    parties?.[0];

  // Land on the newest edition rather than an empty page, and keep the url
  // honest about what's on screen.
  useEffect(() => {
    if (!parties?.length) return;
    if (selected && selected.year !== selectedYear)
      navigate(`/party/${selected.year}`, { replace: true });
  }, [parties, selected, selectedYear, navigate]);

  if (!canView) return <PartyGate />;

  return (
    <Container size="lg" py={{ base: "md", md: "xl" }}>
      <Stack gap="xl" className="plt-enter">
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <Stack gap="xs">
            <Group gap={6} c="gold.4">
              <IconConfetti size={16} stroke={2} />
              <Text
                fw={800}
                tt="uppercase"
                fz="xs"
                style={{ letterSpacing: "0.14em" }}
              >
                {t("party.eyebrow")}
              </Text>
            </Group>
            <Title order={1} fw={800} fz={{ base: 30, sm: 40 }} lh={1.1}>
              {t("party.title")}
            </Title>
            <Text c="dimmed" maw="56ch">
              {t("party.subtitle")}
            </Text>
          </Stack>

          {/* Only offered when this browser holds a party token. An officer
              seeing the section through their login has nothing to lock. */}
          {hasCode && (
            <Button
              variant="subtle"
              color="gray"
              size="compact-sm"
              leftSection={<IconLock size={14} stroke={1.8} />}
              onClick={lock}
            >
              {t("party.lock")}
            </Button>
          )}
        </Group>

        {isLoading && (
          <Center py={64}>
            <Loader color="gold" />
          </Center>
        )}

        {isError && (
          <Alert
            color="red"
            variant="light"
            icon={<IconAlertTriangle size={18} />}
            title={t("party.errorTitle")}
          >
            <Stack gap="sm" align="flex-start">
              <Text size="sm">
                {status === 401
                  ? t("party.errorExpired")
                  : status
                  ? t("party.errorServer", { status })
                  : t("party.errorNetwork")}
              </Text>

              {/* A 401 is the one case the reader can fix themselves. */}
              {status === 401 && hasCode && (
                <Button size="compact-sm" variant="light" onClick={lock}>
                  {t("party.errorReenter")}
                </Button>
              )}
            </Stack>
          </Alert>
        )}

        {!isLoading && !isError && !parties?.length && (
          <Stack align="center" gap="xs" py={64}>
            <ThemeIcon variant="light" color="gold" size={52} radius="xl">
              <IconMapPin size={26} stroke={1.5} />
            </ThemeIcon>
            <Text fw={700}>{t("party.emptyTitle")}</Text>
            <Text size="sm" c="dimmed" ta="center" maw="44ch">
              {t("party.emptyBody")}
            </Text>
          </Stack>
        )}

        {!!parties?.length && (
          <>
            <PartyMap
              parties={parties}
              selectedYear={selected?.year ?? null}
              onSelect={(year) => navigate(`/party/${year}`)}
            />

            {/* The years double as the keyboard path into the map: everything a
                pin does is reachable here too. */}
            {parties.length > 1 && (
              <Group gap="xs" wrap="wrap" role="tablist" aria-label={t("party.editions")}>
                {parties.map((party) => (
                  <Button
                    key={party.year}
                    role="tab"
                    aria-selected={party.year === selected?.year}
                    size="sm"
                    radius="xl"
                    variant={party.year === selected?.year ? "filled" : "default"}
                    onClick={() => navigate(`/party/${party.year}`)}
                  >
                    {party.year}
                  </Button>
                ))}
              </Group>
            )}

            {selected && <PartyEdition party={selected} unlocked={canView} />}
          </>
        )}
      </Stack>
    </Container>
  );
};

export default PartyTracker;
