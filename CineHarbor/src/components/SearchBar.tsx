import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <section className="max-w-6xl mx-auto px-4 mt-12">
      <div className="relative max-w-xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pencil/40" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="搜索影视作品..."
          className="w-full pl-12 pr-4 py-3 font-body text-lg bg-white sketch-border shadow-sketch-sm focus:shadow-sketch focus:outline-none transition-shadow placeholder:text-pencil/30"
        />
      </div>
    </section>
  );
}
