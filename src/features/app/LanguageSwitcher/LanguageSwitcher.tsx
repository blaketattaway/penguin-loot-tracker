import { Group, Menu, UnstyledButton, Text } from "@mantine/core";
import { IconLanguage, IconChevronDown } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

import { SUPPORTED_LANGUAGES, SupportedLanguage } from "../../../i18n";

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: "English",
  es: "Español",
};

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const current = (i18n.resolvedLanguage ?? "en") as SupportedLanguage;

  return (
    <Menu shadow="md" width={160} position="top-start" withinPortal>
      <Menu.Target>
        <UnstyledButton
          aria-label={t("language.label")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "var(--mantine-color-dimmed)",
            fontSize: "var(--mantine-font-size-sm)",
          }}
        >
          <IconLanguage size={18} stroke={1.5} />
          <Text span size="sm">
            {LANGUAGE_LABELS[current]}
          </Text>
          <IconChevronDown size={14} stroke={1.5} />
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>{t("language.label")}</Menu.Label>
        {SUPPORTED_LANGUAGES.map((lng) => (
          <Menu.Item
            key={lng}
            onClick={() => i18n.changeLanguage(lng)}
            rightSection={
              current === lng ? (
                <Group gap={0}>
                  <Text span c="gold.4" size="xs">
                    ●
                  </Text>
                </Group>
              ) : null
            }
          >
            {LANGUAGE_LABELS[lng]}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
};

export default LanguageSwitcher;
