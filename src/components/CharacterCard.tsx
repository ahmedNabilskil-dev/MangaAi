"use client";
import React, { useState } from "react";

type Props = {
  name: string;
  attribute: string;
  level: number;
  imageUrl: string;
  type: string;
  race: string;
  description: string;
  atk: number;
  def: number;
  rarity: "Common" | "Rare" | "Ultra Rare" | "Secret Rare";
  lore?: string;
  showRarityLabel?: boolean;
};

const attributeIcons: Record<string, string> = {
  Fire: "🔥",
  Dark: "🌑",
  Water: "💧",
  Light: "🌟",
  Earth: "🌍",
  Wind: "💨",
  Divine: "⚡",
};

const rarityColors: Record<Props["rarity"], string> = {
  Common: "bg-gray-300 text-gray-700",
  Rare: "bg-blue-400 text-white",
  "Ultra Rare": "bg-yellow-400 text-yellow-900 border-2 border-yellow-500",
  "Secret Rare":
    "bg-gradient-to-r from-pink-400 via-yellow-200 to-blue-400 text-white border-2 border-white",
};

export const CharacterCard: React.FC<Props> = ({
  name,
  attribute,
  level,
  imageUrl,
  type,
  race,
  description,
  atk,
  def,
  rarity,
  lore,
  showRarityLabel,
}) => {
  const [showLore, setShowLore] = useState(false);

  return (
    <div
      className="relative w-80 max-w-full mx-auto rounded-2xl shadow-2xl border-4 border-yellow-900 bg-gradient-to-br from-gray-950 via-gray-900 to-black p-0 transition-transform hover:scale-105 hover:shadow-yellow-400 hover:ring-2 hover:ring-yellow-400 overflow-hidden group flex flex-col"
      style={{
        fontFamily: "'Cinzel', 'Times New Roman', Times, serif",
        minHeight: 520,
        boxShadow: "0 0 32px 6px #bfa046, 0 0 0 4px #222 inset",
      }}
    >
      {/* Top Section: Name, Attribute, Level */}
      <div className="flex flex-col gap-1 px-4 pt-4 pb-2 relative z-10">
        <div className="flex flex-col items-stretch w-full">
          <div className="flex items-center h-8 w-full">
            <span
              className="text-2xl font-extrabold tracking-wide text-yellow-200 drop-shadow-lg uppercase truncate w-full flex items-center"
              style={{
                fontFamily: "'Cinzel', serif",
                letterSpacing: 2,
                lineHeight: 1.1,
                height: 32,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={name}
            >
              {name}
            </span>
          </div>
          <div className="flex items-center w-full justify-between mt-1">
            <span className="text-xs font-bold px-2 py-1 rounded bg-yellow-900/80 text-yellow-200 border border-yellow-700 uppercase tracking-wider mr-2">
              {attribute}
            </span>
            <div className="flex items-center gap-1 ml-2">
              {Array.from({ length: level }).map((_, i) => (
                <span
                  key={i}
                  className="text-yellow-400 text-base drop-shadow-glow"
                  style={{ textShadow: "0 0 6px #bfa046, 0 0 2px #fff" }}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Artwork */}
      <div className="relative w-full h-52 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border-2 border-yellow-900 flex items-center justify-center overflow-hidden shadow-inner mb-2 mt-2">
        <img
          src={imageUrl}
          alt={name}
          className="object-cover w-full h-full scale-105 group-hover:scale-110 transition-transform duration-300"
          onError={(e) => (e.currentTarget.src = "/images/hero-bg.png")}
        />
      </div>

      {/* Type / Race and Lore */}
      <div className="flex justify-between items-center px-4 text-xs font-semibold text-yellow-300 mb-1">
        <span className="tracking-wide">
          [{type} / {race}]
        </span>
        {lore && (
          <button
            className="text-yellow-400 underline hover:text-yellow-200"
            onClick={() => setShowLore((v) => !v)}
            type="button"
          >
            Lore
          </button>
        )}
      </div>

      {/* Description */}
      <div
        className="bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-900 rounded-lg px-4 py-3 text-base text-yellow-100 font-serif shadow-inner tracking-wide overflow-hidden flex-grow flex"
        style={{ lineHeight: 1.5, minHeight: 70 }}
      >
        <span
          className="block overflow-hidden text-ellipsis w-full"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 8,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {description}
        </span>
      </div>

      {/* ATK/DEF always at the bottom */}
      <div className="flex justify-center gap-8 items-center w-full px-4 py-2 bg-black/60 border-t border-yellow-900 mt-auto">
        <span className="font-mono text-base text-yellow-300 drop-shadow font-bold tracking-wider">
          ATK/{atk}
        </span>
        <span className="font-mono text-base text-yellow-300 drop-shadow font-bold tracking-wider">
          DEF/{def}
        </span>
      </div>

      {/* Lore Tooltip/Section */}
      {lore && showLore && (
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-4 w-72 max-w-xs bg-gradient-to-br from-gray-950 to-gray-800 border border-yellow-700 rounded-xl shadow-2xl p-4 z-30 text-sm text-yellow-100 font-serif animate-fade-in"
          style={{ boxShadow: "0 0 18px 4px #bfa046" }}
        >
          <div className="font-bold mb-2 text-yellow-300 text-base">Lore</div>
          <div className="mb-2">{lore}</div>
          <button
            className="absolute top-2 right-4 text-yellow-400 hover:text-yellow-200 text-lg"
            onClick={() => setShowLore(false)}
            type="button"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};
