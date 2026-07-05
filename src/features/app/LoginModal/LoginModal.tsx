import {
  Box,
  Button,
  Group,
  Image,
  Modal,
  PasswordInput,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconKey } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

import Logo from "../../../assets/penguin-logo.webp";

import { useLoginMutation } from "../../../hooks/endpoints";
import useAuth from "../../../hooks/useAuth";

interface LoginModalProps {
  onClose: () => void;
}

const LoginModal = ({ onClose }: LoginModalProps) => {
  const { t } = useTranslation();
  const { mutateAsync: loginAsync, isPending } = useLoginMutation();
  const { checkTokenValidity } = useAuth();
  const form = useForm({
    initialValues: {
      password: "",
    },
    validate: {
      password: (value) => (value.length ? null : t("login.passwordRequired")),
    },
    mode: "controlled",
  });

  const handleLogin = async (password: string) => {
    const token = await loginAsync({ accessCode: password });
    const tokenExpiration: string = new Date(token.expiration).toISOString();

    localStorage.setItem("plt-token", token.token);
    localStorage.setItem("plt-token-expiration", tokenExpiration);

    checkTokenValidity();
  };

  return (
    <Modal opened={true} onClose={onClose} title={undefined} size="sm">
      {/* Branded access header: logo in a torch-gold ring + focused message */}
      <Stack gap="lg" pb={4}>
        <Stack gap="sm" align="center" ta="center">
          <Box
            style={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Box
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                margin: "auto",
                width: 96,
                height: 96,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(255,179,0,0.22), transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <Image
              src={Logo}
              alt="Penguin Loot Tracker"
              w={64}
              style={{ position: "relative", zIndex: 1 }}
            />
          </Box>
          <Title order={3} fw={800} fz={22}>
            {t("login.title")}
          </Title>
          <Text size="sm" c="dimmed" maw={"34ch"}>
            {t("login.subtitle")}
          </Text>
        </Stack>

        <form
          onSubmit={form.onSubmit(async (values) => {
            try {
              await handleLogin(values.password);
              notifications.show({
                title: t("login.successTitle"),
                message: t("login.successMessage"),
                color: "gold",
              });
              onClose();
            } catch {
              form.setFieldError("password", t("login.invalidAccessCode"));
              notifications.show({
                title: t("login.failedTitle"),
                message: t("login.failedMessage"),
                color: "red",
              });
            }
          })}
        >
          <PasswordInput
            label={t("login.accessCodeLabel")}
            placeholder={t("login.accessCodePlaceholder")}
            leftSection={<IconKey size={16} stroke={1.5} />}
            data-autofocus
            {...form.getInputProps("password", { type: "input" })}
          />
          <Group gap="xs" justify="right" mt="lg">
            <Button onClick={onClose} variant="default">
              {t("login.cancel")}
            </Button>
            <Button type="submit" loading={isPending}>
              {t("login.unlock")}
            </Button>
          </Group>
        </form>
      </Stack>
    </Modal>
  );
};

export default LoginModal;
