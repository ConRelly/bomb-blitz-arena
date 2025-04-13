import { ReactNode, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { DEFAULT_THEME } from "../constants/default-theme";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "app";

interface Props {
  children: ReactNode;
}

/**
 * A provider wrapping the whole app.
 *
 * You can add multiple providers here by nesting them,
 * and they will all be applied to the app.
 */
export const AppProvider = ({ children }: Props) => {
  const { setTheme } = useTheme();
  const navigate = useNavigate();
  const { user } = useCurrentUser();

  // Set the default theme to dark on initial load
  useEffect(() => {
    setTheme(DEFAULT_THEME);
  }, [setTheme]);

  return (
    <>
      {children}
    </>
  );
};