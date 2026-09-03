import { useState } from "react";
import {
  ActionIcon,
  Button,
  Center,
  Group,
  Loader,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconPhoto, IconTrash } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import {
  useDeletePartyPhotoMutation,
  useGetPartyPhotosQuery,
} from "../../../hooks/endpoints";
import useAuth from "../../../hooks/useAuth";

import Lightbox from "./Lightbox";
import PhotoUploader from "./PhotoUploader";

import styles from "../party.module.css";

interface PartyGalleryProps {
  year: number;
  unlocked: boolean;
}

/**
 * The album for one edition.
 *
 * Every url here is a short-lived SAS link into a private container, minted for
 * this request only — so the grid is genuinely behind the code, not merely
 * hidden by it.
 */
const PartyGallery = ({ year, unlocked }: PartyGalleryProps) => {
  const { t } = useTranslation();
  const { isValid: isOfficer } = useAuth();
  const queryClient = useQueryClient();

  const { data: photos, isLoading } = useGetPartyPhotosQuery(year, unlocked);
  const { mutateAsync: deleteAsync } = useDeletePartyPhotoMutation();

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});

  // Deleting a photo drops the blob for good — there's no undo to fall back on,
  // so the confirm step is the safety net.
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!pendingDelete) return;

    setIsDeleting(true);

    try {
      await deleteAsync({ year, photoId: pendingDelete });
      await queryClient.invalidateQueries({ queryKey: ["partyPhotos", year] });
      await queryClient.invalidateQueries({ queryKey: ["parties"] });
      notifications.show({
        title: t("party.gallery.deletedTitle"),
        message: t("party.gallery.deletedMessage"),
        color: "gold",
      });
      setPendingDelete(null);
    } catch {
      notifications.show({
        title: t("party.gallery.deleteFailedTitle"),
        message: t("party.gallery.deleteFailedMessage"),
        color: "red",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-end" wrap="wrap">
        <Stack gap={2}>
          <Title order={3} fw={800} fz={22}>
            {t("party.gallery.title")}
          </Title>
          <Text size="sm" c="dimmed">
            {photos?.length
              ? t("party.gallery.count", { count: photos.length })
              : t("party.gallery.subtitle")}
          </Text>
        </Stack>

        {isOfficer && <PhotoUploader year={year} />}
      </Group>

      {isLoading && (
        <Center py="xl">
          <Loader color="gold" size="sm" />
        </Center>
      )}

      {!isLoading && !photos?.length && (
        <Stack align="center" gap="xs" py={48}>
          <ThemeIcon variant="light" color="gold" size={48} radius="xl">
            <IconPhoto size={24} stroke={1.5} />
          </ThemeIcon>
          <Text fw={700}>{t("party.gallery.emptyTitle")}</Text>
          <Text size="sm" c="dimmed" ta="center" maw="40ch">
            {isOfficer
              ? t("party.gallery.emptyOfficer")
              : t("party.gallery.emptyBody")}
          </Text>
        </Stack>
      )}

      {!!photos?.length && (
        <SimpleGrid cols={{ base: 2, xs: 3, sm: 4, md: 5 }} spacing="sm">
          {photos.map((photo, index) => (
            <div key={photo.id} style={{ position: "relative" }}>
              <button
                type="button"
                className={styles.tile}
                style={{ aspectRatio: "1 / 1" }}
                onClick={() => setOpenIndex(index)}
                aria-label={t("party.gallery.open", { index: index + 1 })}
              >
                <img
                  src={photo.thumbnailUrl}
                  alt={photo.caption ?? ""}
                  loading="lazy"
                  decoding="async"
                  data-loaded={loaded[photo.id] ? "true" : "false"}
                  onLoad={() =>
                    setLoaded((current) => ({ ...current, [photo.id]: true }))
                  }
                />
              </button>

              {isOfficer && (
                <Tooltip label={t("party.gallery.delete")} withArrow>
                  <ActionIcon
                    variant="filled"
                    color="dark"
                    size="sm"
                    radius="xl"
                    style={{ position: "absolute", top: 6, right: 6 }}
                    onClick={() => setPendingDelete(photo.id)}
                    aria-label={t("party.gallery.delete")}
                  >
                    <IconTrash size={14} stroke={1.8} />
                  </ActionIcon>
                </Tooltip>
              )}
            </div>
          ))}
        </SimpleGrid>
      )}

      {openIndex !== null && photos && (
        <Lightbox
          photos={photos}
          index={openIndex}
          onIndexChange={setOpenIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}

      <Modal
        opened={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title={t("party.gallery.deleteTitle")}
        size="sm"
      >
        <Stack gap="lg">
          <Text size="sm" c="dimmed">
            {t("party.gallery.deleteBody")}
          </Text>
          <Group gap="xs" justify="right">
            <Button variant="default" onClick={() => setPendingDelete(null)}>
              {t("login.cancel")}
            </Button>
            <Button color="red" loading={isDeleting} onClick={handleDelete}>
              {t("party.gallery.deleteConfirm")}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default PartyGallery;
