import { NavLink, useLocation } from "react-router-dom";
import { NavLink as Link } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
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

const Navigation = () => {
  const { isValid } = useAuth();
  const location = useLocation();
  const [isOpen, { open, close }] = useDisclosure(false);
  
  return (
    <>
      {isOpen && <LoginModal onClose={close} />}
      {LINKS.map((link) => (
        <Link
          active={location.pathname === link.url}
          key={link.label}
          label={link.label}
          to={link.url}
          rightSection={<IconChevronRight size={14} />}
          leftSection={<link.icon size={18} stroke={1.5} />}
          component={NavLink}
        />
      ))}
      <Link
        label={isValid ? "Logout" : "Login"}
        onClick={isValid ? () => null : open}
        leftSection={
          isValid ? <IconLogout size={18} /> : <IconLogin size={18} />
        }
      />
    </>
  );
};

export default Navigation;
