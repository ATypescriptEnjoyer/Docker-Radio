import "@mui/material/styles"

declare module '@mui/material/styles' {
  interface AppConfig {
    title: string;
    header: string;
    subtitle: string;
    backgroundColor: string;
    accentColor: string;
    contact: string;
  }
  // fix the type error when referencing the Theme object in your styled component
  interface Theme {
    config: AppConfig;
  }
  // fix the type error when calling `createTheme()` with a custom theme option
  interface ThemeOptions {
    config: AppConfig;
  }
}
