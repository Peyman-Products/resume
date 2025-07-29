declare module "react" {
  export type ReactNode = any;
  export function useState<T>(init: T | (() => T)): [T, (v: T) => void];
  export function useEffect(fn: () => void | (() => void), deps?: any[]): void;
  export function useMemo<T>(fn: () => T, deps?: any[]): T;
  export const Fragment: any;
  export namespace JSX {
    interface Element {}
    interface IntrinsicElements {
      [elem: string]: any;
    }
  }
}

declare module "next/app" {
  export type AppProps = any;
}
declare module "next/head";
declare module "next/document";
declare module "next/link";
declare module "next/router";

declare module "@mui/material" {
  export const Button: any;
  export const AppBar: any;
  export const Toolbar: any;
  export const Typography: any;
  export const IconButton: any;
  export const Box: any;
  export const Dialog: any;
  export const DialogTitle: any;
  export const DialogContent: any;
  export const DialogActions: any;
  export const TextField: any;
  export const MenuItem: any;
  export const FormHelperText: any;
  export const CssBaseline: any;
  export const ThemeProvider: any;
  export const createTheme: any;
  export const Container: any;
  export const Grid: any;
  export const Card: any;
  export const CardContent: any;
  export const CardActions: any;
  export const CircularProgress: any;
  export const Checkbox: any;
  export const FormControlLabel: any;
  export const Tabs: any;
  export const Tab: any;
  export const Divider: any;
  export const Table: any;
  export const TableBody: any;
  export const TableCell: any;
  export const TableRow: any;
  export const Drawer: any;
  export const List: any;
  export const ListItem: any;
  export const ListItemText: any;
  export function useTheme(): any;
  export type PaletteMode = any;
}

declare module "@mui/icons-material/*" {
  const icon: any;
  export default icon;
}

declare module "@mui/x-data-grid" {
  export const DataGrid: any;
  export type GridColDef = any;
}
