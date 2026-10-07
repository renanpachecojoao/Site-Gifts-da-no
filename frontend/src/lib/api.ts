// Camada de chamadas à API (backend FastAPI). A base é o caminho relativo "/api", então o
// mesmo código funciona em desenvolvimento (o Vite redireciona /api → :8001) e em produção.
const BASE = "/api";

// Erro lançado quando a API responde com status diferente de 2xx (status + corpo da resposta).
// Os campos são declarados à parte porque o tsconfig (erasableSyntaxOnly) não aceita
// `constructor(readonly status: number)`.
export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(`request failed with ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type JsonBody = unknown;

async function request<T>(method: string, path: string, body?: JsonBody): Promise<T> {
  // O login vai automaticamente no cookie de sessão (httpOnly) — não adicione cabeçalhos de autenticação aqui.
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  // O FastAPI devolve erros de validação como 422 com corpo {detail: [...]}.
  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    throw new ApiError(res.status, errBody);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// Atalhos por método HTTP. O tipo de resposta <T> é declarado por quem chama e deve espelhar
// o modelo Pydantic do backend — mantenha os dois sincronizados.
export const apiGet = <T>(path: string) => request<T>("GET", path);
export const apiPost = <T>(path: string, body?: JsonBody) => request<T>("POST", path, body ?? null);
export const apiPut = <T>(path: string, body?: JsonBody) => request<T>("PUT", path, body ?? null);
export const apiPatch = <T>(path: string, body?: JsonBody) =>
  request<T>("PATCH", path, body ?? null);
export const apiDelete = <T>(path: string) => request<T>("DELETE", path);
