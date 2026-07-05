import {
  Alert,
  Button,
  Center,
  Group,
  List,
  Loader,
  Modal,
  MultiSelect,
  Stack,
  Text,
} from "@mantine/core";
import { IconAlertTriangle, IconArrowLeft } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm } from "@mantine/form";
import { useTranslation } from "react-i18next";

import {
  AssignedItem,
  useAssignItemMutation,
  useGetPlayersQuery,
  WowheadItem,
} from "../../../hooks/endpoints";

interface AssignItemModalProps {
  onClose: () => void;
  data: WowheadItem;
}

type SelectedPlayer = { id: string; name: string };

const AssignItemModal = ({ onClose, data }: AssignItemModalProps) => {
  const { t } = useTranslation();
  const { data: players, status } = useGetPlayersQuery();
  const { mutateAsync: assignItemAsync, isPending } = useAssignItemMutation();
  const queryClient = useQueryClient();
  // Assigning loot is irreversible from the UI (there is no unassign endpoint),
  // so we gate the write behind an explicit confirmation of exactly what's recorded.
  const [pending, setPending] = useState<SelectedPlayer[] | null>(null);
  const form = useForm<{ selectedPlayers: string[] }>({
    initialValues: {
      selectedPlayers: [],
    },
    validate: {
      selectedPlayers: (value) =>
        value?.length ? null : t("assignItem.selectAtLeastOne"),
    },
    mode: "uncontrolled",
  });
  const playerOptions = useMemo(
    () =>
      players?.map((player) => ({
        value: player.id || "",
        label: player.name || "",
      })),
    [players]
  );

  const commitAssign = async (selected: SelectedPlayer[]) => {
    const itemsToAssign: AssignedItem[] = selected.map(({ id, name }) => ({
      player: { id, name, lootedCount: 0, lootedItems: [] },
      // Persist the canonical English name so stored data stays language-neutral.
      item: { id: data.id, name: data.nameEn },
    }));

    try {
      await assignItemAsync(itemsToAssign);
      await queryClient.invalidateQueries({ queryKey: ["players"] });
      notifications.show({
        title: t("assignItem.successTitle"),
        message: `${data.name} → ${selected.map((p) => p.name).join(", ")}.`,
        color: "gold",
      });
      onClose();
    } catch (error) {
      notifications.show({
        title: t("assignItem.errorTitle"),
        message: (error as Error).message,
        color: "red",
      });
    }
  };

  return (
    <Modal title={t("assignItem.title")} onClose={onClose} opened>
      {status === "pending" ? (
        <Center py="lg">
          <Loader color="gold" />
        </Center>
      ) : pending ? (
        <Stack gap="md">
          <Alert
            variant="light"
            color="gold"
            icon={<IconAlertTriangle size={18} />}
            title={t("assignItem.confirmTitle")}
          >
            {t("assignItem.confirmWarning")}
          </Alert>
          <div>
            <Text size="sm" c="dimmed" mb={4}>
              {t("assignItem.recordingPrefix")}{" "}
              <Text span fw={700} c="gold.4">
                {data.name}
              </Text>{" "}
              {t("assignItem.recordingSuffix")}
            </Text>
            <List size="sm" withPadding>
              {pending.map((p) => (
                <List.Item key={p.id}>{p.name}</List.Item>
              ))}
            </List>
          </div>
          <Group justify="right" gap="xs">
            <Button
              variant="default"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => setPending(null)}
              disabled={isPending}
            >
              {t("assignItem.back")}
            </Button>
            <Button loading={isPending} onClick={() => commitAssign(pending)}>
              {t("assignItem.confirmAssign")}
            </Button>
          </Group>
        </Stack>
      ) : (
        <form
          onSubmit={form.onSubmit((values) => {
            const selected: SelectedPlayer[] = values.selectedPlayers.map(
              (id) => ({
                id,
                name: playerOptions?.find((p) => p.value === id)?.label ?? "",
              })
            );
            setPending(selected);
          })}
        >
          <Text size="sm" c="dimmed" mb="sm">
            {t("assignItem.assigningPrefix")}{" "}
            <Text span fw={700} c="gold.4">
              {data.name}
            </Text>
            {t("assignItem.assigningSuffix")}
          </Text>
          <MultiSelect
            label={t("assignItem.playersLabel")}
            placeholder={t("assignItem.playersPlaceholder")}
            searchable
            data={playerOptions}
            data-autofocus
            {...form.getInputProps("selectedPlayers", { type: "input" })}
          />
          <Group mt="lg" justify="right" gap="xs">
            <Button variant="default" onClick={onClose}>
              {t("assignItem.cancel")}
            </Button>
            <Button type="submit">{t("assignItem.review")}</Button>
          </Group>
        </form>
      )}
    </Modal>
  );
};

export default AssignItemModal;
