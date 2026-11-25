// Endereços de antes dos setores: favoritos e links antigos vão para a imuno.
const ROTAS_ANTIGAS = [
  "dashboard", "rastreabilidade", "validacao", "conclusao", "relatorios",
  "cadastros", "usuarios", "perfil", "cadastro", "esqueci-senha", "redefinir-senha",
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // A raiz abre o login da imuno; os outros setores são escolhidos pelos botões do login.
      { source: "/", destination: "/imuno", permanent: false },
      ...ROTAS_ANTIGAS.map((rota) => ({
        source: `/${rota}/:resto*`,
        destination: `/imuno/${rota}/:resto*`,
        permanent: false, // temporário: some quando ninguém mais usar os endereços antigos
      })),
    ];
  },
};

export default nextConfig;
