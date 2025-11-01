import {
  ArrowRight,
  BookOpen,
  Gamepad2,
  Lock,
  Radio,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const MangaAILanding = () => {
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) =>
      setMousePos({ x: e.clientX, y: e.clientY });

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.3,
    }));

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        ctx.fillStyle = `rgba(168, 85, 247, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible((prev) => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting,
          }));
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll('[id^="section-"]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const ComicPanel = ({
    children,
    className = "",
    delay = 0,
  }: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
  }) => (
    <div
      className={`relative ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-lg opacity-75 blur-lg group-hover:opacity-100 transition-opacity" />
      <div className="relative bg-black border-4 border-white rounded-lg overflow-hidden shadow-2xl">
        {children}
      </div>
      <div className="absolute -top-2 -left-2 w-8 h-8 bg-white border-4 border-black rounded-full" />
      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border-4 border-black rounded-full" />
    </div>
  );

  return (
    <div className="bg-black text-white min-h-screen overflow-x-hidden relative">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ opacity: 0.4 }}
      />

      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(168, 85, 247, 0.15), transparent 40%)`,
        }}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(168, 85, 247, 0.3) 2px, transparent 2px),
              linear-gradient(90deg, rgba(168, 85, 247, 0.3) 2px, transparent 2px)
            `,
            backgroundSize: "50px 50px",
            transform: `perspective(500px) rotateX(60deg) translateY(${
              scrollY * 0.3
            }px)`,
            transformOrigin: "center top",
          }}
        />

        <div className="absolute inset-0 bg-gradient-radial from-purple-900/30 via-transparent to-black" />

        <div className="relative z-10 text-center px-4 max-w-7xl mx-auto">
          <div className="mb-12">
            <div className="relative inline-block">
              <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 opacity-60 animate-pulse" />
              <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 opacity-40" />

              <div className="relative">
                <img
                  src="/images/logo.png"
                  alt="MangaAI Logo"
                  className="w-64 md:w-96 lg:w-[32rem] h-auto mx-auto"
                  style={{
                    filter: `
                      drop-shadow(0 0 80px rgba(168, 85, 247, 0.8))
                      drop-shadow(0 0 120px rgba(236, 72, 153, 0.6))
                    `,
                    marginTop: -100,
                    marginBottom: -100,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="relative inline-flex items-center gap-3 mb-12 group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-black border-4 border-white px-8 py-4 transform -skew-x-12 shadow-2xl">
              <span className="block text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 tracking-wider">
                ECOSYSTEM
              </span>
            </div>
            <Sparkles className="relative w-8 h-8 text-yellow-400 animate-pulse" />
          </div>

          <div className="relative max-w-4xl mx-auto mb-16 group">
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-75 blur-xl transition-opacity" />

            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-t-[40px] border-t-white" />
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-0 h-0 border-l-[26px] border-l-transparent border-r-[26px] border-r-transparent border-t-[36px] border-t-black" />
            </div>

            <div className="relative bg-white text-black p-10 md:p-12 rounded-2xl border-8 border-black shadow-2xl transform group-hover:scale-105 transition-transform">
              <div className="absolute top-4 right-4 flex gap-2">
                <div className="w-3 h-3 bg-purple-600 rounded-full animate-pulse" />
                <div
                  className="w-3 h-3 bg-purple-600 rounded-full animate-pulse"
                  style={{ animationDelay: "200ms" }}
                />
                <div
                  className="w-3 h-3 bg-purple-600 rounded-full animate-pulse"
                  style={{ animationDelay: "400ms" }}
                />
              </div>
              <p className="text-2xl md:text-4xl font-black italic leading-relaxed">
                "Where <span className="text-purple-600">Stories</span>,{" "}
                <span className="text-pink-600">Characters</span>, and{" "}
                <span className="text-cyan-600">AI</span> collide to create the
                future of manga..."
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
            <div className="group relative">
              <div className="absolute inset-0 bg-purple-600 blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-gradient-to-br from-black to-gray-900 border-4 border-white rounded-xl p-6 transform group-hover:scale-105 group-hover:-rotate-2 transition-all shadow-2xl">
                <Zap className="w-12 h-12 text-white mx-auto mb-3" />
                <p className="text-2xl font-black text-white mb-2">CREATE</p>
                <span className="inline-block px-3 py-1 text-xs font-bold bg-purple-500 text-white rounded-full">
                  LIVE
                </span>
              </div>
            </div>
            <div className="group relative" style={{ animationDelay: "100ms" }}>
              <div className="absolute inset-0 bg-indigo-600 blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-gradient-to-br from-black to-gray-900 border-4 border-white rounded-xl p-6 transform group-hover:scale-105 group-hover:-rotate-2 transition-all shadow-2xl">
                <Users className="w-12 h-12 text-white mx-auto mb-3" />
                <p className="text-2xl font-black text-white mb-2">CONNECT</p>
                <span className="inline-block px-3 py-1 text-xs font-bold bg-indigo-500 text-white rounded-full">
                  SOON
                </span>
              </div>
            </div>
            <div className="group relative" style={{ animationDelay: "200ms" }}>
              <div className="absolute inset-0 bg-violet-600 blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-gradient-to-br from-black to-gray-900 border-4 border-white rounded-xl p-6 transform group-hover:scale-105 group-hover:-rotate-2 transition-all shadow-2xl">
                <Gamepad2 className="w-12 h-12 text-white mx-auto mb-3" />
                <p className="text-2xl font-black text-white mb-2">PLAY</p>
                <span className="inline-block px-3 py-1 text-xs font-bold bg-violet-500 text-white rounded-full">
                  FUTURE
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 animate-bounce">
            <div className="text-purple-400 font-bold tracking-widest text-sm">
              SCROLL TO BEGIN
            </div>
            <div className="w-8 h-12 border-4 border-purple-500 rounded-full flex justify-center pt-2">
              <div className="w-2 h-4 bg-purple-500 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Chapter 1: Studio */}
      <section
        id="section-studio"
        className={`relative py-32 transition-all duration-1000 ${
          isVisible["section-studio"]
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-20"
        }`}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-6 mb-16">
              <div className="relative group">
                <div className="absolute inset-0 bg-purple-600 blur-xl opacity-75" />
                <div className="relative bg-black border-4 border-white px-8 py-4 transform -skew-x-12 shadow-2xl">
                  <span className="text-purple-400 font-black text-lg tracking-widest">
                    CHAPTER 01
                  </span>
                </div>
              </div>
              <div className="h-1 flex-1 bg-gradient-to-r from-purple-500 to-transparent" />
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div>
                  <h2 className="text-6xl md:text-8xl font-black leading-none mb-6">
                    <span
                      className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400"
                      style={{
                        textShadow: "0 0 80px rgba(168, 85, 247, 0.8)",
                      }}
                    >
                      THE
                    </span>
                    <span className="block text-white mt-2">CREATOR'S</span>
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mt-2">
                      STUDIO
                    </span>
                  </h2>

                  <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 rounded-full border-4 border-white shadow-2xl">
                    <Radio className="w-5 h-5 text-white animate-pulse" />
                    <span className="text-white font-black text-lg tracking-wider">
                      LIVE NOW
                    </span>
                    <div className="w-3 h-3 bg-white rounded-full animate-ping" />
                  </div>
                </div>

                <ComicPanel className="group">
                  <div className="p-8 bg-gradient-to-br from-purple-900 to-black">
                    <div className="flex items-start gap-4 mb-4">
                      <BookOpen className="w-8 h-8 text-purple-400 flex-shrink-0 mt-1" />
                      <p className="text-xl text-purple-100 leading-relaxed">
                        <span className="font-black text-2xl text-white">
                          "The Genesis Point."
                        </span>
                        <br />
                        Chat with an intelligent AI agent to forge characters,
                        craft intricate worlds, and generate cinematic manga
                        panels with unprecedented detail.
                      </p>
                    </div>
                  </div>
                </ComicPanel>

                <div className="grid grid-cols-2 gap-4">
                  <div className="group relative">
                    <div className="absolute inset-0 bg-purple-600 blur-lg opacity-0 group-hover:opacity-75 transition-opacity" />
                    <div className="relative bg-gradient-to-br from-purple-900/50 to-black border-2 border-purple-500 rounded-lg p-4 backdrop-blur-sm">
                      <div className="text-3xl mb-2">✨</div>
                      <div className="font-black text-white text-lg">
                        AI Agent
                      </div>
                      <div className="text-purple-300 text-sm">
                        Intelligent creator
                      </div>
                    </div>
                  </div>
                  <div className="group relative">
                    <div className="absolute inset-0 bg-purple-600 blur-lg opacity-0 group-hover:opacity-75 transition-opacity" />
                    <div className="relative bg-gradient-to-br from-purple-900/50 to-black border-2 border-purple-500 rounded-lg p-4 backdrop-blur-sm">
                      <div className="text-3xl mb-2">🎭</div>
                      <div className="font-black text-white text-lg">
                        Characters
                      </div>
                      <div className="text-purple-300 text-sm">
                        Unique designs
                      </div>
                    </div>
                  </div>
                  <div className="group relative">
                    <div className="absolute inset-0 bg-purple-600 blur-lg opacity-0 group-hover:opacity-75 transition-opacity" />
                    <div className="relative bg-gradient-to-br from-purple-900/50 to-black border-2 border-purple-500 rounded-lg p-4 backdrop-blur-sm">
                      <div className="text-3xl mb-2">🎬</div>
                      <div className="font-black text-white text-lg">
                        Scenes
                      </div>
                      <div className="text-purple-300 text-sm">
                        Cinematic panels
                      </div>
                    </div>
                  </div>
                  <div className="group relative">
                    <div className="absolute inset-0 bg-purple-600 blur-lg opacity-0 group-hover:opacity-75 transition-opacity" />
                    <div className="relative bg-gradient-to-br from-purple-900/50 to-black border-2 border-purple-500 rounded-lg p-4 backdrop-blur-sm">
                      <div className="text-3xl mb-2">💬</div>
                      <div className="font-black text-white text-lg">
                        Dialogue
                      </div>
                      <div className="text-purple-300 text-sm">
                        Natural flow
                      </div>
                    </div>
                  </div>
                </div>

                <a
                  href="https://studio.mangaai.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-block"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity animate-pulse" />
                  <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white px-12 py-6 rounded-2xl font-black text-2xl md:text-3xl transform group-hover:scale-110 transition-all shadow-2xl border-4 border-white flex items-center gap-4">
                    <span>ENTER THE STUDIO</span>
                    <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                  </div>
                </a>
              </div>

              <div className="relative">
                <ComicPanel className="group transform hover:scale-105 transition-transform">
                  <div className="bg-gradient-to-br from-purple-900 via-black to-purple-900 overflow-hidden">
                    <img
                      src="/images/studio.png"
                      alt="MangaAI Studio Interface"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </ComicPanel>

                <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-4xl border-4 border-white shadow-2xl animate-bounce">
                  ⚡
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chapter 2: Social */}
      <section
        id="section-social"
        className={`relative py-32 transition-all duration-1000 ${
          isVisible["section-social"]
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-20"
        }`}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-6 mb-16">
              <div className="h-1 flex-1 bg-gradient-to-r from-transparent to-indigo-500" />
              <div className="relative group">
                <div className="absolute inset-0 bg-indigo-600 blur-xl" />
                <div className="relative bg-black border-4 border-indigo-500 px-8 py-4 transform skew-x-12 shadow-2xl">
                  <span className="text-indigo-400 font-black text-lg tracking-widest">
                    CHAPTER 02
                  </span>
                </div>
              </div>
              <div className="h-1 flex-1 bg-gradient-to-l from-transparent to-indigo-500" />
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative">
                <ComicPanel>
                  <div className="bg-gradient-to-br from-indigo-950 to-black p-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                      <div className="text-center">
                        <Lock className="w-24 h-24 text-indigo-400/50 mx-auto mb-6 animate-pulse" />
                        <div className="bg-indigo-900/50 border-2 border-indigo-500/50 rounded-full px-8 py-3 inline-block">
                          <span className="text-indigo-300 font-black text-xl tracking-wider">
                            AWAKENING SOON
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="bg-indigo-950/50 border border-indigo-500/30 rounded-lg p-4"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full" />
                            <div className="flex-1">
                              <div className="h-3 bg-indigo-500/30 rounded w-32 mb-1" />
                              <div className="h-2 bg-indigo-500/20 rounded w-20" />
                            </div>
                          </div>
                          <div className="h-32 bg-indigo-900/30 rounded mb-2" />
                          <div className="h-2 bg-indigo-500/20 rounded w-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                </ComicPanel>

                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-cyan-600 px-8 py-4 rounded-full border-4 border-white shadow-2xl">
                  <span className="text-white font-black text-lg tracking-wider">
                    NEXT ARC
                  </span>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h2 className="text-6xl md:text-8xl font-black leading-none mb-6">
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-500 to-indigo-400">
                      THE
                    </span>
                    <span className="block text-white mt-2">SOCIAL</span>
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-indigo-600 mt-2">
                      REALM
                    </span>
                  </h2>
                </div>

                <ComicPanel>
                  <div className="p-8 bg-gradient-to-br from-indigo-900/50 to-black">
                    <p className="text-xl text-indigo-100 leading-relaxed">
                      <span className="font-black text-2xl text-white/70">
                        "A World Awakening..."
                      </span>
                      <br />
                      Soon, creators and AI characters will inhabit living manga
                      universes. Post stories, share art, and explore
                      Spacetoon-inspired themed worlds where your creations come
                      to life.
                    </p>
                  </div>
                </ComicPanel>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: "🌐", title: "Universe Worlds" },
                    { icon: "👥", title: "AI Characters" },
                    { icon: "📱", title: "Social Feed" },
                    { icon: "🎨", title: "Gallery" },
                  ].map((feature, i) => (
                    <div key={i} className="relative">
                      <div className="bg-gradient-to-br from-indigo-900/30 to-black border-2 border-indigo-500/30 rounded-lg p-4">
                        <div className="text-3xl mb-2 grayscale">
                          {feature.icon}
                        </div>
                        <div className="font-black text-white/50 text-lg">
                          {feature.title}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="relative inline-block cursor-not-allowed">
                  <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-indigo-300 px-12 py-6 rounded-2xl font-black text-2xl md:text-3xl shadow-2xl border-4 border-indigo-600/50 flex items-center gap-4">
                    <Lock className="w-8 h-8" />
                    <span>LOCKED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chapter 3: Game */}
      <section
        id="section-game"
        className={`relative py-32 transition-all duration-1000 ${
          isVisible["section-game"]
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-20"
        }`}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-6 mb-16">
              <div className="relative group">
                <div className="absolute inset-0 bg-violet-600 blur-xl" />
                <div className="relative bg-black border-4 border-violet-500 px-8 py-4 transform -skew-x-12 shadow-2xl">
                  <span className="text-violet-400 font-black text-lg tracking-widest">
                    CHAPTER 03
                  </span>
                </div>
              </div>
              <div className="h-1 flex-1 bg-gradient-to-r from-violet-500 to-transparent" />
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div>
                  <h2 className="text-6xl md:text-8xl font-black leading-none mb-6">
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-400/50 via-fuchsia-500/50 to-violet-400/50">
                      THE
                    </span>
                    <span className="block text-white/30 mt-2">GAME</span>
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500/50 to-violet-600/50 mt-2">
                      FRONTIER
                    </span>
                  </h2>
                </div>

                <ComicPanel>
                  <div className="p-8 bg-gradient-to-br from-violet-900/30 to-black">
                    <p className="text-xl text-violet-100/50 leading-relaxed">
                      <span className="font-black text-2xl text-white/30">
                        "Beyond The Horizon..."
                      </span>
                      <br />A realm still shrouded in mystery. Transform your
                      manga stories into interactive adventures and playable
                      worlds powered by AI.
                    </p>
                  </div>
                </ComicPanel>

                <div className="inline-flex items-center gap-3 bg-violet-900 border-2 border-violet-500 px-6 py-3 rounded-full">
                  <div className="w-3 h-3 bg-violet-400/30 rounded-full animate-pulse" />
                  <span className="text-violet-400/50 font-black text-lg tracking-wider">
                    TO BE CONTINUED
                  </span>
                </div>

                <div className="text-center p-8 border-2 border-violet-500 rounded-lg bg-black">
                  <p className="text-violet-400/30 text-2xl font-black mb-2">
                    ［ CLASSIFIED ］
                  </p>
                  <p className="text-violet-500/20 text-sm tracking-widest">
                    Information Sealed
                  </p>
                </div>
              </div>

              <div className="relative hover:opacity-90 transition-opacity">
                <ComicPanel>
                  <div className="bg-gradient-to-br from-violet-950/30 to-black p-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-8xl mb-6 opacity-20">🎮</div>
                        <div className="text-violet-400/20 text-3xl font-black mb-4">
                          ？？？
                        </div>
                        <div className="text-violet-500/20 text-sm tracking-widest">
                          COMING SOON
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 opacity-10">
                      <div className="bg-violet-950/30 border border-violet-500/20 rounded-lg p-4 h-48" />
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="bg-violet-950/20 border border-violet-500/10 rounded p-2 h-20"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </ComicPanel>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Universe Finale */}
      <section
        id="section-universe"
        className={`relative py-40 transition-all duration-1000 ${
          isVisible["section-universe"]
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-20"
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 via-black to-black" />
        <div className="absolute inset-0 bg-gradient-radial from-purple-600/20 via-transparent to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            <div className="mb-16">
              <div className="relative inline-block">
                <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 opacity-50 animate-pulse" />
                <h2 className="relative text-5xl md:text-7xl font-black mb-4">
                  <span
                    className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400"
                    style={{
                      textShadow: "0 0 80px rgba(168, 85, 247, 0.8)",
                    }}
                  >
                    THE MANGAAI UNIVERSE
                  </span>
                </h2>
              </div>
              <div className="w-32 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto" />
            </div>

            <div className="relative max-w-4xl mx-auto mb-20 group">
              <div className="absolute -inset-6 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-3xl opacity-0 group-hover:opacity-75 blur-2xl transition-opacity" />

              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                <div className="w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-t-[50px] border-t-white" />
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-0 h-0 border-l-[36px] border-l-transparent border-r-[36px] border-r-transparent border-t-[46px] border-t-black" />
              </div>

              <div className="relative bg-white text-black p-12 md:p-16 rounded-3xl border-8 border-black shadow-2xl transform group-hover:scale-105 transition-transform">
                <p className="text-3xl md:text-5xl font-black italic leading-relaxed">
                  "A world where{" "}
                  <span className="text-purple-600">stories</span>,{" "}
                  <span className="text-pink-600">characters</span>, and{" "}
                  <span className="text-cyan-600">AI</span> come alive."
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-20 mt-32">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-black border-4 border-white rounded-2xl p-8 transform group-hover:scale-105 group-hover:-rotate-2 transition-all shadow-2xl">
                  <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full border-4 border-white shadow-lg">
                    <span className="text-xs font-black">LIVE</span>
                  </div>

                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center border-4 border-white shadow-xl">
                    <Zap className="w-10 h-10 text-white" />
                  </div>

                  <h3 className="text-3xl font-black text-white mb-2">
                    CREATE
                  </h3>
                  <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
                    Studio
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    Forge your manga with AI-powered precision and cinematic
                    quality
                  </p>
                </div>
              </div>

              <div className="group relative opacity-70">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-cyan-600 blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-black border-4 border-white rounded-2xl p-8 transform group-hover:scale-105 group-hover:-rotate-2 transition-all shadow-2xl">
                  <div className="absolute -top-4 -right-4 bg-indigo-500 text-white px-4 py-2 rounded-full border-4 border-white shadow-lg">
                    <span className="text-xs font-black">SOON</span>
                  </div>

                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center border-4 border-white shadow-xl">
                    <Users className="w-10 h-10 text-white" />
                  </div>

                  <h3 className="text-3xl font-black text-white mb-2">
                    CONNECT
                  </h3>
                  <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600 mb-4">
                    Social
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    Share in living manga worlds with creators and AI characters
                  </p>
                </div>
              </div>

              <div className="group relative opacity-40">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-fuchsia-600 blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-black border-4 border-white rounded-2xl p-8 transform group-hover:scale-105 group-hover:-rotate-2 transition-all shadow-2xl">
                  <div className="absolute -top-4 -right-4 bg-violet-500 text-white px-4 py-2 rounded-full border-4 border-white shadow-lg">
                    <span className="text-xs font-black">FUTURE</span>
                  </div>

                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center border-4 border-white shadow-xl">
                    <Gamepad2 className="w-10 h-10 text-white" />
                  </div>

                  <h3 className="text-3xl font-black text-white mb-2">PLAY</h3>
                  <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 mb-4">
                    Game
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    Transform stories into interactive adventures
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mb-12">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent max-w-xs" />
              <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-purple-500 to-transparent max-w-xs" />
            </div>

            <p className="text-2xl text-purple-300 mb-12 font-semibold">
              Begin your journey in the Studio.
              <br />
              <span className="text-purple-400/70">
                The rest of the universe awaits...
              </span>
            </p>

            <a
              href="https://studio.mangaai.app"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-block"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-2xl blur-2xl opacity-75 group-hover:opacity-100 transition-opacity animate-pulse" />
              <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white px-16 py-8 rounded-2xl font-black text-3xl md:text-4xl transform group-hover:scale-110 transition-all shadow-2xl border-4 border-white flex items-center gap-6">
                <Sparkles className="w-10 h-10" />
                <span>START YOUR STORY</span>
                <ArrowRight className="w-10 h-10 group-hover:translate-x-3 transition-transform" />
              </div>
            </a>

            <div className="mt-20 flex flex-wrap justify-center gap-4 text-sm">
              <a
                href="https://studio.mangaai.app"
                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                studio.mangaai.app
              </a>
              <span className="text-purple-600">•</span>
              <span className="text-purple-600/50">
                social.mangaai.app (soon)
              </span>
              <span className="text-purple-600">•</span>
              <span className="text-purple-600/30">
                game.mangaai.app (future)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-purple-900/30 py-12 bg-black/80 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6">
              <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                MangaAI
              </h3>
              <p className="text-purple-400/70">
                Where AI brings manga to life
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
              <a
                href="https://studio.mangaai.app"
                className="text-purple-400 hover:text-purple-300 transition-colors font-semibold"
              >
                Studio
              </a>
              <span className="text-purple-600/50">Social (Coming Soon)</span>
              <span className="text-purple-600/30">Game (Future)</span>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent mb-8" />

            <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm">
              <Link
                to="/privacy-policy"
                className="text-purple-400 hover:text-purple-300 transition-colors font-semibold"
              >
                Privacy Policy
              </Link>
              <span className="text-purple-600/50">•</span>
              <Link
                to="/terms-and-conditions"
                className="text-purple-400 hover:text-purple-300 transition-colors font-semibold"
              >
                Terms & Conditions
              </Link>
            </div>

            <p className="text-purple-500/50 text-sm">
              © 2025 MangaAI Ecosystem. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MangaAILanding;
