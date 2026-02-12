import { useState, useMemo } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import CategoryNav from "./components/CategoryNav";
import SearchBar from "./components/SearchBar";
import MovieGrid from "./components/MovieGrid";
import WebsiteTags from "./components/WebsiteTags";
import Footer from "./components/Footer";
import { Sparkles } from "lucide-react";
import { popularMovies, recommendedMovies } from "./data/movies";

export default function App() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return popularMovies;
    const q = search.trim().toLowerCase();
    return popularMovies.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.genre.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <WebsiteTags />
      <SearchBar value={search} onChange={setSearch} />
      <MovieGrid movies={filtered} />
      <CategoryNav />
      <MovieGrid
        sectionId="推荐"
        title="我推荐的影视"
        movies={recommendedMovies}
      />
      <Footer />

      <a
        href="#推荐"
        className="fixed right-5 bottom-5 z-50 px-4 py-2 bg-sticky sketch-border shadow-sketch-sm font-hand text-lg font-bold flex items-center gap-2 hover:shadow-sketch transition-shadow"
      >
        <Sparkles className="w-4 h-4 text-marker-red" />
        推荐
      </a>
    </div>
  );
}
