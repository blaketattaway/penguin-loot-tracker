import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Group,
  Image,
  PasswordInput,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconConfetti, IconKey } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

import Logo from "../../../assets/penguin-logo.webp";

import {
  PARTY_TOKEN_EXPIRATION_KEY,
  PARTY_TOKEN_KEY,
  usePartyUnlockMutation,
} from "../../../hooks/endpoints";
import usePartyAccess from "../../../hooks/usePartyAccess";

import styles from "../party.module.css";

/**
 * The curtain in front of the party section.
 *
 * This is a gate surface, not a dense product screen — the one place in this
 * app where the branding is allowed to do the talking. It is also the real
 * boundary: the code is checked by the API, and until it comes back with a
 * token there is nothing to render, because the data never left the server.
 */
const PartyGate = () => {
  const { t } = useTranslation();
  const { mutateAsync: unlockAsync, isPending } = usePartyUnlockMutation();
  const { checkPartyAccess } = usePartyAccess();
  const [shake, setShake] = useState(false);

  const form = useForm({
    initialValues: { code: "" },
    validate: {
      code: (value) => (value.trim().length ? null : t("party.gate.required")),
    },
    mode: "controlled",
  });

  const handleUnlock = async (code: string) => {
    const token = await unlockAsync(code);

    localStorage.setItem(PARTY_TOKEN_KEY, token.token);
    localStorage.setItem(
      PARTY_TOKEN_EXPIRATION_KEY,
      new Date(token.expiration).toISOString()
    );

    checkPartyAccess();
  };

  return (
    <Container size="xs" py={{ base: 48, md: 96 }}>
      <Stack gap="xl" align="center" ta="center" className="plt-enter">
        <Box
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {/* Same torch-gold halo the login and welcome surfaces use, but
              breathing — this screen is a destination, not a dialog. */}
          <Box
            aria-hidden
            className={styles.gateGlow}
            style={{
              position: "absolute",
              inset: 0,
              margin: "auto",
              width: 150,
              height: 150,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,179,0,0.24), transparent 68%)",
              filter: "blur(8px)",
              pointerEvents: "none",
            }}
          />
          <Image
            src={Logo}
            alt=""
            w={96}
            style={{ position: "relative", zIndex: 1 }}
          />
        </Box>

        <Stack gap="xs" align="center">
          <Group gap={6} c="gold.4">
            <IconConfetti size={16} stroke={2} />
            <Text
              fw={800}
              tt="uppercase"
              fz="xs"
              style={{ letterSpacing: "0.14em" }}
            >
              {t("party.gate.eyebrow")}
            </Text>
          </Group>

          <Title order={1} fw={800} fz={{ base: 30, sm: 38 }} lh={1.1}>
            {t("party.gate.title")}
          </Title>

          <Text c="dimmed" maw="42ch">
            {t("party.gate.subtitle")}
          </Text>
        </Stack>

        <form
          style={{ width: "100%", maxWidth: 340 }}
          onSubmit={form.onSubmit(async (values) => {
            try {
              await handleUnlock(values.code);
              notifications.show({
                title: t("party.gate.successTitle"),
                message: t("party.gate.successMessage"),
                color: "gold",
              });
            } catch {
              // Shake carries the failure faster than reading the error does.
              setShake(true);
              window.setTimeout(() => setShake(false), 420);
              form.setFieldError("code", t("party.gate.invalid"));
            }
          })}
        >
          <Stack gap="sm">
            <PasswordInput
              size="md"
              className={shake ? styles.gateShake : undefined}
              label={t("party.gate.codeLabel")}
              placeholder={t("party.gate.codePlaceholder")}
              leftSection={<IconKey size={16} stroke={1.5} />}
              data-autofocus
              {...form.getInputProps("code", { type: "input" })}
            />
            <Button type="submit" size="md" loading={isPending} fullWidth>
              {t("party.gate.unlock")}
            </Button>
          </Stack>
        </form>

        <Text size="xs" c="dimmed" maw="40ch">
          {t("party.gate.hint")}
        </Text>
      </Stack>
    </Container>
  );
};

export default PartyGate;
