import { NavLink, useLocation } from "react-router-dom";
import { Divider, NavLink as Link, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";
import {
  IconChartBar,
  IconChevronRight,
  IconConfetti,
  IconDeviceIpadCheck,
  IconLock,
  IconLogin,
  IconLogout,
  IconSparkles,
  IconUsers,
} from "@tabler/icons-react";

import useAuth from "../../../hooks/useAuth";
import { usePartyVisibility } from "../../../hooks/usePartyAccess";
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

// The party section sits apart from LINKS because it is the only entry with two
// states. It is always listed — hiding it bought no security (the API serves
// nothing without the code either way) and cost every non-officer a link they
// had to be sent. What it shows instead is a padlock until this browser has
// access, and clicking it leads to the code screen rather than to the album.
const PARTY_LINK = {
  labelKey: "nav.party",
  url: "/party",
};

interface NavigationProps {
  onNavigate?: () => void;
}

const Navigation = ({ onNavigate }: NavigationProps) => {
  const { t } = useTranslation();
  const { isValid, logout } = useAuth();
  const { canView: canViewParty } = usePartyVisibility();
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

        <Link
          active={location.pathname.startsWith(PARTY_LINK.url)}
          variant="light"
          label={t(PARTY_LINK.labelKey)}
          to={PARTY_LINK.url}
          rightSection={<IconChevronRight size={14} />}
          leftSection={
            canViewParty ? (
              <IconConfetti size={18} stroke={1.5} />
            ) : (
              <IconLock size={18} stroke={1.5} />
            )
          }
          // The padlock carries the state visually; this spells it out for
          // anyone on a screen reader, who would otherwise just hear "Fiestas".
          aria-label={canViewParty ? undefined : t("nav.partyLocked")}
          component={NavLink}
          onClick={onNavigate}
        />

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
