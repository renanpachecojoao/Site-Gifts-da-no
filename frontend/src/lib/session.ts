// Controle de sessão: o login é um cookie httpOnly gerenciado pelo backend; o papel do
// frontend é limpar o cache de dados para que os dados de uma conta nunca apareçam para outra.
import { queryClient } from "./queryClient";
import { apiPost } from "./api";

// Chamar após todo login bem-sucedido.
export function beginSession(): void {
  queryClient.clear();
}

// Chamar em todo botão de sair; o redirecionamento completo limpa todo o estado em memória.
export async function endSession(redirectTo: string = "/login"): Promise<void> {
  try {
    await apiPost("/auth/logout");
  } finally {
    queryClient.clear();
    window.location.assign(redirectTo);
  }
}
