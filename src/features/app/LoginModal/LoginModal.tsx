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

import Logo from "../../../assets/penguin-logo.webp";

import { useLoginMutation } from "../../../hooks/endpoints";
import useAuth from "../../../hooks/useAuth";

interface LoginModalProps {
  onClose: () => void;
}

const LoginModal = ({ onClose }: LoginModalProps) => {
  const { mutateAsync: loginAsync, isPending } = useLoginMutation();
  const { checkTokenValidity } = useAuth();
  const form = useForm({
    initialValues: {
      password: "",
    },
    validate: {
      password: (value) => (value.length ? null : "Password is required"),
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
            Brotherhood access
          </Title>
          <Text size="sm" c="dimmed" maw={"34ch"}>
            Enter the Brotherhood's access code to unlock loot assignment.
          </Text>
        </Stack>

        <form
          onSubmit={form.onSubmit(async (values) => {
            try {
              await handleLogin(values.password);
              notifications.show({
                title: "Welcome back",
                message: "You can now assign loot.",
                color: "gold",
              });
              onClose();
            } catch {
              form.setFieldError("password", "Invalid access code");
              notifications.show({
                title: "Login failed",
                message: "That access code didn't work. Try again.",
                color: "red",
              });
            }
          })}
        >
          <PasswordInput
            label="Access code"
            placeholder="Enter your code"
            leftSection={<IconKey size={16} stroke={1.5} />}
            data-autofocus
            {...form.getInputProps("password", { type: "input" })}
          />
          <Group gap="xs" justify="right" mt="lg">
            <Button onClick={onClose} variant="default">
              Cancel
            </Button>
            <Button type="submit" loading={isPending}>
              Unlock
            </Button>
          </Group>
        </form>
      </Stack>
    </Modal>
  );
};

export default LoginModal;
