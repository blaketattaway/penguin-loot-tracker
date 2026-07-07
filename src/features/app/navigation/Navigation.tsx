import { NavLink, useLocation } from "react-router-dom";
import { Divider, NavLink as Link, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";
import {
  IconChartBar,
  IconChevronRight,
  IconDeviceIpadCheck,
  IconLogin,
  IconLogout,
  IconSparkles,
  IconUsers,
} from "@tabler/icons-react";

import useAuth from "../../../hooks/useAuth";
import LoginModal from "../LoginModal/LoginModal";

const LINKS = [
  {
    labelKey: "nav.welcome",
    url: "/welcome",
    icon: IconSparkles,
  },
  {
    labelKey: "nav.statistics",
    url: "/statistics",
    icon: IconChartBar,
  },
  {
    labelKey: "nav.lootAssigner",
    url: "/loot-assigner",
    icon: IconDeviceIpadCheck,
  },
  {
    labelKey: "nav.characters",
    url: "/characters",
    icon: IconUsers,
  },
];

interface NavigationProps {
  onNavigate?: () => void;
}

const Navigation = ({ onNavigate }: NavigationProps) => {
  const { t } = useTranslation();
  const { isValid, logout } = useAuth();
  const location = useLocation();
  const [isOpen, { open, close }] = useDisclosure(false);

  const handleLogout = () => {
    logout();
    onNavigate?.();
    notifications.show({
      title: t("nav.signedOutTitle"),
      message: t("nav.signedOutMessage"),
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
            key={link.url}
            label={t(link.labelKey)}
            to={link.url}
            rightSection={<IconChevronRight size={14} />}
            leftSection={<link.icon size={18} stroke={1.5} />}
            component={NavLink}
            onClick={onNavigate}
          />
        ))}

        <Divider my="sm" />

        <Link
          label={isValid ? t("nav.logout") : t("nav.login")}
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
