import { QueryClient } from "@tanstack/react-query";

// Cliente de cache do TanStack Query, exportado para que lib/session possa limpá-lo no login/logout.
export const queryClient = new QueryClient();
