const API_BASE_URL = "https://alerty-api-dotnet-production.up.railway.app";

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  idEmpresa: number;
}

export async function login(
  email: string,
  senha: string,
  manterConectado: boolean
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha, manterConectado }),
  });

  if (!response.ok) {
    const erro = await response.json().catch(() => ({ erro: "Erro ao fazer login." }));
    throw new Error(erro.erro ?? "Credenciais inválidas.");
  }

  const dados: LoginResponse = await response.json();

  localStorage.setItem("accessToken", dados.accessToken);
  localStorage.setItem("refreshToken", dados.refreshToken);
  localStorage.setItem("idEmpresa", dados.idEmpresa.toString());

  return dados;
}

export async function logout(): Promise<void> {
  const refreshToken = localStorage.getItem("refreshToken");

  if (refreshToken) {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {});
  }

  localStorage.clear();
  window.location.href = "/login";
}

export function estaLogado(): boolean {
  return !!localStorage.getItem("accessToken");
}
