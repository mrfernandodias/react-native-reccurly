import { icons } from "./icons";

export const tabs: AppTab[] = [
  { name: "home", title: "Início", icon: icons.home },
  { name: "subscriptions", title: "Assinaturas", icon: icons.wallet },
  { name: "insights", title: "Análises", icon: icons.activity },
  { name: "settings", title: "Configurações", icon: icons.setting },
];

export const HOME_BALANCE = {
  amount: 2489.48,
  nextRenewalDate: "2026-04-18T09:00:00.000Z",
};

export const UPCOMING_SUBSCRIPTIONS: UpcomingSubscription[] = [
  {
    id: "spotify",
    icon: icons.spotify,
    name: "Spotify",
    price: 27.9,
    currency: "BRL",
    daysLeft: 2,
  },
  {
    id: "notion",
    icon: icons.notion,
    name: "Notion",
    price: 48.0,
    currency: "BRL",
    daysLeft: 4,
  },
  {
    id: "figma",
    icon: icons.figma,
    name: "Figma",
    price: 76.0,
    currency: "BRL",
    daysLeft: 6,
  },
];

export const HOME_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "adobe-creative-cloud",
    icon: icons.adobe,
    name: "Adobe Creative Cloud",
    plan: "Plano Equipes",
    category: "Design",
    paymentMethod: "Visa final 8530",
    status: "ativa",
    startDate: "2025-04-20T10:00:00.000Z",
    price: 389.9,
    currency: "BRL",
    billing: "Mensal",
    renewalDate: "2026-04-20T10:00:00.000Z",
    color: "#f5c542",
  },
  {
    id: "github-pro",
    icon: icons.github,
    name: "GitHub Pro",
    plan: "Desenvolvedor",
    category: "Ferramentas de desenvolvimento",
    paymentMethod: "Mastercard final 2408",
    status: "ativa",
    startDate: "2024-11-24T10:00:00.000Z",
    price: 49.0,
    currency: "BRL",
    billing: "Mensal",
    renewalDate: "2026-04-24T10:00:00.000Z",
    color: "#e8def8",
  },
  {
    id: "claude-pro",
    icon: icons.claude,
    name: "Claude Pro",
    plan: "Plano Pro",
    category: "Ferramentas de IA",
    paymentMethod: "Amex final 1010",
    status: "pausada",
    startDate: "2025-06-27T10:00:00.000Z",
    price: 115.0,
    currency: "BRL",
    billing: "Mensal",
    renewalDate: "2026-04-27T10:00:00.000Z",
    color: "#b8d4e3",
  },
  {
    id: "canva-pro",
    icon: icons.canva,
    name: "Canva Pro",
    plan: "Acesso anual",
    category: "Design",
    paymentMethod: "Visa final 7784",
    status: "cancelada",
    startDate: "2024-04-02T10:00:00.000Z",
    price: 289.9,
    currency: "BRL",
    billing: "Anual",
    renewalDate: "2026-04-02T10:00:00.000Z",
    color: "#b8e8d0",
  },
];
