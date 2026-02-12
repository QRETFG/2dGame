import { Star } from "lucide-react";
import type { Movie } from "../data/movies";

interface MovieCardProps {
  movie: Movie;
  rotation: string;
}

export default function MovieCard({ movie, rotation }: MovieCardProps) {
  return (
    <a
      href={movie.url}
      target="_blank"
      rel="noreferrer"
      aria-label={`打开《${movie.title}》链接`}
      style={{ transform: `rotate(${rotation})` }}
      className="sketch-card sketch-border bg-white shadow-sketch overflow-hidden cursor-pointer"
    >
      <div className="relative">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-52 sm:h-60 object-cover"
        />
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-sticky px-2 py-0.5 sketch-border-thin text-sm font-body">
          <Star className="w-3.5 h-3.5 fill-marker-red text-marker-red" />
          <span className="font-bold">{movie.rating}</span>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-hand text-lg font-bold truncate">{movie.title}</h3>
        <p className="font-body text-sm text-pencil/50">
          {movie.year} · {movie.genre}
        </p>
      </div>
    </a>
  );
}
