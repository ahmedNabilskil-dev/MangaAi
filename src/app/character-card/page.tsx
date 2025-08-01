"use client";
import { CharacterCard } from "@/components/CharacterCard";

const fakeCards = [
  {
    name: "Blue-Eyes White Dragon",
    attribute: "Light",
    level: 8,
    imageUrl: "/images/hero-bg.png",
    type: "Dragon",
    race: "Legendary",
    description: "This legendary dragon is a powerful engine of destruction.",
    atk: 3000,
    def: 2500,
    rarity: "Ultra Rare",
    lore: "A legendary dragon that is a symbol of power and victory.",
  },
  {
    name: "Dark Magician",
    attribute: "Dark",
    level: 7,
    imageUrl: "/images/manga.png",
    type: "Spellcaster",
    race: "Human",
    description: "The ultimate wizard in terms of attack and defense.",
    atk: 2500,
    def: 2100,
    rarity: "Rare",
    lore: "A master of dark arts, loyal to the Pharaoh.",
  },
  {
    name: "Red-Eyes Black Dragon",
    attribute: "Fire",
    level: 7,
    imageUrl: "/images/hero-bg.png",
    type: "Dragon",
    race: "Mythic",
    description: "A ferocious dragon with a deadly attack.",
    atk: 2400,
    def: 2000,
    rarity: "Secret Rare",
    lore: "A dragon that brings victory to the lucky duelist.",
  },
  {
    name: "Celtic Guardian",
    attribute: "Earth",
    level: 4,
    imageUrl: "/images/manga.png",
    type: "Warrior",
    race: "Elf",
    description: "An elf who learned to wield a sword with fierce skill.",
    atk: 1400,
    def: 1200,
    rarity: "Common",
    lore: "A guardian of the forest, swift and silent.",
  },
];

export default function CharacterCardPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <h1 className="text-3xl font-bold mb-6 text-yellow-300 drop-shadow-lg tracking-widest font-serif uppercase">
        Yu-Gi-Oh! Character Card Demo
      </h1>
      <div className="flex flex-wrap gap-8 justify-center w-full">
        {fakeCards.map((card, idx) => (
          <CharacterCard
            key={card.name + idx}
            {...card}
            rarity={
              card.rarity as "Ultra Rare" | "Rare" | "Secret Rare" | "Common"
            }
            showRarityLabel
          />
        ))}
      </div>
    </main>
  );
}
