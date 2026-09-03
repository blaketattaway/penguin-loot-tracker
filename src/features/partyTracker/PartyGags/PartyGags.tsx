import { useState } from "react";
import {
  Card,
  FileButton,
  Group,
  Image,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconPhotoUp } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { PartyGag, useUploadGagIconMutation } from "../../../hooks/endpoints";
import useAuth from "../../../hooks/useAuth";

import styles from "../party.module.css";

interface PartyGagsProps {
  year: number;
  gags: PartyGag[];
}

/**
 * The year's running jokes, one card each.
 *
 * The icon carries the joke and the text is the punchline, so the icon gets a
 * little more life on hover than its card does — it is the thing being pointed
 * at. Officers can swap an icon in place; everyone else just reads.
 */
const PartyGags = ({ year, gags }: PartyGagsProps) => {
  const { t } = useTranslation();
  const { isValid: isOfficer } = useAuth();
  const queryClient = useQueryClient();
  const { mutateAsync: uploadIconAsync } = useUploadGagIconMutation();

  const [uploadingId, setUploadingId] = useState<string | null>(null);

  if (gags.length === 0) return null;

  const handleIcon = async (gagId: string, file: File | null) => {
    if (!file) return;

    setUploadingId(gagId);

    try {
      await uploadIconAsync({ year, gagId, file });
      await queryClient.invalidateQueries({ queryKey: ["parties"] });
      notifications.show({
        title: t("party.gags.iconSetTitle"),
        message: t("party.gags.iconSetMessage"),
        color: "gold",
      });
    } catch {
      notifications.show({
        title: t("party.gags.iconFailedTitle"),
        message: t("party.gags.iconFailedMessage"),
        color: "red",
      });
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <Stack gap="md">
      <Stack gap={2}>
        <Title order={3} fw={800} fz={22}>
          {t("party.gags.title")}
        </Title>
        <Text size="sm" c="dimmed">
          {t("party.gags.subtitle")}
        </Text>
      </Stack>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {gags.map((gag) => (
          <Card key={gag.id} className={styles.gag} padding="lg">
            <Group gap="md" align="flex-start" wrap="nowrap">
              <div className={styles.gagIcon} style={{ flexShrink: 0 }}>
                {gag.iconUrl ? (
                  <Image
                    src={gag.iconUrl}
                    alt=""
                    w={56}
                    h={56}
                    radius="md"
                    fit="cover"
                  />
                ) : (
                  <Text fz={40} lh={1} aria-hidden>
                    {gag.emoji ?? "🐧"}
                  </Text>
                )}
              </div>

              <Stack gap={4}>
                <Text fw={800} lh={1.2}>
                  {gag.title}
                </Text>
                <Text size="sm" c="dimmed" lh={1.45}>
                  {gag.body}
                </Text>
              </Stack>
            </Group>

            {isOfficer && (
              <FileButton
                accept="image/png,image/jpeg,image/webp"
                onChange={(file) => handleIcon(gag.id, file)}
              >
                {(props) => (
                  <Tooltip label={t("party.gags.setIcon")} withArrow>
                    <UnstyledButton
                      {...props}
                      mt="sm"
                      c="dimmed"
                      aria-label={t("party.gags.setIcon")}
                      data-loading={uploadingId === gag.id}
                    >
                      <Group gap={6}>
                        <IconPhotoUp size={14} stroke={1.8} />
                        <Text size="xs">
                          {uploadingId === gag.id
                            ? t("party.gags.uploading")
                            : t("party.gags.setIcon")}
                        </Text>
                      </Group>
                    </UnstyledButton>
                  </Tooltip>
                )}
              </FileButton>
            )}
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
};

export default PartyGags;
