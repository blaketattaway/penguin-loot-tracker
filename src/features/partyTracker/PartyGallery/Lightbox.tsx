import { useCallback, useEffect } from "react";
import { ActionIcon, Box, Group, Modal, Stack, Text } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

import { PartyPhoto } from "../../../hooks/endpoints";

import styles from "../party.module.css";

interface LightboxProps {
  photos: PartyPhoto[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

/**
 * Full-screen photo viewer.
 *
 * Arrow keys move between photos and nothing animates on that move except the
 * image itself: stepping through an album is a repeated, keyboard-driven action,
 * and sliding the whole chrome each time would make it feel slow. The image
 * swap gets a short blurred fade so two photos read as one changing, which is
 * the one moment where motion is doing explanatory work.
 */
const Lightbox = ({ photos, index, onIndexChange, onClose }: LightboxProps) => {
  const { t } = useTranslation();
  const photo = photos[index];

  const step = useCallback(
    (delta: number) => {
      // Wraps, so holding an arrow at either end never feels like a dead key.
      onIndexChange((index + delta + photos.length) % photos.length);
    },
    [index, photos.length, onIndexChange]
  );

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [step]);

  if (!photo) return null;

  return (
    <Modal
      opened
      onClose={onClose}
      fullScreen
      padding="md"
      withCloseButton
      title={
        <Text size="sm" c="dimmed">
          {t("party.gallery.counter", {
            current: index + 1,
            total: photos.length,
          })}
        </Text>
      }
      // Centered stays right here: this is a modal, not a popover anchored to
      // the thumbnail that opened it.
      //
      // The theme gives every modal "pop" (a scale-up from 0.9). Overridden to a plain fade
      // only because this one is full-screen, and scaling a viewport-sized surface reads as
      // the whole page lurching. The transform half of the entrance still happens — it just
      // belongs to the photo, via .lightboxImage. The app's easing curve and 220ms are kept
      // so the swap still feels like the same product's modals.
      transitionProps={{
        transition: "fade",
        duration: 220,
        timingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
      }}
      // The body is the whole viewport minus the header, so the photo can sit
      // in the middle of the screen instead of clinging to the top of it.
      styles={{
        body: {
          height: "calc(100dvh - 64px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        },
      }}
    >
      <Stack align="center" justify="center" gap="md" h="100%">
        <Group gap="md" wrap="nowrap" w="100%" justify="center">
          <ActionIcon
            variant="subtle"
            size="xl"
            radius="xl"
            onClick={() => step(-1)}
            aria-label={t("party.gallery.previous")}
            disabled={photos.length < 2}
          >
            <IconChevronLeft size={24} />
          </ActionIcon>

          <Box style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <img
              // Keying on the photo replays the fade, so each swap resolves
              // into focus instead of snapping.
              key={photo.id}
              className={styles.lightboxImage}
              src={photo.url}
              alt={photo.caption ?? t("party.gallery.photoAlt")}
            />
          </Box>

          <ActionIcon
            variant="subtle"
            size="xl"
            radius="xl"
            onClick={() => step(1)}
            aria-label={t("party.gallery.next")}
            disabled={photos.length < 2}
          >
            <IconChevronRight size={24} />
          </ActionIcon>
        </Group>

        {photo.caption && (
          <Text size="sm" c="dimmed" ta="center" maw="60ch">
            {photo.caption}
          </Text>
        )}
      </Stack>
    </Modal>
  );
};

export default Lightbox;
