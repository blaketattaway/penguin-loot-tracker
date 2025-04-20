import { PropsWithChildren } from "react";
import { createTheme, MantineProvider } from "@mantine/core";

const theme = createTheme({});

const ThemeProvider = ({ children }: PropsWithChildren) => {
  return (
    <MantineProvider defaultColorScheme="dark" theme={theme}>
      {children}
    </MantineProvider>
  );
};

export default ThemeProvider;
