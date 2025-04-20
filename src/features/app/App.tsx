import {
  Anchor,
  AppShell,
  Avatar,
  Group,
  LoadingOverlay,
  Text,
  Title,
} from "@mantine/core";
import { IconBrandGithubFilled } from "@tabler/icons-react";

import Logo from "../../assets/penguin-logo.webp";

import Router from "./router/Router";
import Navigation from "./navigation/Navigation";

import { useFetchBlizzardToken } from "../../hooks/endpoints";

const APP_NAME: string = "Penguin Loot Tracker";

const App = () => {
  const { status } = useFetchBlizzardToken();

  if (status === "pending") return <LoadingOverlay visible />;

  return (
    <AppShell
      navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: true } }}
      padding="md"
    >
      <AppShell.Navbar p="md">
        <AppShell.Section>
          <Group>
            <Avatar src={Logo} alt="logo" />
            <Title order={4}>{APP_NAME}</Title>
          </Group>
        </AppShell.Section>
        <AppShell.Section grow py="md">
          <Navigation />
        </AppShell.Section>
        <AppShell.Section py="md">
          <Anchor
            display="flex"
            target="_blank"
            style={{ alignItems: "center" }}
            href="https://github.com/blaketattaway/penguin-loot-tracker"
          >
            <IconBrandGithubFilled size={32} stroke={1.5} />
            <Text span ml="xs">
              GitHub
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
