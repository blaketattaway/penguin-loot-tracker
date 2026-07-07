import { Button, Group, Modal, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { useLinkCharacterMutation } from "../../../hooks/endpoints";

interface LinkCharacterModalProps {
  player: { id: string; name: string };
  onClose: () => void;
}

const LinkCharacterModal = ({ player, onClose }: LinkCharacterModalProps) => {
  const { t } = useTranslation();
  const { mutateAsync: linkCharacterAsync, isPending } =
    useLinkCharacterMutation();
  const queryClient = useQueryClient();
  const form = useForm({
    initialValues: {
      name: "",
      realm: "",
    },
    validate: {
      name: (value) =>
        value.trim().length ? null : t("linkChar.nameRequired"),
      realm: (value) =>
        value.trim().length ? null : t("linkChar.realmRequired"),
    },
    mode: "uncontrolled",
  });

  return (
    <Modal title={t("linkChar.title")} onClose={onClose} opened={true}>
      <form
        onSubmit={form.onSubmit(async (values) => {
          const name = values.name.trim();
          const realm = values.realm.trim();
          try {
            await linkCharacterAsync({ playerId: player.id, name, realm });
            await queryClient.invalidateQueries({ queryKey: ["characters"] });
            notifications.show({
              title: t("linkChar.successTitle"),
              message: t("linkChar.successMessage", {
                character: `${name}-${realm}`,
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
        })}
      >
        <Text size="sm" c="dimmed" mb="md">
          {t("linkChar.description", { player: player.name })}
        </Text>
        <TextInput
          label={t("linkChar.nameLabel")}
          placeholder={t("linkChar.namePlaceholder")}
          data-autofocus
          {...form.getInputProps("name", { type: "input" })}
        />
        <TextInput
          mt="sm"
          label={t("linkChar.realmLabel")}
          placeholder={t("linkChar.realmPlaceholder")}
          {...form.getInputProps("realm", { type: "input" })}
        />
        <Group gap="xs" justify="right" mt="lg">
          <Button onClick={onClose} variant="default">
            {t("linkChar.cancel")}
          </Button>
          <Button type="submit" loading={isPending}>
            {t("linkChar.submit")}
          </Button>
        </Group>
      </form>
    </Modal>
  );
};

export default LinkCharacterModal;
