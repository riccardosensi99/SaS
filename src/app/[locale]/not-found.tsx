"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export default function NotFound() {
  const t = useTranslations("common");
  const [phase, setPhase] = useState<"flying" | "exploded">("flying");
  const [particles, setParticles] = useState<Array<{
    id: number; size: number; color: string; angle: number; speed: number;
  }>>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase("exploded");
      setParticles(
        Array.from({ length: 25 }, (_, i) => ({
          id: i,
          size: 3 + Math.random() * 8,
          color: ["#f97316", "#ef4444", "#eab308", "#fb923c", "#fbbf24"][Math.floor(Math.random() * 5)],
          angle: (Math.PI * 2 * i) / 25 + (Math.random() - 0.5) * 0.5,
          speed: 40 + Math.random() * 120,
        }))
      );
    }, 1600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] overflow-hidden relative">
      <style>{`
        @keyframes rocketEntry {
          0% { transform: translate(250px, -200px) rotate(-45deg); opacity: 0; }
          15% { opacity: 1; }
          85% { transform: translate(0, 0) rotate(-45deg); opacity: 1; }
          95% { transform: translate(-10px, 10px) rotate(-45deg) scale(1.1); }
          100% { transform: translate(-10px, 10px) rotate(-45deg) scale(0); opacity: 0; }
        }
        @keyframes boom {
          0% { transform: scale(0); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes flyOut {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(25px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes glitch {
          0%, 100% { transform: translate(0); }
          25% { transform: translate(-3px, 2px); }
          50% { transform: translate(3px, -2px); }
          75% { transform: translate(-2px, -1px); }
        }
      `}</style>

      <div className="relative w-56 h-56 mb-4">
        {phase === "flying" && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ fontSize: "4rem", animation: "rocketEntry 1.6s ease-in forwards" }}
          >
            &#128640;
          </div>
        )}
        {phase === "exploded" && (
          <>
            <div
              className="absolute rounded-full"
              style={{
                width: 80, height: 80,
                left: "50%", top: "50%", marginLeft: -40, marginTop: -40,
                background: "radial-gradient(circle, rgba(251,191,36,0.8) 0%, rgba(239,68,68,0.5) 40%, transparent 70%)",
                animation: "boom 0.7s ease-out forwards",
              }}
            />
            {particles.map((p) => (
              <div
                key={p.id}
                className="absolute rounded-full"
                style={{
                  width: p.size, height: p.size, backgroundColor: p.color,
                  left: "50%", top: "50%", marginLeft: -p.size / 2, marginTop: -p.size / 2,
                  animation: "flyOut 0.9s ease-out forwards",
                  animationDelay: `${Math.random() * 0.1}s`,
                  transform: `translate(${Math.cos(p.angle) * p.speed}px, ${Math.sin(p.angle) * p.speed}px)`,
                }}
              />
            ))}
          </>
        )}
      </div>

      <h1
        className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-2"
        style={{ animation: phase === "exploded" ? "glitch 0.3s, slideUp 0.5s ease-out" : "none", opacity: phase === "exploded" ? 1 : 0 }}
      >
        404
      </h1>
      <h2
        className="text-xl font-semibold text-gray-900 mb-2"
        style={{ animation: phase === "exploded" ? "slideUp 0.5s ease-out 0.15s both" : "none" }}
      >
        Houston, we have a problem
      </h2>
      <p
        className="text-gray-500 mb-8"
        style={{ animation: phase === "exploded" ? "slideUp 0.5s ease-out 0.3s both" : "none" }}
      >
        This page crashed and burned.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary-500/25 transition-all"
        style={{ animation: phase === "exploded" ? "slideUp 0.5s ease-out 0.45s both" : "none" }}
      >
        {t("dashboard")}
      </Link>
    </div>
  );
}
