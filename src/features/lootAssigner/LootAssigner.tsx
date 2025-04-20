import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Button,
  Group,
  Paper,
  Title,
  Text,
  LoadingOverlay,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconLogin2, IconUserPlus } from "@tabler/icons-react";

import LootSearcher from "./LootSearcher/LootSearcher";
import LootTable from "./LootTable/LootTable";
import LoginModal from "../app/LoginModal/LoginModal";
import AddPlayerModal from "./AddPlayerModal/AddPlayerModal";
import AssignItemModal from "./AssignItemModal/AssignItemModal";

import useAuth from "../../hooks/useAuth";
import { useGetItemsMutation, WowheadItem } from "../../hooks/endpoints";

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

  return (
    <>
      {isLoginOpen && <LoginModal onClose={closeLoginModal} />}
      {isAddPlayerOpen && <AddPlayerModal onClose={closeAddPlayerModal} />}
      {isAssignItemOpen && assignItem && (
        <AssignItemModal data={assignItem} onClose={closeAssignItemModal} />
      )}
      <Paper>
        <Group justify="space-between" align="center">
          <Title order={2} mb="md">
            Loots Assigner
          </Title>
          {isValid && (
            <Button onClick={openAddPlayerModal} variant="outline" size="xs">
              <IconUserPlus size={18} />
              <Text ml="xs">Add Player</Text>
            </Button>
          )}
          {!isValid && (
            <Button onClick={openLoginModal} variant="outline" size="xs">
              <IconLogin2 size={18} />
              <Text ml="xs">Login</Text>
            </Button>
          )}
        </Group>
        <Title order={4} mb="md">
          Search Items
        </Title>
        <LootSearcher
          onFormSubmit={(search) => {
            setSearchParams({ search });
          }}
          searchQuery={searchParams.get("search") || ""}
        />
        {<LoadingOverlay visible={status === "pending"} />}
        <LootTable
          onAssignItemClick={(item) => {
            setAssignItem(item);
            openAssignItemModal();
          }}
          onPageChange={(page) =>
            setSearchParams((prev) => {
              prev.get("search");
              prev.set("page", page.toString());
              return prev;
            })
          }
          page={items?.page || 1}
          pageCount={items?.pageCount || 0}
          items={items?.results || []}
        />
      </Paper>
    </>
  );
};

export default LootAssigner;
