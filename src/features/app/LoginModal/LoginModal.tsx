import { Button, Group, Modal, PasswordInput, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";

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
    <Modal opened={true} onClose={onClose} title="Login">
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
        <Text size="sm" c="dimmed" mb="sm">
          Enter the guild access code to unlock loot assignment.
        </Text>
        <PasswordInput
          label="Access code"
          placeholder="Password"
          data-autofocus
          {...form.getInputProps("password", { type: "input" })}
        />
        <Group gap="xs" justify="right" mt="lg">
          <Button onClick={onClose} variant="default">
            Cancel
          </Button>
          <Button type="submit" loading={isPending}>
            Login
          </Button>
        </Group>
      </form>
    </Modal>
  );
};

export default LoginModal;
