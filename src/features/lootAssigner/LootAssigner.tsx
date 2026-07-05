import { ReactNode, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  Center,
  CloseButton,
  Group,
  LoadingOverlay,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconAlertTriangle,
  IconFilter,
  IconLogin2,
  IconRefresh,
  IconSearchOff,
  IconSwords,
  IconUserPlus,
} from "@tabler/icons-react";

import LootSearcher from "./LootSearcher/LootSearcher";
import LootTable from "./LootTable/LootTable";
import LoginModal from "../app/LoginModal/LoginModal";
import AddPlayerModal from "./AddPlayerModal/AddPlayerModal";
import AssignItemModal from "./AssignItemModal/AssignItemModal";

import { useTranslation } from "react-i18next";

import useAuth from "../../hooks/useAuth";
import {
  toBlizzardLocale,
  useGetItemsMutation,
  WowheadItem,
} from "../../hooks/endpoints";

const RESULTS_PER_PAGE = 15;

const EmptyState = ({
  icon,
  title,
  hint,
  color = "gray",
  action,
}: {
  icon: ReactNode;
  title: string;
  hint: string;
  color?: string;
  action?: ReactNode;
}) => (
  <Center py={48}>
    <Stack align="center" gap="xs">
      <ThemeIcon variant="light" color={color} size={56} radius="xl">
        {icon}
      </ThemeIcon>
      <Text fw={700}>{title}</Text>
      <Text c="dimmed" size="sm" ta="center" maw={360}>
        {hint}
      </Text>
      {action}
    </Stack>
  </Center>
);

const LootAssigner = () => {
  const { t, i18n } = useTranslation();
  const locale = toBlizzardLocale(i18n.resolvedLanguage);
  const { isValid } = useAuth();
  const [assignItem, setAssignItem] = useState<WowheadItem | null>(null);
  const [filter, setFilter] = useState("");
  const [clientPage, setClientPage] = useState(1);
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

  const runSearch = () =>
    getItemsAsync({
      page: 1,
      pageCount: 10,
      querySearch: searchParams.get("search")!,
      locale,
    });

  // A search fetches the full result set (up to 100) in one call, so filtering
  // and pagination both happen client-side over everything Blizzard returned.
  useEffect(() => {
    if (searchParams.get("search")) {
      setFilter("");
      setClientPage(1);
      runSearch();
    }
    // Re-run on locale change so results switch to the newly selected language.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, locale]);

  // Reset to the first page whenever the filter changes the result set.
  useEffect(() => {
    setClientPage(1);
  }, [filter]);

  const results = items?.results ?? [];
  const isLoading = status === "pending";

  // Client-side filter across the WHOLE fetched result set — the API returns
  // broad partial matches, so this pins down the exact item regardless of page.
  const filteredResults = filter
    ? results.filter((item) =>
        item.name.toLowerCase().includes(filter.trim().toLowerCase())
      )
    : results;
  const showFilter = !isLoading && status !== "error" && results.length > 0;

  const pageCount = Math.ceil(filteredResults.length / RESULTS_PER_PAGE);
  const pagedResults = filteredResults.slice(
    (clientPage - 1) * RESULTS_PER_PAGE,
    clientPage * RESULTS_PER_PAGE
  );

  const renderResults = () => {
    if (!searchQuery) {
      return (
        <EmptyState
          icon={<IconSwords size={30} />}
          title={t("lootAssigner.empty.searchTitle")}
          hint={t("lootAssigner.empty.searchHint")}
        />
      );
    }
    if (status === "error") {
      return (
        <EmptyState
          color="red"
          icon={<IconAlertTriangle size={30} />}
          title={t("lootAssigner.empty.errorTitle")}
          hint={t("lootAssigner.empty.errorHint", { query: searchQuery })}
          action={
            <Button
              mt="xs"
              variant="light"
              color="red"
              size="xs"
              leftSection={<IconRefresh size={16} />}
              onClick={() => runSearch()}
            >
              {t("lootAssigner.empty.retry")}
            </Button>
          }
        />
      );
    }
    if (!isLoading && results.length === 0) {
      return (
        <EmptyState
          icon={<IconSearchOff size={30} />}
          title={t("lootAssigner.empty.noItemsTitle")}
          hint={t("lootAssigner.empty.noItemsHint", { query: searchQuery })}
        />
      );
    }
    if (filter && filteredResults.length === 0) {
      return (
        <EmptyState
          icon={<IconFilter size={30} />}
          title={t("lootAssigner.empty.noMatchesTitle")}
          hint={t("lootAssigner.empty.noMatchesHint", {
            count: results.length,
            query: searchQuery,
            filter,
          })}
          action={
            <Button
              mt="xs"
              variant="subtle"
              color="gray"
              size="xs"
              onClick={() => setFilter("")}
            >
              {t("lootAssigner.clearFilter")}
            </Button>
          }
        />
      );
    }
    return (
      <LootTable
        onAssignItemClick={(item) => {
          setAssignItem(item);
          openAssignItemModal();
        }}
        onPageChange={setClientPage}
        page={clientPage}
        pageCount={pageCount}
        items={pagedResults}
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
            <Title order={2}>{t("lootAssigner.title")}</Title>
            <Text c="dimmed" size="sm">
              {t("lootAssigner.subtitle")}
            </Text>
          </div>
          {isValid ? (
            <Button
              onClick={openAddPlayerModal}
              variant="light"
              leftSection={<IconUserPlus size={18} />}
            >
              {t("lootAssigner.addPlayer")}
            </Button>
          ) : (
            <Button
              onClick={openLoginModal}
              variant="light"
              leftSection={<IconLogin2 size={18} />}
            >
              {t("lootAssigner.login")}
            </Button>
          )}
        </Group>

        <Card>
          <Title order={5} mb="sm">
            {t("lootAssigner.searchItems")}
          </Title>
          <LootSearcher
            onFormSubmit={(search) => {
              if (search) setSearchParams({ search });
            }}
            searchQuery={searchQuery}
          />
        </Card>

        <Card>
          {showFilter && (
            <TextInput
              mb="md"
              value={filter}
              onChange={(e) => setFilter(e.currentTarget.value)}
              placeholder={t("lootAssigner.filterPlaceholder")}
              leftSection={<IconFilter size={16} />}
              rightSection={
                filter ? (
                  <CloseButton
                    size="sm"
                    aria-label={t("lootAssigner.clearFilter")}
                    onClick={() => setFilter("")}
                  />
                ) : null
              }
            />
          )}
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
