import { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { featuredMovies } from "../data/movies";

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const movie = featuredMovies[current];

  const prev = () =>
    setCurrent((c) => (c - 1 + featuredMovies.length) % featuredMovies.length);
  const next = () =>
    setCurrent((c) => (c + 1) % featuredMovies.length);

  return (
    <section id="精选" className="max-w-6xl mx-auto px-4 mt-8">
      <div className="relative sketch-border bg-white shadow-sketch overflow-hidden">
        {/* 胶带装饰 */}
        <div className="tape tape-left" />
        <div className="tape tape-right" />

        <div className="flex flex-col md:flex-row">
          {/* 海报 */}
          <div className="md:w-1/3 p-4 flex-shrink-0">
            <a href={movie.url} target="_blank" rel="noreferrer">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full h-64 md:h-80 object-cover sketch-border"
              />
            </a>
          </div>

          {/* 信息 */}
          <div className="flex-1 p-6 flex flex-col justify-center">
            <div className="inline-flex items-center gap-1 bg-sticky px-3 py-1 sketch-border-thin w-fit mb-3 text-sm font-body">
              <Star className="w-4 h-4 fill-marker-red text-marker-red" />
              <span className="font-bold">{movie.rating}</span>
            </div>
            <h2 className="font-hand text-3xl md:text-4xl font-bold mb-2">
              {movie.title}
            </h2>
            <p className="font-body text-pencil/60 mb-3">
              {movie.year} · {movie.genre}
            </p>
            <p className="font-body text-lg leading-relaxed text-pencil/80 max-w-lg">
              {movie.description}
            </p>

            {/* 指示器 */}
            <div className="flex gap-2 mt-6">
              {featuredMovies.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-3 h-3 rounded-full border-2 border-pencil transition-colors ${
                    i === current ? "bg-pen-blue" : "bg-transparent"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 左右切换 */}
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-1 sketch-border-thin bg-white hover:bg-sticky transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 sketch-border-thin bg-white hover:bg-sticky transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}
