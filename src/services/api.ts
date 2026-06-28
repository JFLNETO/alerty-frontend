const API_BASE_URL = "https://alerty-api-dotnet-production.up.railway.app";

function getToken(): string | null {
  return localStorage.getItem("accessToken");
}

function getHeaders(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: getHeaders(),
  });

  if (response.status === 401) {
    // Token expirado — tenta renovar via refresh
    const renovado = await tentarRenovarToken();
    if (!renovado) {
      localStorage.clear();
      window.location.href = "/login";
      throw new Error("Sessão expirada.");
    }
    // Tenta a requisição novamente com o novo token
    return apiGet<T>(endpoint);
  }

  if (!response.ok) throw new Error("Erro ao buscar dados.");
  return response.json();
}

export async function apiPost<T>(endpoint: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  if (response.status === 401) {
    const renovado = await tentarRenovarToken();
    if (!renovado) {
      localStorage.clear();
      window.location.href = "/login";
      throw new Error("Sessão expirada.");
    }
    return apiPost<T>(endpoint, body);
  }

  if (!response.ok) {
    const erro = await response.json().catch(() => ({ erro: "Erro desconhecido." }));
    throw new Error(erro.erro ?? "Erro na requisição.");
  }

  return response.json();
}

export async function apiPut<T>(endpoint: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const erro = await response.json().catch(() => ({ erro: "Erro desconhecido." }));
    throw new Error(erro.erro ?? "Erro na requisição.");
  }

  return response.json();
}

export async function apiPatch<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  const response = await fetch(`${API_BASE_URL}${endpoint}${query}`, {
    method: "PATCH",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const erro = await response.json().catch(() => ({ erro: "Erro desconhecido." }));
    throw new Error(erro.erro ?? "Erro na requisição.");
  }

  return response.json();
}

async function tentarRenovarToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return false;

    const dados = await response.json();
    localStorage.setItem("accessToken", dados.accessToken);
    return true;
  } catch {
    return false;
  }
}
