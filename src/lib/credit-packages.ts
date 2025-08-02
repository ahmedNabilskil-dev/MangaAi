// src/lib/credit-packages.ts

export interface CreditPackage {
  id: string;
  credits: number;
  bonus: number;
  price: number;
  name: string;
  popular?: boolean;
  iconName?: "coins" | "zap" | "star" | "crown";
  color?: string;
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: "starter",
    credits: 100,
    bonus: 10,
    price: 9.99,
    name: "Starter Pack",
    popular: false,
    iconName: "coins",
    color: "from-gray-400 to-gray-500",
  },
  {
    id: "creator",
    credits: 250,
    bonus: 50,
    price: 19.99,
    name: "Creator Pack",
    popular: true,
    iconName: "zap",
    color: "from-blue-400 to-blue-500",
  },
  {
    id: "artist",
    credits: 500,
    bonus: 150,
    price: 39.99,
    name: "Artist Pack",
    popular: false,
    iconName: "star",
    color: "from-purple-400 to-purple-500",
  },
  {
    id: "studio",
    credits: 1000,
    bonus: 400,
    price: 79.99,
    name: "Studio Pack",
    popular: false,
    iconName: "crown",
    color: "from-yellow-400 to-yellow-500",
  },
  {
    id: "enterprise",
    credits: 2500,
    bonus: 1000,
    price: 149.99,
    name: "Enterprise Pack",
    popular: false,
    iconName: "crown",
    color: "from-red-400 to-red-500",
  },
];

// Helper function to get package by ID
export const getCreditPackageById = (id: string): CreditPackage | undefined => {
  return CREDIT_PACKAGES.find((pkg) => pkg.id === id);
};

// Helper function to calculate total credits (credits + bonus)
export const getTotalCredits = (pkg: CreditPackage): number => {
  return pkg.credits + pkg.bonus;
};

// Helper function to calculate price per credit
export const getPricePerCredit = (pkg: CreditPackage): number => {
  return pkg.price / getTotalCredits(pkg);
};
