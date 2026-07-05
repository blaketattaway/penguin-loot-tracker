import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Grid,
  Group,
  Image,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconArrowRight,
  IconChartBar,
  IconDeviceIpadCheck,
  IconShieldLock,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

import Logo from "../../../assets/penguin-logo.webp";

/**
 * In-app welcome / about surface for the Penguin Brotherhood guild. Not a
 * public marketing page: it introduces the tracker to guild members and routes
 * them into the two real tools. Lives inside the AppShell, so it stays on the
 * shared torch-lit atmosphere defined in theme/global.css. Visuals are the real
 * guild mark plus ambient glow, no stock photography, no fake screenshots.
 */

// Feature cards: copy is translated at render time; only the icon, route, and
// translation key live here.
const FEATURES = [
  {
    icon: IconChartBar,
    key: "statistics",
    to: "/statistics",
  },
  {
    icon: IconDeviceIpadCheck,
    key: "assign",
    to: "/loot-assigner",
  },
] as const;

const Welcome = () => {
  const { t } = useTranslation();

  return (
    <Container size="lg" py={{ base: "xl", md: 48 }}>
      {/* --- Hero: asymmetric split, brand visual on the right --- */}
      <Grid gutter={{ base: "xl", md: 56 }} align="center" mb={{ base: 56, md: 96 }}>
        <Grid.Col span={{ base: 12, md: 7 }} order={{ base: 2, md: 1 }}>
          <Stack gap="lg" className="plt-enter">
            <Text
              fw={800}
              tt="uppercase"
              fz="sm"
              c="gold.4"
              style={{ letterSpacing: "0.14em" }}
            >
              {t("welcome.eyebrow")}
            </Text>

            <Title
              order={1}
              fw={800}
              lh={1.05}
              fz={{ base: 34, sm: 44, md: 54 }}
            >
              {t("welcome.titleLead")}{" "}
              <Text span inherit c="gold.4">
                {t("welcome.titleHighlight")}
              </Text>
            </Title>

            <Text size="lg" c="dimmed" maw={"52ch"}>
              {t("welcome.subtitle")}
            </Text>

            <Group gap="sm" mt="xs">
              <Button
                component={Link}
                to="/statistics"
                size="md"
                rightSection={<IconArrowRight size={18} stroke={2} />}
              >
                {t("welcome.features.statistics.cta")}
              </Button>
              <Button
                component={Link}
                to="/loot-assigner"
                size="md"
                variant="default"
              >
                {t("welcome.features.assign.cta")}
              </Button>
            </Group>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }} order={{ base: 1, md: 2 }}>
          <Box
            className="plt-enter"
            style={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
            }}
          >
            {/* Ambient torch-gold glow behind the mark */}
            <Box
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                margin: "auto",
                width: "78%",
                aspectRatio: "1 / 1",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(255,179,0,0.22), transparent 68%)",
                filter: "blur(8px)",
                pointerEvents: "none",
              }}
            />
            <Image
              src={Logo}
              alt="Penguin Loot Tracker"
              w={{ base: 160, sm: 200, md: 232 }}
              style={{ position: "relative", zIndex: 1 }}
            />
          </Box>
        </Grid.Col>
      </Grid>

      {/* --- What you get: two real tools, not identical filler cards --- */}
      <Grid gutter="xl" className="plt-stagger">
        {FEATURES.map((feature) => (
          <Grid.Col span={{ base: 12, sm: 6 }} key={feature.key}>
            <Box
              className="plt-card-hover"
              style={{
                height: "100%",
                borderRadius: "var(--mantine-radius-lg)",
                border: "1px solid var(--mantine-color-dark-4)",
                background: "var(--mantine-color-dark-6)",
                padding: "var(--mantine-spacing-xl)",
              }}
            >
              <Stack gap="md" h="100%">
                <ThemeIcon
                  size={48}
                  radius="md"
                  variant="light"
                  color="gold"
                >
                  <feature.icon size={26} stroke={1.5} />
                </ThemeIcon>
                <Title order={3} fw={800} fz={22}>
                  {t(`welcome.features.${feature.key}.title`)}
                </Title>
                <Text c="dimmed" style={{ flex: 1 }}>
                  {t(`welcome.features.${feature.key}.body`)}
                </Text>
                <Button
                  component={Link}
                  to={feature.to}
                  variant="subtle"
                  color="gold"
                  px="sm"
                  rightSection={<IconArrowRight size={16} stroke={2} />}
                  // Real horizontal padding so the hover fill has breathing room,
                  // pulled left by the same amount so the label stays flush with
                  // the card's title and body text.
                  style={{
                    alignSelf: "flex-start",
                    marginLeft: "calc(var(--mantine-spacing-sm) * -1)",
                  }}
                >
                  {t(`welcome.features.${feature.key}.cta`)}
                </Button>
              </Stack>
            </Box>
          </Grid.Col>
        ))}
      </Grid>

      {/* --- Access note: connects to the login gate without forcing it --- */}
      <Group
        mt={{ base: 40, md: 64 }}
        gap="sm"
        wrap="nowrap"
        justify="center"
        c="dimmed"
      >
        <ThemeIcon size={28} radius="xl" variant="light" color="arcane">
          <IconShieldLock size={16} stroke={1.5} />
        </ThemeIcon>
        <Text size="sm" ta="center">
          {t("welcome.accessNote")}
        </Text>
      </Group>
    </Container>
  );
};

export default Welcome;
