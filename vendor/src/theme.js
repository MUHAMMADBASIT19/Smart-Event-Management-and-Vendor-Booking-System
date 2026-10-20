import { createMuiTheme } from "@material-ui/core/styles";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#4f46e5", // Vibrant indigo
      light: "#818cf8",
      dark: "#3730a3",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#ec4899", // Vibrant pink
      light: "#f472b6",
      dark: "#be185d",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: [
      "Inter",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: {
      fontWeight: 600,
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 12,
  },
  overrides: {
    MuiButton: {
      root: {
        borderRadius: 8,
        padding: "10px 24px",
      },
      containedPrimary: {
        boxShadow: "0 4px 6px -1px rgba(79, 70, 229, 0.4), 0 2px 4px -1px rgba(79, 70, 229, 0.2)",
        "&:hover": {
          boxShadow: "0 10px 15px -3px rgba(79, 70, 229, 0.5), 0 4px 6px -2px rgba(79, 70, 229, 0.3)",
        },
      },
    },
    MuiPaper: {
      elevation1: {
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
      },
      elevation6: {
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      },
    },
    MuiOutlinedInput: {
      root: {
        borderRadius: 8,
        "&:hover $notchedOutline": {
          borderColor: "#4f46e5",
        },
      },
    },
  },
});

export default theme;
