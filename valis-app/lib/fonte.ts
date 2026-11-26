import { Roboto } from "next/font/google";

// Fonte única do sistema. Servida pelo próprio Next (sem requisição ao Google em tempo de uso).
// A Roboto não tem 600 nem 800: o navegador usa 700 e 900 no lugar.
export const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  display: "swap",
  variable: "--font-roboto",
});
