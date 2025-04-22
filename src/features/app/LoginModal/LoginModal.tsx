import { Button, Group, Modal, PasswordInput, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useLoginMutation } from "../../../hooks/endpoints";
import useAuth from "../../../hooks/useAuth";

interface LoginModalProps {
  onClose: () => void;
}

const LoginModal = ({ onClose }: LoginModalProps) => {
  const { mutateAsync: loginAsync } = useLoginMutation();
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
    <Modal opened={true} onClose={onClose} centered title="Login">
      <form
        onSubmit={form.onSubmit(async (values) => {
          handleLogin(values.password);

          onClose();
        })}
      >
        <Text>Input password to login to assign items.</Text>
        <PasswordInput
          label="Password"
          placeholder="Password"
          mt="sm"
          mb="sm"
          {...form.getInputProps("password", { type: "input" })}
        />
        <Group gap="xs" justify="right">
          <Button onClick={onClose} variant="outline" size="xs">
            Cancel
          </Button>
          <Button type="submit" variant="fill" size="xs">
            Save
          </Button>
        </Group>
      </form>
    </Modal>
  );
};

export default LoginModal;
