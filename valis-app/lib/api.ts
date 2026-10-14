export const API_URL = "https://api-valis.labcedro.com.br";
export const PAGE_SIZE = 20;
const TOKEN_KEY = "valis.token";

const ROTAS_PUBLICAS = new Set([
  "POST /auth/cadastro",
  "POST /auth/login",
  "POST /auth/esqueci-senha",
  "POST /auth/redefinir-senha",
]);

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export type Query = Record<string, string | number | undefined>;

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function mensagemErro(erro: unknown) {
  if (erro instanceof ApiError) return erro.message;
  if (erro instanceof Error && erro.name === "AbortError") return "";
  return "Não foi possível concluir a operação.";
}

function rotaPublica(method: string, path: string) {
  const pathname = path.split("?")[0];
  return ROTAS_PUBLICAS.has(`${method} ${pathname}`);
}

function montarUrl(path: string, query?: Query) {
  const url = new URL(`${API_URL}${path.startsWith("/") ? path : `/${path}`}`);
  if (query) {
    for (const [chave, valor] of Object.entries(query)) {
      if (valor !== undefined) url.searchParams.set(chave, String(valor));
    }
  }
  return url;
}

async function lerErro(res: Response) {
  try {
    const data = (await res.json()) as { erro?: unknown };
    if (typeof data.erro === "string" && data.erro.trim()) return data.erro;
  } catch {
    /* corpo vazio ou não JSON */
  }
  return "Não foi possível concluir a operação.";
}

async function request(method: string, path: string, body?: unknown, query?: Query, signal?: AbortSignal) {
  const headers: Record<string, string> = {};
  const publica = rotaPublica(method, path);
  if (!publica) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const limite = new AbortController();
  const timer = setTimeout(() => limite.abort(), 12000);
  const aoCancelar = () => limite.abort();
  signal?.addEventListener("abort", aoCancelar);

  let res: Response;
  try {
    res = await fetch(montarUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: limite.signal,
    });
  } catch (erro) {
    if (erro instanceof Error && erro.name === "AbortError") {
      if (signal?.aborted) throw erro;
      throw new ApiError(0, "Não foi possível conectar à API.");
    }
    throw new ApiError(0, "Não foi possível conectar à API.");
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", aoCancelar);
  }

  if (res.status === 401 && !publica) {
    clearToken();
    if (typeof window !== "undefined" && window.location.pathname !== "/") {
      window.location.assign("/");
    }
    throw new ApiError(401, await lerErro(res));
  }

  if (!res.ok) throw new ApiError(res.status, await lerErro(res));
  return res;
}

async function lerJson<T>(res: Response): Promise<{ data: T; total: number | null }> {
  const totalHeader = res.headers.get("X-Total-Count");
  const total = totalHeader != null && totalHeader !== "" ? Number(totalHeader) : null;
  if (res.status === 204) return { data: undefined as T, total };
  const text = await res.text();
  if (!text) return { data: undefined as T, total };
  return { data: JSON.parse(text) as T, total };
}

export async function apiGet<T>(path: string, query?: Query, signal?: AbortSignal) {
  const res = await request("GET", path, undefined, query, signal);
  return lerJson<T>(res);
}

export async function apiSend<T>(method: "POST" | "PATCH" | "DELETE", path: string, body?: unknown) {
  const res = await request(method, path, body);
  const json = await lerJson<T>(res);
  return json.data;
}

export async function apiBlob(path: string) {
  const res = await request("GET", path);
  return res.blob();
}

export async function fetchAll<T>(path: string, signal?: AbortSignal) {
  const pageSize = 100;
  const todos: T[] = [];
  let page = 1;

  while (page <= 50) {
    const res = await apiGet<T[]>(path, { page, pageSize }, signal);
    const lote = Array.isArray(res.data) ? res.data : [];
    todos.push(...lote);
    if (res.total != null && todos.length >= res.total) break;
    if (lote.length < pageSize) break;
    page += 1;
  }

  return todos;
}
