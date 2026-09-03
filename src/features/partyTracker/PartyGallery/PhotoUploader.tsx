import { useState } from "react";
import {
  Button,
  FileButton,
  Group,
  Progress,
  Stack,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconUpload } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { useUploadPartyPhotoMutation } from "../../../hooks/endpoints";
import { measureAndThumbnail } from "./thumbnail";

interface PhotoUploaderProps {
  year: number;
}

/**
 * Officer-only. Uploads run one at a time and report "3 of 12" rather than
 * spinning silently: a dozen phone photos is a slow operation, and the honest
 * count is what stops someone from closing the tab halfway through.
 */
const PhotoUploader = ({ year }: PhotoUploaderProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { mutateAsync: uploadAsync } = useUploadPartyPhotoMutation();

  const [done, setDone] = useState(0);
  const [total, setTotal] = useState(0);

  const isUploading = total > 0;

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setTotal(files.length);
    setDone(0);

    let failed = 0;

    for (const file of files) {
      try {
        const { width, height, thumbnail } = await measureAndThumbnail(file);

        await uploadAsync({ year, file, thumbnail, width, height });
      } catch {
        failed += 1;
      } finally {
        setDone((current) => current + 1);
      }
    }

    await queryClient.invalidateQueries({ queryKey: ["partyPhotos", year] });
    await queryClient.invalidateQueries({ queryKey: ["parties"] });

    setTotal(0);
    setDone(0);

    notifications.show({
      title: failed
        ? t("party.upload.partialTitle")
        : t("party.upload.successTitle"),
      message: failed
        ? t("party.upload.partialMessage", {
            count: files.length - failed,
            total: files.length,
          })
        : t("party.upload.successMessage", { count: files.length }),
      color: failed ? "orange" : "gold",
    });
  };

  return (
    <Stack gap="xs">
      <Group gap="sm">
        <FileButton
          multiple
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={handleFiles}
          disabled={isUploading}
        >
          {(props) => (
            <Button
              {...props}
              variant="default"
              leftSection={<IconUpload size={16} stroke={1.8} />}
              loading={isUploading}
            >
              {t("party.upload.cta")}
            </Button>
          )}
        </FileButton>

        {isUploading && (
          <Text size="sm" c="dimmed">
            {t("party.upload.progress", { done, total })}
          </Text>
        )}
      </Group>

      {isUploading && (
        <Progress
          value={(done / total) * 100}
          color="gold"
          size="sm"
          radius="xl"
          aria-label={t("party.upload.progress", { done, total })}
        />
      )}
    </Stack>
  );
};

export default PhotoUploader;
