import { NavLink, useLocation } from "react-router-dom";
import { Divider, NavLink as Link, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconChartBar,
  IconChevronRight,
  IconDeviceIpadCheck,
  IconLogin,
  IconLogout,
} from "@tabler/icons-react";

import useAuth from "../../../hooks/useAuth";
import LoginModal from "../LoginModal/LoginModal";

const LINKS = [
  {
    label: "Statistics",
    url: "/statistics",
    icon: IconChartBar,
  },
  {
    label: "Loot Assigner",
    url: "/loot-asigner",
    icon: IconDeviceIpadCheck,
  },
];

interface NavigationProps {
  onNavigate?: () => void;
}

const Navigation = ({ onNavigate }: NavigationProps) => {
  const { isValid, logout } = useAuth();
  const location = useLocation();
  const [isOpen, { open, close }] = useDisclosure(false);

  const handleLogout = () => {
    logout();
    onNavigate?.();
    notifications.show({
      title: "Signed out",
      message: "You can no longer assign loot until you log back in.",
      color: "gold",
    });
  };

  return (
    <>
      {isOpen && <LoginModal onClose={close} />}
      <Stack gap={4}>
        {LINKS.map((link) => (
          <Link
            active={location.pathname === link.url}
            variant="light"
            key={link.label}
            label={link.label}
            to={link.url}
            rightSection={<IconChevronRight size={14} />}
            leftSection={<link.icon size={18} stroke={1.5} />}
            component={NavLink}
            onClick={onNavigate}
          />
        ))}

        <Divider my="sm" />

        <Link
          label={isValid ? "Logout" : "Login"}
          c={isValid ? "red.5" : undefined}
          onClick={isValid ? handleLogout : open}
          leftSection={
            isValid ? <IconLogout size={18} /> : <IconLogin size={18} />
          }
        />
      </Stack>
    </>
  );
};

export default Navigation;
