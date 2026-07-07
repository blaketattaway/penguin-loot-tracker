import { CSSProperties, ReactNode, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Center,
  CloseButton,
  Group,
  HoverCard,
  LoadingOverlay,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconInfoCircle,
  IconSearch,
  IconSearchOff,
  IconUserPlus,
  IconUsers,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

import useAuth from "../../hooks/useAuth";
import {
  GuildCharacter,
  useGetCharactersQuery,
  useGetPlayersQuery,
} from "../../hooks/endpoints";
import LoginModal from "../app/LoginModal/LoginModal";
import LinkCharacterModal from "./LinkCharacterModal/LinkCharacterModal";
import { classColor, factionColor } from "./wow";
import styles from "./characters.module.css";

const EmptyState = ({
  icon,
  title,
  hint,
}: {
  icon: ReactNode;
  title: string;
  hint: string;
}) => (
  <Center py={48}>
    <Stack align="center" gap="xs">
      <ThemeIcon variant="light" color="gray" size={56} radius="xl">
        {icon}
      </ThemeIcon>
      <Text fw={700}>{title}</Text>
      <Text c="dimmed" size="sm" ta="center" maw={360}>
        {hint}
      </Text>
    </Stack>
  </Center>
);

// A character shown in the roster: avatar + name in class color, with an armory-style
// hover card (level, race, class, faction). Degrades gracefully for legacy links
// that predate Blizzard validation (no class/avatar snapshot).
const CharacterChip = ({ c }: { c: GuildCharacter }) => {
  const { t } = useTranslation();
  const cls = classColor(c.classId);

  return (
    <HoverCard
      width={260}
      shadow="md"
      openDelay={120}
      closeDelay={80}
      position="top"
      withArrow
    >
      <HoverCard.Target>
        <Badge
          variant="default"
          radius="sm"
          size="lg"
          tt="none"
          fw={600}
          className={styles.chip}
          style={{ ["--class-color"]: cls } as CSSProperties}
          leftSection={<Avatar src={c.avatarUrl} size={18} radius="xl" />}
        >
          <span style={{ color: cls }}>{c.name}</span>
          <Text component="span" c="dimmed" fw={400}>
            {" · "}
            {c.realm}
          </Text>
        </Badge>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <Group wrap="nowrap">
          <Avatar src={c.avatarUrl} size={48} radius="md" />
          <div style={{ minWidth: 0 }}>
            <Text fw={800} style={{ color: cls }}>
              {c.name}
            </Text>
            <Text size="xs" c="dimmed">
              {c.realm}
            </Text>
          </div>
        </Group>
        {(c.level > 0 || c.className) && (
          <Text size="sm" mt="xs">
            {c.level > 0 ? t("characters.level", { level: c.level }) : ""}
            {c.level > 0 && (c.race || c.className) ? " · " : ""}
            {c.race} {c.className}
          </Text>
        )}
        {c.faction && (
          <Badge
            mt="xs"
            size="sm"
            variant="filled"
            style={{ backgroundColor: factionColor(c.faction) }}
          >
            {c.faction === "HORDE"
              ? t("characters.horde")
              : t("characters.alliance")}
          </Badge>
        )}
      </HoverCard.Dropdown>
    </HoverCard>
  );
};

const CharacterLinker = () => {
  const { t } = useTranslation();
  const { isValid } = useAuth();
  const { data: players = [], isLoading: playersLoading } =
    useGetPlayersQuery();
  const { data: characters = [], isLoading: charsLoading } =
    useGetCharactersQuery();
  const [filter, setFilter] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isLoginOpen, { open: openLogin, close: closeLogin }] =
    useDisclosure(false);

  // Group linked characters by the person they belong to.
  const charsByPlayer = useMemo(() => {
    const map = new Map<string, GuildCharacter[]>();
    for (const c of characters) {
      if (!c.playerId) continue;
      const list = map.get(c.playerId) ?? [];
      list.push(c);
      map.set(c.playerId, list);
    }
    return map;
  }, [characters]);

  const filtered = filter
    ? players.filter((p) =>
        p.name.toLowerCase().includes(filter.trim().toLowerCase())
      )
    : players;

  // How many people already have at least one character linked — makes the
  // "how much is left to populate" state visible during the one-time setup.
  const linkedCount = useMemo(
    () =>
      players.filter(
        (p) => p.id && (charsByPlayer.get(p.id)?.length ?? 0) > 0
      ).length,
    [players, charsByPlayer]
  );

  const isLoading = playersLoading || charsLoading;

  return (
    <>
      {isLoginOpen && <LoginModal onClose={closeLogin} />}
      {selectedPlayer && (
        <LinkCharacterModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}

      <Stack gap="lg" className="plt-enter">
        <div>
          <Title order={2}>{t("characters.title")}</Title>
          <Text c="dimmed" size="sm">
            {t("characters.subtitle")}
          </Text>
          {!isLoading && players.length > 0 && (
            <Text c="dimmed" size="xs" mt={4}>
              {t("characters.progress", {
                linked: linkedCount,
                total: players.length,
              })}
            </Text>
          )}
        </div>

        {!isValid && (
          <Alert
            variant="light"
            color="gold"
            icon={<IconInfoCircle size={18} />}
          >
            <Group justify="space-between" wrap="nowrap" gap="md">
              <Text size="sm">{t("characters.loginHint")}</Text>
              <Button
                variant="light"
                size="xs"
                onClick={openLogin}
                style={{ flexShrink: 0 }}
              >
                {t("characters.login")}
              </Button>
            </Group>
          </Alert>
        )}

        <TextInput
          value={filter}
          onChange={(e) => setFilter(e.currentTarget.value)}
          placeholder={t("characters.searchPlaceholder")}
          aria-label={t("characters.searchPlaceholder")}
          leftSection={<IconSearch size={16} />}
          rightSection={
            filter ? (
              <CloseButton
                size="sm"
                aria-label={t("characters.clearSearch")}
                onClick={() => setFilter("")}
              />
            ) : null
          }
          maw={360}
        />

        <Box pos="relative" mih={160}>
          <LoadingOverlay
            visible={isLoading}
            overlayProps={{ blur: 2 }}
            loaderProps={{ color: "gold", type: "bars" }}
          />

          {!isLoading && players.length === 0 && (
            <EmptyState
              icon={<IconUsers size={30} />}
              title={t("characters.emptyTitle")}
              hint={t("characters.emptyMessage")}
            />
          )}

          {!isLoading && players.length > 0 && filtered.length === 0 && (
            <EmptyState
              icon={<IconSearchOff size={30} />}
              title={t("characters.noMatchTitle")}
              hint={t("characters.noMatchHint", { filter })}
            />
          )}

          <Stack gap="sm">
            {filtered.map((player) => {
              const chars = player.id
                ? charsByPlayer.get(player.id) ?? []
                : [];
              return (
                <Card key={player.id}>
                  <Group justify="space-between" wrap="nowrap" align="flex-start">
                    <div style={{ minWidth: 0 }}>
                      <Group gap="xs" align="baseline">
                        <Text fw={700}>{player.name}</Text>
                        <Text size="xs" c="dimmed">
                          {t("characters.charCount", { count: chars.length })}
                        </Text>
                      </Group>

                      <Group gap={6} mt="xs">
                        {chars.length === 0 ? (
                          <Text size="sm" c="dimmed">
                            {t("characters.noCharacters")}
                          </Text>
                        ) : (
                          chars.map((c) => (
                            <CharacterChip key={`${c.name}-${c.realm}`} c={c} />
                          ))
                        )}
                      </Group>
                    </div>

                    {isValid && player.id && (
                      <Button
                        variant="light"
                        size="xs"
                        leftSection={<IconUserPlus size={16} />}
                        style={{ flexShrink: 0 }}
                        onClick={() =>
                          setSelectedPlayer({ id: player.id!, name: player.name })
                        }
                      >
                        {t("characters.addCharacter")}
                      </Button>
                    )}
                  </Group>
                </Card>
              );
            })}
          </Stack>
        </Box>
      </Stack>
    </>
  );
};

export default CharacterLinker;
