import { Button, Group, Modal, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { useAddPlayerMutation } from "../../../hooks/endpoints";

interface AddPlayerModalProps {
  onClose: () => void;
}

const AddPlayerModal = ({ onClose }: AddPlayerModalProps) => {
  const { t } = useTranslation();
  const { mutateAsync: addPlayerAsync, isPending } = useAddPlayerMutation();
  const queryClient = useQueryClient();
  const form = useForm({
    initialValues: {
      playerName: "",
    },
    validate: {
      playerName: (value) =>
        value.trim().length ? null : t("addPlayer.nameRequired"),
    },
    mode: "uncontrolled",
  });

  return (
    <Modal title={t("addPlayer.title")} onClose={onClose} opened={true}>
      <form
        onSubmit={form.onSubmit(async (values) => {
          try {
            await addPlayerAsync({
              name: values.playerName.trim(),
              lootedItems: [],
              lootedCount: 0,
            });
            await queryClient.invalidateQueries({ queryKey: ["players"] });
            notifications.show({
              title: t("addPlayer.successTitle"),
              message: t("addPlayer.successMessage", {
                name: values.playerName.trim(),
              }),
              color: "gold",
            });
            onClose();
          } catch (error) {
            notifications.show({
              title: t("addPlayer.errorTitle"),
              message: (error as Error).message,
              color: "red",
            });
          }
        })}
      >
        <Text size="sm" c="dimmed" mb="sm">
          {t("addPlayer.description")}
        </Text>
        <TextInput
          label={t("addPlayer.nameLabel")}
          placeholder={t("addPlayer.namePlaceholder")}
          data-autofocus
          {...form.getInputProps("playerName", { type: "input" })}
        />
        <Group gap="xs" justify="right" mt="lg">
          <Button onClick={onClose} variant="default">
            {t("addPlayer.cancel")}
          </Button>
          <Button type="submit" loading={isPending}>
            {t("addPlayer.submit")}
          </Button>
        </Group>
      </form>
    </Modal>
  );
};

export default AddPlayerModal;
