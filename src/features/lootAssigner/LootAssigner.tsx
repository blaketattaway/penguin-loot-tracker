import { ReactNode, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  Center,
  Group,
  LoadingOverlay,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconLogin2,
  IconSearchOff,
  IconSwords,
  IconUserPlus,
} from "@tabler/icons-react";

import LootSearcher from "./LootSearcher/LootSearcher";
import LootTable from "./LootTable/LootTable";
import LoginModal from "../app/LoginModal/LoginModal";
import AddPlayerModal from "./AddPlayerModal/AddPlayerModal";
import AssignItemModal from "./AssignItemModal/AssignItemModal";

import useAuth from "../../hooks/useAuth";
import { useGetItemsMutation, WowheadItem } from "../../hooks/endpoints";

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

const LootAssigner = () => {
  const { isValid } = useAuth();
  const [assignItem, setAssignItem] = useState<WowheadItem | null>(null);
  const [isLoginOpen, { open: openLoginModal, close: closeLoginModal }] =
    useDisclosure(false);
  const [
    isAddPlayerOpen,
    { open: openAddPlayerModal, close: closeAddPlayerModal },
  ] = useDisclosure(false);
  const [
    isAssignItemOpen,
    { open: openAssignItemModal, close: closeAssignItemModal },
  ] = useDisclosure(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    mutateAsync: getItemsAsync,
    data: items,
    status,
  } = useGetItemsMutation();

  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
    if (searchParams.get("search")) {
      getItemsAsync({
        page: searchParams.get("page")
          ? parseInt(searchParams.get("page")!)
          : 1,
        pageCount: 10,
        querySearch: searchParams.get("search")!,
      });
    }
  }, [searchParams, getItemsAsync]);

  const results = items?.results ?? [];
  const isLoading = status === "pending";

  const renderResults = () => {
    if (!searchQuery) {
      return (
        <EmptyState
          icon={<IconSwords size={30} />}
          title="Search for an item to assign"
          hint="Type an item's name above to look it up on Blizzard's database, then assign it to one or more players."
        />
      );
    }
    if (!isLoading && results.length === 0) {
      return (
        <EmptyState
          icon={<IconSearchOff size={30} />}
          title="No items found"
          hint={`Nothing matched "${searchQuery}". Check the spelling or try a broader term.`}
        />
      );
    }
    return (
      <LootTable
        onAssignItemClick={(item) => {
          setAssignItem(item);
          openAssignItemModal();
        }}
        onPageChange={(page) =>
          setSearchParams((prev) => {
            prev.set("page", page.toString());
            return prev;
          })
        }
        page={items?.page || 1}
        pageCount={items?.pageCount || 0}
        items={results}
      />
    );
  };

  return (
    <>
      {isLoginOpen && <LoginModal onClose={closeLoginModal} />}
      {isAddPlayerOpen && <AddPlayerModal onClose={closeAddPlayerModal} />}
      {isAssignItemOpen && assignItem && (
        <AssignItemModal data={assignItem} onClose={closeAssignItemModal} />
      )}

      <Stack gap="lg" className="plt-enter">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={2}>Loot Assigner</Title>
            <Text c="dimmed" size="sm">
              Look up an item and record who looted it.
            </Text>
          </div>
          {isValid ? (
            <Button
              onClick={openAddPlayerModal}
              variant="light"
              leftSection={<IconUserPlus size={18} />}
            >
              Add Player
            </Button>
          ) : (
            <Button
              onClick={openLoginModal}
              variant="light"
              leftSection={<IconLogin2 size={18} />}
            >
              Login
            </Button>
          )}
        </Group>

        <Card>
          <Title order={5} mb="sm">
            Search items
          </Title>
          <LootSearcher
            onFormSubmit={(search) => {
              if (search) setSearchParams({ search });
            }}
            searchQuery={searchQuery}
          />
        </Card>

        <Card>
          <Box pos="relative" mih={120}>
            <LoadingOverlay
              visible={isLoading}
              overlayProps={{ blur: 2 }}
              loaderProps={{ color: "gold", type: "bars" }}
            />
            {renderResults()}
          </Box>
        </Card>
      </Stack>
    </>
  );
};

export default LootAssigner;
