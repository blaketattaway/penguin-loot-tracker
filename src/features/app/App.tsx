import {
  Anchor,
  AppShell,
  Avatar,
  Badge,
  Box,
  Burger,
  Center,
  Group,
  Loader,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconBrandGithubFilled } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

import Logo from "../../assets/penguin-logo.webp";

import Router from "./router/Router";
import Navigation from "./navigation/Navigation";
import LanguageSwitcher from "./LanguageSwitcher/LanguageSwitcher";

import { useFetchBlizzardToken } from "../../hooks/endpoints";

const APP_NAME: string = "Penguin Loot Tracker";

const Brand = () => {
  const { t } = useTranslation();
  return (
    <Group gap="sm" wrap="nowrap">
      <Avatar src={Logo} alt="Penguin Loot Tracker logo" radius="md" size={40} />
      <Box>
        <Title order={4} lh={1.1} fw={800}>
          {APP_NAME}
        </Title>
        <Text size="xs" c="dimmed" lh={1.1}>
          {t("app.tagline")}
        </Text>
      </Box>
    </Group>
  );
};

const App = () => {
  const { t } = useTranslation();
  const { status } = useFetchBlizzardToken();
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] =
    useDisclosure(false);
  const isDesktop = useMediaQuery("(min-width: 48em)", false, {
    getInitialValueInEffect: false,
  });

  if (status === "pending") {
    return (
      <Center h="100vh">
        <Stack align="center" gap="lg" className="plt-enter">
          <Avatar src={Logo} alt="logo" size={72} radius="md" />
          <Loader color="gold" type="bars" />
          <Text c="dimmed" size="sm">
            {t("app.loading")}
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <AppShell
      header={{ height: 60, collapsed: isDesktop }}
      navbar={{
        width: 288,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened },
      }}
      padding="md"
    >
      <AppShell.Header hiddenFrom="sm" px="md">
        <Group h="100%" justify="space-between">
          <Brand />
          <Burger
            opened={mobileOpened}
            onClick={toggleMobile}
            size="sm"
            aria-label={
              mobileOpened ? t("app.closeNavigation") : t("app.openNavigation")
            }
          />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section>
          <Brand />
        </AppShell.Section>
        <AppShell.Section grow py="lg">
          <Navigation onNavigate={closeMobile} />
        </AppShell.Section>
        <AppShell.Section>
          <Group justify="space-between" align="center" mb="sm">
            <LanguageSwitcher />
            <Badge variant="light" color="gold" size="sm" radius="sm">
              {t("app.forTheGuild")}
            </Badge>
          </Group>
          <Anchor
            display="flex"
            c="dimmed"
            target="_blank"
            style={{ alignItems: "center", gap: 8 }}
            href="https://github.com/blaketattaway/penguin-loot-tracker"
          >
            <IconBrandGithubFilled size={20} stroke={1.5} />
            <Text span size="sm">
              {t("app.github")}
            </Text>
          </Anchor>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Router />
      </AppShell.Main>
    </AppShell>
  );
};

export default App;
