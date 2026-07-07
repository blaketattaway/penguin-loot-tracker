import { useState } from "react";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Group,
  Modal,
  Paper,
  Text,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { IconAlertTriangle, IconSearch } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

import {
  CharacterProfile,
  useLinkCharacterMutation,
  useLookupCharacterMutation,
} from "../../../hooks/endpoints";
import { classColor, factionColor } from "../wow";
import styles from "../characters.module.css";

interface LinkCharacterModalProps {
  player: { id: string; name: string };
  onClose: () => void;
}

const LinkCharacterModal = ({ player, onClose }: LinkCharacterModalProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { mutateAsync: lookupAsync, isPending: isLooking } =
    useLookupCharacterMutation();
  const { mutateAsync: linkAsync, isPending: isLinking } =
    useLinkCharacterMutation();

  const [name, setName] = useState("");
  const [realm, setRealm] = useState("");
  const [preview, setPreview] = useState<CharacterProfile | null>(null);

  // Editing the inputs invalidates a previous lookup — force a re-verify.
  const resetPreview = () => setPreview(null);

  const canSearch = name.trim().length > 0 && realm.trim().length > 0;

  const runLookup = async () => {
    if (!canSearch) return;
    try {
      const result = await lookupAsync({ name: name.trim(), realm: realm.trim() });
      setPreview(result);
    } catch (error) {
      notifications.show({
        title: t("linkChar.errorTitle"),
        message: (error as Error).message,
        color: "red",
      });
    }
  };

  const confirmLink = async () => {
    if (!preview?.found) return;
    try {
      const result = await linkAsync({
        playerId: player.id,
        name: preview.name,
        realm: preview.realm,
      });

      // The API returns 200 with success:false for business rejections
      // (e.g. the character already belongs to another person).
      if (!result.success) {
        notifications.show({
          title: t("linkChar.errorTitle"),
          message: result.message,
          color: "red",
        });
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ["characters"] });
      notifications.show({
        title: t("linkChar.successTitle"),
        message: t("linkChar.successMessage", {
          character: `${preview.name}-${preview.realm}`,
          player: player.name,
        }),
        color: "gold",
      });
      onClose();
    } catch (error) {
      notifications.show({
        title: t("linkChar.errorTitle"),
        message: (error as Error).message,
        color: "red",
      });
    }
  };

  const cls = classColor(preview?.classId);

  return (
    <Modal title={t("linkChar.title")} onClose={onClose} opened={true}>
      <Text size="sm" c="dimmed" mb="md">
        {t("linkChar.description", { player: player.name })}
      </Text>

      <Group align="flex-end" gap="xs" wrap="nowrap">
        <TextInput
          label={t("linkChar.nameLabel")}
          placeholder={t("linkChar.namePlaceholder")}
          value={name}
          data-autofocus
          onChange={(e) => {
            setName(e.currentTarget.value);
            resetPreview();
          }}
          onKeyDown={(e) => e.key === "Enter" && runLookup()}
          style={{ flex: 1 }}
        />
        <TextInput
          label={t("linkChar.realmLabel")}
          placeholder={t("linkChar.realmPlaceholder")}
          value={realm}
          onChange={(e) => {
            setRealm(e.currentTarget.value);
            resetPreview();
          }}
          onKeyDown={(e) => e.key === "Enter" && runLookup()}
          style={{ flex: 1 }}
        />
      </Group>

      <Button
        mt="sm"
        fullWidth
        variant="light"
        leftSection={<IconSearch size={16} />}
        loading={isLooking}
        disabled={!canSearch}
        onClick={runLookup}
      >
        {t("linkChar.search")}
      </Button>

      {preview && !preview.found && (
        <Alert
          mt="md"
          variant="light"
          color="red"
          icon={<IconAlertTriangle size={18} />}
        >
          {preview.message ?? t("linkChar.notFound")}
        </Alert>
      )}

      {preview?.found && (
        <Paper
          mt="md"
          p="md"
          withBorder
          className={styles.preview}
          style={{ borderColor: cls }}
        >
          <Group wrap="nowrap">
            <Avatar src={preview.avatarUrl} size={56} radius="md" />
            <div style={{ minWidth: 0 }}>
              <Text fw={800} style={{ color: cls }}>
                {preview.name}
              </Text>
              <Text size="xs" c="dimmed">
                {preview.realm}
              </Text>
              <Text size="sm" mt={4}>
                {t("characters.level", { level: preview.level })} · {preview.race}{" "}
                {preview.className}
              </Text>
              <Group gap="xs" mt={6}>
                {preview.faction && (
                  <Badge
                    size="sm"
                    variant="filled"
                    style={{ backgroundColor: factionColor(preview.faction) }}
                  >
                    {preview.faction === "HORDE"
                      ? t("characters.horde")
                      : t("characters.alliance")}
                  </Badge>
                )}
                <Text size="xs" c="dimmed">
                  {preview.guild
                    ? `‹${preview.guild}›`
                    : t("characters.noGuild")}
                </Text>
              </Group>
            </div>
          </Group>
        </Paper>
      )}

      <Group gap="xs" justify="right" mt="lg">
        <Button onClick={onClose} variant="default">
          {t("linkChar.cancel")}
        </Button>
        <Button
          onClick={confirmLink}
          loading={isLinking}
          disabled={!preview?.found}
        >
          {t("linkChar.submit")}
        </Button>
      </Group>
    </Modal>
  );
};

export default LinkCharacterModal;
