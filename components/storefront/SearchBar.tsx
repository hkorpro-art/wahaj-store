"use client";

import { Search } from "lucide-react";

type SearchBarProps = {
  query: string;
  setQuery: (value: string) => void;
};

export default function SearchBar({ query, setQuery }: SearchBarProps) {
  return (
    <div className="mx-auto my-6 w-full max-w-2xl px-4" id="search-bar">
      <div className="relative flex items-center rounded-full border border-wahaj-border bg-white/70 shadow-sm backdrop-blur-md transition-all duration-300 focus-within:border-wahaj-rose/30 focus-within:ring-2 focus-within:ring-wahaj-rose/10">
        <span className="pointer-events-none absolute right-4 text-wahaj-text/50">
          <Search className="h-5 w-5" />
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحثي عن قطعة مميزة (عقود، أطقم، خواتم...)"
          className="h-11 w-full bg-transparent pl-4 pr-11 text-right text-sm text-wahaj-ink placeholder-wahaj-text/50 focus:outline-none"
          dir="rtl"
        />
      </div>
    </div>
  );
}
