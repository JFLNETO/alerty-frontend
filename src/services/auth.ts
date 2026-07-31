const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  idEmpresa: number;
  nomeDono: string | null;
  isAdmin: boolean;
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
  localStorage.setItem("nomeDono", dados.nomeDono ?? "");
  localStorage.setItem("isAdmin", dados.isAdmin ? "true" : "false");

  return dados;
}

export interface RegistrarResponse extends LoginResponse {
  nomeEmpresa: string;
}

export async function registrar(dados: {
  nomeEmpresa: string;
  nomeDono: string;
  whatsappDono: string;
  email: string;
  senha: string;
}): Promise<RegistrarResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/registro`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    const erro = await response.json().catch(() => ({ erro: "Erro ao cadastrar." }));
    throw new Error(erro.erro ?? "Erro ao cadastrar.");
  }

  const resultado: RegistrarResponse = await response.json();

  localStorage.setItem("accessToken", resultado.accessToken);
  localStorage.setItem("refreshToken", resultado.refreshToken);
  localStorage.setItem("idEmpresa", resultado.idEmpresa.toString());
  localStorage.setItem("nomeDono", resultado.nomeDono ?? "");
  localStorage.setItem("isAdmin", resultado.isAdmin ? "true" : "false");

  return resultado;
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

export function souAdmin(): boolean {
  return localStorage.getItem("isAdmin") === "true";
}

export function obterNomeDono(): string {
  return localStorage.getItem("nomeDono") || "Minha conta";
}
