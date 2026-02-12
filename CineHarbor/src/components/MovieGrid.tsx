import type { Movie } from "../data/movies";
import MovieCard from "./MovieCard";

const rotations = [
  "-1.2deg", "0.8deg", "-0.5deg", "1.5deg",
  "0.6deg", "-1deg", "1.2deg", "-0.7deg",
  "0.9deg", "-1.5deg",
];

interface MovieGridProps {
  movies: Movie[];
  title?: string;
  sectionId?: string;
}

export default function MovieGrid({
  movies,
  title = "热门影视",
  sectionId,
}: MovieGridProps) {
  return (
    <section id={sectionId} className="max-w-6xl mx-auto px-4 mt-12">
      <h2 className="font-hand text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="inline-block w-8 h-0.5 bg-pencil" />
        {title}
        <span className="inline-block w-8 h-0.5 bg-pencil" />
      </h2>
      {movies.length === 0 ? (
        <div className="sketch-border bg-white p-8 text-center font-body text-pencil/60">
          暂无内容，换个关键词再试试。
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie, i) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              rotation={rotations[i % rotations.length]}
            />
          ))}
        </div>
      )}
    </section>
  );
}
