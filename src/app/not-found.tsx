"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [phase, setPhase] = useState<"flying" | "exploded">("flying");
  const [particles, setParticles] = useState<Array<{
    id: number; x: number; y: number; size: number; color: string; angle: number; speed: number;
  }>>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase("exploded");
      setParticles(
        Array.from({ length: 30 }, (_, i) => ({
          id: i,
          x: 0, y: 0,
          size: 3 + Math.random() * 10,
          color: ["#f97316", "#ef4444", "#eab308", "#fb923c", "#fbbf24", "#dc2626"][Math.floor(Math.random() * 6)],
          angle: (Math.PI * 2 * i) / 30 + (Math.random() - 0.5) * 0.5,
          speed: 40 + Math.random() * 140,
        }))
      );
    }, 1600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950 flex flex-col items-center justify-center overflow-hidden relative">
      {/* Stars background */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 60 }, (_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.1,
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite ${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.8; }
        }
        @keyframes rocketEntry {
          0% { transform: translate(300px, -250px) rotate(-45deg); opacity: 0; }
          15% { opacity: 1; }
          85% { transform: translate(0, 0) rotate(-45deg); opacity: 1; }
          95% { transform: translate(-10px, 10px) rotate(-45deg) scale(1.15); }
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
        @keyframes smokeUp {
          0% { transform: scale(0.3); opacity: 0.5; }
          100% { transform: scale(4) translateY(-60px); opacity: 0; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes glitch {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-3px, 3px); }
          40% { transform: translate(3px, -3px); }
          60% { transform: translate(-2px, -2px); }
          80% { transform: translate(2px, 2px); }
        }
      `}</style>

      {/* Rocket scene */}
      <div className="relative w-72 h-72 mb-4 z-10">
        {/* Rocket */}
        {phase === "flying" && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ fontSize: "5rem", animation: "rocketEntry 1.6s ease-in forwards" }}
          >
            &#128640;
          </div>
        )}

        {/* Explosion ring */}
        {phase === "exploded" && (
          <>
            <div
              className="absolute rounded-full"
              style={{
                width: 100, height: 100,
                left: "50%", top: "50%", marginLeft: -50, marginTop: -50,
                background: "radial-gradient(circle, rgba(251,191,36,0.9) 0%, rgba(239,68,68,0.6) 40%, transparent 70%)",
                animation: "boom 0.8s ease-out forwards",
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                width: 60, height: 60,
                left: "50%", top: "50%", marginLeft: -30, marginTop: -30,
                background: "radial-gradient(circle, rgba(156,163,175,0.4) 0%, transparent 70%)",
                animation: "smokeUp 1.5s ease-out 0.3s forwards",
                opacity: 0,
              }}
            />
            {/* Particles */}
            {particles.map((p) => (
              <div
                key={p.id}
                className="absolute rounded-full"
                style={{
                  width: p.size, height: p.size,
                  backgroundColor: p.color,
                  left: "50%", top: "50%",
                  marginLeft: -p.size / 2, marginTop: -p.size / 2,
                  animation: `flyOut 1s ease-out forwards`,
                  transform: `translate(${Math.cos(p.angle) * p.speed}px, ${Math.sin(p.angle) * p.speed}px)`,
                  opacity: 0,
                  animationFillMode: "forwards",
                  animationDelay: `${Math.random() * 0.15}s`,
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Text content */}
      <div className="relative z-10 text-center">
        <h1
          className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 mb-3"
          style={{
            animation: phase === "exploded" ? "glitch 0.4s ease-in-out, slideUp 0.5s ease-out" : "none",
            opacity: phase === "exploded" ? 1 : 0,
          }}
        >
          404
        </h1>

        <h2
          className="text-2xl font-semibold text-white mb-3"
          style={{
            animation: phase === "exploded" ? "slideUp 0.6s ease-out 0.2s both" : "none",
          }}
        >
          Houston, abbiamo un problema
        </h2>

        <p
          className="text-gray-400 mb-10 max-w-sm mx-auto"
          style={{
            animation: phase === "exploded" ? "slideUp 0.6s ease-out 0.4s both" : "none",
          }}
        >
          Questa pagina si e&apos; schiantata nello spazio profondo. Non c&apos;e&apos; nulla qui.
        </p>

        <Link
          href="/"
          className="inline-block px-8 py-3.5 rounded-xl font-medium text-white transition-all duration-300
            bg-gradient-to-r from-primary-600 to-indigo-600
            hover:from-primary-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-primary-500/25
            backdrop-blur-sm border border-white/10"
          style={{
            animation: phase === "exploded" ? "slideUp 0.6s ease-out 0.6s both" : "none",
          }}
        >
          Torna in salvo
        </Link>
      </div>
    </div>
  );
}
