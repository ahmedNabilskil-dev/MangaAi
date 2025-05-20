"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  ChevronRight,
  Eye,
  EyeOff,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";

export default function InteractiveStorybook() {
  const [isMobile, setIsMobile] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [pages, setPages] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showText, setShowText] = useState(true);
  const bookRef = useRef<any>(null);
  const mobileContainerRef = useRef<HTMLDivElement>(null);

  // Check if mobile and handle resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Calculate dimensions
  useEffect(() => {
    const updateDimensions = () => {
      const padding = isMobile ? 40 : 80;
      const width = Math.min(window.innerWidth * (isMobile ? 0.95 : 0.8), 900);
      const height = window.innerHeight - padding;
      setDimensions({ width, height });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [isMobile]);

  // Prepare content
  useEffect(() => {
    const prepareContent = () => {
      // Cover page
      const coverPage = {
        type: "cover",
        title: "The Clockwork Garden",
        subtitle: "An Enchanting Tale of Magic and Mechanics",
        image: "/images/projects/5.jpg",
        bgColor: "bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900",
      };

      // End page
      const endPage = {
        type: "end",
        title: "The End",
        subtitle: "Thank you for exploring the Clockwork Garden",
        image: "/images/projects/5.jpg",
        bgColor: "bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900",
      };

      // Combine all pages
      const allPages = [coverPage, ...storyContent, endPage];
      setPages(allPages);
      setIsLoading(false);
    };

    const timer = setTimeout(() => {
      prepareContent();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Mobile scroll handler
  useEffect(() => {
    if (!isMobile || !mobileContainerRef.current) return;

    const handleScroll = () => {
      const container = mobileContainerRef.current;
      if (!container) return;

      const scrollPosition = container.scrollTop + container.clientHeight / 2;
      const pageElements = container.querySelectorAll(".mobile-page");

      pageElements.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        const elementMiddle = rect.top + rect.height / 2;

        if (Math.abs(scrollPosition - elementMiddle) < rect.height / 3) {
          setCurrentPage(index);
        }
      });
    };

    const container = mobileContainerRef.current;
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [isMobile, pages]);

  const toggleMusic = () => setIsMusicPlaying(!isMusicPlaying);
  const toggleText = () => setShowText(!showText);

  // Get background style for a page
  const getPageBackground = (page: any) => {
    if (page.image) {
      return {
        backgroundImage: `url('${page.image}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    return {
      background:
        page.bgColor || "bg-gradient-to-br from-slate-800 to-slate-900",
    };
  };

  // Render desktop flipbook
  const renderDesktopBook = () => {
    return (
      <HTMLFlipBook
        width={dimensions.width}
        height={dimensions.height}
        size="stretch"
        minWidth={300}
        maxWidth={900}
        minHeight={500}
        maxHeight={900}
        showCover={true}
        maxShadowOpacity={0.7}
        className="flipbook shadow-2xl"
        startPage={0}
        drawShadow={true}
        flippingTime={1000}
        usePortrait={true}
        mobileScrollSupport={true}
        swipeDistance={50}
        showPageCorners={false}
        disableFlipByClick={false}
        ref={bookRef}
        onFlip={(e) => setCurrentPage(e.data)}
        style={{
          "--color-brand": "rgba(251, 191, 36, 0.8)",
          "--color-page-edge": "rgba(30, 41, 59, 0.8)",
          "--color-shadow": "rgba(251, 191, 36, 0.3)",
        }}
      >
        {pages.map((page, index) => (
          <div
            key={`page-${index}`}
            className={`page relative overflow-hidden`}
            style={getPageBackground(page)}
          >
            {/* Page edge effect */}
            <div className="absolute inset-0 z-10 border-[1px] border-amber-900/20 pointer-events-none"></div>
            <div className="absolute left-0 top-0 bottom-0 w-[15px] bg-gradient-to-r from-amber-900/10 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-[15px] bg-gradient-to-l from-amber-900/10 to-transparent z-10 pointer-events-none"></div>

            {/* Text content overlay */}
            <AnimatePresence>
              {(showText || page.type === "cover" || page.type === "end") && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`absolute inset-0 ${
                    page.image ? "bg-black/40" : "bg-black/20"
                  } z-20 p-6 md:p-8 flex flex-col`}
                >
                  {page.type === "cover" ? (
                    <>
                      <motion.div
                        animate={{
                          rotate: [0, -5, 5, -3, 3, 0],
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          duration: 2,
                          ease: "easeInOut",
                          repeat: Infinity,
                          repeatDelay: 5,
                        }}
                        className="inline-block mb-6"
                      >
                        <Sparkles className="text-amber-400 w-12 h-12" />
                      </motion.div>
                      <h1 className="text-4xl md:text-6xl font-bold text-amber-100 mb-6 font-serif tracking-wide drop-shadow-lg">
                        {page.title}
                      </h1>
                      <p className="text-xl md:text-2xl text-amber-100 font-medium mb-8 drop-shadow-md">
                        {page.subtitle}
                      </p>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-amber-100 text-sm mt-12 animate-pulse drop-shadow"
                      >
                        Swipe or click to begin...
                      </motion.div>
                    </>
                  ) : page.type === "end" ? (
                    <>
                      <motion.h2
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring" }}
                        className="text-4xl md:text-5xl font-bold text-amber-100 mb-6 font-serif drop-shadow-lg"
                      >
                        {page.title}
                      </motion.h2>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-xl text-amber-100 mb-8 drop-shadow"
                      >
                        {page.subtitle}
                      </motion.p>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-amber-100 text-sm drop-shadow"
                      >
                        <button
                          onClick={() => bookRef.current?.pageFlip().flip(0)}
                          className="px-4 py-2 bg-amber-900/50 hover:bg-amber-800/60 rounded-md transition-colors border border-amber-800/50"
                        >
                          Read Again
                        </button>
                      </motion.div>
                    </>
                  ) : (
                    <>
                      <motion.h2
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-2xl md:text-3xl font-bold text-amber-100 mb-4 font-serif drop-shadow"
                      >
                        {page.title}
                      </motion.h2>
                      <div className="flex-grow overflow-y-auto">
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ staggerChildren: 0.05 }}
                          className="text-gray-100 leading-relaxed md:leading-loose whitespace-pre-line font-serif text-lg drop-shadow"
                        >
                          {page.content.split("\n").map((paragraph, i) => (
                            <motion.span
                              key={i}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="block mb-4"
                            >
                              {paragraph}
                            </motion.span>
                          ))}
                        </motion.p>
                      </div>
                      <div className="text-right text-sm text-amber-100/50 mt-2 drop-shadow">
                        {index}
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </HTMLFlipBook>
    );
  };

  // Render mobile scroll view
  const renderMobileView = () => {
    return (
      <div
        ref={mobileContainerRef}
        className="w-full h-full overflow-y-auto snap-y snap-mandatory scroll-smooth"
        style={{ height: dimensions.height }}
      >
        {pages.map((page, index) => (
          <motion.div
            key={`mobile-page-${index}`}
            className={`mobile-page w-full h-full snap-start relative`}
            style={getPageBackground(page)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* Overlay for better text readability */}
            <div
              className={`absolute inset-0 ${
                page.image ? "bg-black/50" : "bg-black/30"
              } flex flex-col p-6`}
            >
              {/* Cover page */}
              {page.type === "cover" && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <motion.div
                    animate={{
                      rotate: [0, -5, 5, -3, 3, 0],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 2,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatDelay: 5,
                    }}
                    className="mb-8"
                  >
                    <Sparkles className="text-amber-400 w-16 h-16" />
                  </motion.div>
                  <h1 className="text-5xl font-bold text-amber-100 mb-6 font-serif tracking-wide">
                    {page.title}
                  </h1>
                  <p className="text-2xl text-amber-100 font-medium mb-8">
                    {page.subtitle}
                  </p>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-amber-300 text-lg mt-12 animate-pulse flex items-center"
                  >
                    Scroll to continue{" "}
                    <ChevronRight className="ml-2 animate-bounce" />
                  </motion.div>
                </div>
              )}

              {/* End page */}
              {page.type === "end" && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <motion.h2
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring" }}
                    className="text-5xl font-bold text-amber-100 mb-6 font-serif"
                  >
                    {page.title}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl text-amber-100 mb-8"
                  >
                    {page.subtitle}
                  </motion.p>
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    onClick={() =>
                      mobileContainerRef.current?.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      })
                    }
                    className="px-6 py-3 bg-amber-900/70 hover:bg-amber-800/80 rounded-lg transition-colors border border-amber-800/50 text-xl"
                  >
                    Read Again
                  </motion.button>
                </div>
              )}

              {/* Content pages */}
              {!page.type && (
                <div className="h-full flex flex-col">
                  <motion.h2
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-bold text-amber-100 mb-6 font-serif"
                  >
                    {page.title}
                  </motion.h2>
                  <div className="flex-grow overflow-y-auto">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ staggerChildren: 0.05 }}
                      className="text-gray-100 leading-relaxed whitespace-pre-line font-serif text-xl"
                    >
                      {page.content.split("\n").map((paragraph, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="block mb-6"
                        >
                          {paragraph}
                        </motion.span>
                      ))}
                    </motion.p>
                  </div>
                  <div className="text-center text-lg text-amber-100/50 mt-4">
                    {index} / {pages.length - 1}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white relative overflow-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-slate-900 to-slate-800 -z-10"></div>

      {/* Loading Screen */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
              className="text-amber-400 mb-4"
            >
              <BookOpen size={48} />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl text-amber-200 font-serif"
            >
              Preparing your story...
            </motion.h2>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.5 }}
        className="fixed top-0 left-0 w-full bg-slate-900/90 backdrop-blur-sm z-10 flex justify-between items-center px-4 py-3 border-b border-amber-900/30 shadow-lg"
      >
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-xl md:text-2xl font-bold text-amber-400 flex items-center"
        >
          <BookOpen className="mr-2" />
          The Clockwork Garden
        </motion.h1>
        <div className="flex items-center gap-2">
          {!isMobile && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              onClick={toggleText}
              className="p-2 text-amber-400 hover:text-amber-300 rounded-full hover:bg-slate-800 transition-all transform hover:scale-110"
              aria-label={showText ? "Hide text" : "Show text"}
            >
              {showText ? <EyeOff size={20} /> : <Eye size={20} />}
            </motion.button>
          )}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            onClick={toggleMusic}
            className="p-2 text-amber-400 hover:text-amber-300 rounded-full hover:bg-slate-800 transition-all transform hover:scale-110"
            aria-label={isMusicPlaying ? "Mute music" : "Play music"}
          >
            {isMusicPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </motion.button>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="pt-16 pb-4 flex justify-center items-center min-h-screen">
        {dimensions.width > 0 && pages.length > 0 && (
          <>{isMobile ? renderMobileView() : renderDesktopBook()}</>
        )}
      </div>

      {/* Page Indicator - Desktop Only */}
      {!isMobile && pages.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-800/80 px-4 py-2 rounded-full text-sm text-amber-200 flex items-center backdrop-blur-sm border border-amber-900/30"
        >
          <span className="text-amber-400 mr-2">{currentPage + 1}</span>
          <span className="text-slate-400">/</span>
          <span className="ml-2">{pages.length}</span>
        </motion.div>
      )}

      {/* Background Music */}
      {isMusicPlaying && (
        <audio autoPlay loop>
          <source src="/audio/gentle-music.mp3" type="audio/mpeg" />
        </audio>
      )}
    </div>
  );
}

const storyContent = [
  {
    title: "The Discovery",
    content:
      "Eliza found the garden quite by accident. She had been exploring the forgotten corners of her grandfather's estate when she spotted an old brass key half-buried beneath the ivy. It was intricately designed, with tiny gears embedded within its bow.\n\nCurious, she pocketed the key and continued her exploration, eventually finding herself before a weathered stone wall covered in climbing roses. There, nearly invisible among the foliage, was a small keyhole.\n\n'I wonder,' she whispered, fitting the brass key into the lock. It turned with a satisfying click, and the hidden door swung open to reveal a most extraordinary sight.",
    image: "/images/hero-bg.png",
  },
  {
    title: "A Garden Unlike Any Other",
    content:
      "Beyond the door lay a garden unlike any Eliza had ever seen. Flowers of copper and brass swayed in the breeze, their petals catching the sunlight in brilliant flashes. Mechanical butterflies with gossamer wings of spun glass flitted from bloom to bloom, and in the center of it all stood an enormous clockwork tree, its leaves shimming with emerald light.\n\nEliza stepped forward in wonder, her footsteps causing ripples of soft, chiming music to spread throughout the garden as hidden mechanisms responded to her presence. She realized with a start that the entire garden was alive – but with gears and springs rather than soil and seeds.\n\n'Welcome,' whispered a voice like the rustling of metal leaves. 'We've been waiting for so long.'",
    image: "/images/hero-bg.png",
  },
  {
    title: "The Clockwork Keeper",
    content:
      "From behind the great tree emerged a figure that made Eliza gasp. It was a man – or rather, something like a man – made entirely of intricate brass mechanisms. Gears whirred softly where his heart should be, and his eyes glowed with a gentle blue light.\n\n'I am Magnus,' he said with a bow, 'keeper of the Clockwork Garden. And you, young one, must be a Thornfield.'\n\nEliza nodded, speechless. 'Eliza Thornfield. How did you know?'\n\nMagnus smiled, the metal of his face shifting seamlessly. 'Only a Thornfield can use the key. Your grandfather was the last to visit us, many years ago. He spoke of you often.'",
    image: "/images/hero-bg.png",
  },
  {
    title: "The Garden's Secret",
    content:
      "As they walked through the mechanical wonderland, Magnus explained the garden's origins. 'Your ancestors were not mere inventors, but something more – artificers who found the perfect balance between magic and mechanism. This garden was their greatest achievement, a place where the two worlds could exist in harmony.'\n\nEliza marveled at a fountain where water flowed upward in spirals before transforming into tiny birds that took flight. 'But why has it been kept secret?'\n\nMagnus's expression grew serious. 'Not everyone believes that magic and science should coexist. There are those who would seek to control or destroy what they don't understand. That is why the garden can only be accessed by those with Thornfield blood – those whose hearts are open to both worlds.'",
    image: "/images/hero-bg.png",
  },
  {
    title: "The Winding Key",
    content:
      "As they reached the center of the garden, Magnus led Eliza to a pedestal beneath the great clockwork tree. There, nestled in velvet, lay an enormous golden key.\n\n'The garden is winding down,' Magnus explained, his voice tinged with worry. 'Without regular attention, even the most perfect mechanisms eventually falter. Your grandfather was the last to wind it, and that was many seasons ago.'\n\nEliza understood immediately what was being asked of her. 'Show me how,' she said, reaching for the key.\n\nMagnus nodded gratefully and guided her to a hidden keyhole in the tree's trunk, disguised among the patterns of the bark.",
    image: "/images/golden-key.jpg",
  },
  {
    title: "Restoration",
    content:
      "With Magnus's guidance, Eliza inserted the heavy golden key and began to turn it. It was difficult at first, requiring all her strength, but gradually it became easier as long-dormant systems began to wake.\n\nAs she turned the key, music filled the air – a complex harmony of chimes, bells, and strings that seemed to emanate from the garden itself. The mechanical flowers stretched toward the sky, their colors becoming more vibrant. The clockwork creatures moved with renewed vigor.\n\n'Look!' Magnus exclaimed, pointing to the edges of the garden where tarnished and rusted areas were being overtaken by fresh, gleaming brass and copper, as though the garden were healing itself.",
    image: "/images/garden-revival.jpg",
  },
  {
    title: "The Garden Awakens",
    content:
      "With a final turn of the key, there came a resonant chime from deep within the great tree. The sound spread throughout the garden, and suddenly everything burst into full, magnificent life. Flowers that had been closed tight unfurled their petals, releasing clouds of glittering pollen that danced in the air. Mechanical birds sang complex melodies from the branches, and the pathways glowed with soft blue light.\n\n'You've done it,' Magnus said, his voice filled with awe. 'The garden is fully restored.'\n\nEliza smiled, watching as a mechanical fox with ruby eyes cautiously approached her, curious about this new visitor. All around her, the garden hummed with energy and purpose.",
    image: "/images/awakened-garden.jpg",
  },
  {
    title: "The Workshop",
    content:
      "Magnus led Eliza to a small cottage at the far end of the garden. Inside was a workshop filled with tools both familiar and strange – hammers and wrenches alongside crystal prisms and bottles of shimmering liquid.\n\n'This was your grandfather's workspace,' Magnus explained. 'And his father's before him, going back many generations. Here is where they maintained the garden and created new wonders to add to it.'\n\nEliza ran her fingers over the worktable, finding a half-finished project – a tiny mechanical hummingbird, its wings not yet attached. Beside it lay her grandfather's journal, filled with sketches and notes.\n\n'He always meant for you to find this place,' Magnus said softly. 'He said you had the perfect balance of logical mind and open heart.'",
    image: "/images/magical-workshop.jpg",
  },
  {
    title: "A New Caretaker",
    content:
      "As the sun began to set, painting the clockwork garden in hues of gold and amber, Magnus presented Eliza with a small brass compass.\n\n'This will always guide you back to the garden,' he explained. 'No matter where you are, it will show the way.'\n\nEliza accepted the gift, understanding its significance. 'You want me to be the new caretaker, don't you?'\n\nMagnus nodded. 'The garden needs a Thornfield. It always has. But the choice must be yours.'\n\nEliza thought of her life beyond the wall – the ordinary world of school and friends and predictable days. Then she looked around at the magical mechanical wonders surrounding her, at the perfect synthesis of artistry and engineering, magic and science.",
    image: "/images/brass-compass.jpg",
  },
  {
    title: "Two Worlds",
    content:
      "'I can belong to both worlds, can't I?' Eliza asked. 'I don't have to choose just one.'\n\nMagnus smiled. 'That is the great secret of the Thornfields. They have always lived between worlds, bringing the wonder of one into the other. Your grandfather crafted toys that seemed magical to ordinary children. He designed buildings that felt somehow alive. He brought the spirit of the garden into everything he created.'\n\nEliza nodded, her decision made. 'I'll come back. I'll learn. I'll keep the garden going.'\n\n'And perhaps,' Magnus added, 'you'll add your own creations to it someday.'",
    image: "/images/two-worlds.jpg",
  },
  {
    title: "Return to the Ordinary",
    content:
      "As twilight deepened, Eliza reluctantly prepared to leave. 'I should get back before I'm missed,' she explained. 'But I'll return tomorrow.'\n\nMagnus walked her to the hidden door. 'The garden will be waiting,' he assured her. 'And now that you've wound the key, it will thrive for some time.'\n\nBefore stepping through the doorway, Eliza turned back one last time. The garden was even more beautiful in the fading light, with gentle glows emanating from various flowers and creatures, creating a landscape of living constellations.\n\n'It's like a dream,' she whispered.\n\n'Yet entirely real,' Magnus replied. 'The best magic always is.'",
    image: "/images/garden-twilight.jpg",
  },
  {
    title: "The First Creation",
    content:
      "In the weeks that followed, Eliza divided her time between the ordinary world and the Clockwork Garden. Under Magnus's tutelage, she learned the basics of magical mechanics – how to repair the simpler creatures, how to polish and maintain the delicate flowers, and eventually, how to create something new.\n\nHer first creation was modest – a small mechanical mouse with whiskers of fine silver wire. As she placed the final gear and closed its tiny hinged back, Magnus showed her how to activate it with a drop of a special oil that shimmered with its own inner light.\n\nThe mouse's eyes lit up, glowing a soft amber, and it lifted its head, whiskers twitching as it looked up at its creator. Eliza laughed with delight as it scurried around her palm, its movements as natural as any living creature.",
    image: "/images/mechanical-mouse.jpg",
  },
  {
    title: "The Seasons Turn",
    content:
      "As summer turned to autumn, Eliza discovered that the garden changed with the seasons – not through decay, but through transformation. The copper flowers didn't wilt but rather folded themselves into intricate geometric patterns. The mechanical birds changed their songs to more melancholy tunes, and the great clockwork tree's leaves turned from emerald to ruby, still shimmering with inner light.\n\n'The garden reflects the natural world,' Magnus explained, 'but interprets it through mechanism and magic. Nothing dies here; it only changes form.'\n\nEliza found this deeply comforting as she watched the garden prepare for winter, knowing that beneath the stillness to come, gears would continue to turn, maintaining life until spring's return.",
    image: "/images/autumn-garden.jpg",
  },
  {
    title: "Winter's Challenge",
    content:
      "Winter brought a new challenge to the garden. A heavy snowfall in the outside world had damaged part of the garden's protective dome, allowing cold air to seep in – something the delicate mechanisms were not designed to endure.\n\nEliza found a section of the garden beginning to freeze, the gears of several flowers grinding to a halt as ice formed in their workings. Even Magnus moved more slowly, his joints stiffening in the unusual cold.\n\n'We must repair the dome,' he told her, 'but the tools we need are in the highest branches of the clockwork tree, and I cannot climb in this condition.'\n\nEliza looked up at the towering tree. It would be a difficult climb, but she knew the garden was depending on her.",
    image: "/images/winter-dome.jpg",
  },
  {
    title: "Climbing the Tree",
    content:
      "With determination, Eliza began to climb the great clockwork tree. Its branches shifted slightly to assist her, forming more stable footholds where she needed them, but the ascent was still treacherous. Halfway up, she looked down to see Magnus watching anxiously, and beyond him, the spreading frost that threatened the garden.\n\nFinally reaching the top, Eliza found what she sought – a small compartment built into the trunk containing a set of specialized tools and a small vial of golden liquid. Following Magnus's shouted instructions, she carefully made her way back down.\n\nTogether, they worked through the night, Eliza's smaller hands reaching into spaces Magnus couldn't access, applying the golden liquid – a kind of magical solder – to the cracks in the dome until the barrier was whole once more.",
    image: "/images/tree-climbing.jpg",
  },
  {
    title: "Secret Visitors",
    content:
      "As winter gave way to spring, Eliza made a surprising discovery. While tending to a patch of bell-shaped flowers near the garden wall, she heard voices from the other side – children's voices, full of wonder.\n\n'I tell you I saw it,' one voice insisted. 'A garden with flowers made of metal!'\n\n'That's impossible,' another replied, though with uncertainty.\n\nEliza realized that the recent storm must have temporarily thinned the magic that concealed the garden from ordinary eyes, allowing brief glimpses from the outside world. She approached Magnus with the news.\n\n'Is it so terrible if others know?' she asked. 'Must the garden remain hidden forever?'\n\nMagnus considered this thoughtfully. 'That,' he said finally, 'is a question each generation of Thornfields must answer for themselves.'",
    image: "/images/garden-glimpse.jpg",
  },
  {
    title: "A Difficult Decision",
    content:
      "The question of whether to share the garden preoccupied Eliza. On one hand, she understood the wisdom in protecting such a unique place from those who might not appreciate or respect it. On the other hand, she saw the joy and wonder it brought her, and imagined sharing that with others.\n\nAfter much contemplation, she reached a compromise. 'What if,' she proposed to Magnus, 'I were to create smaller versions of the garden? Not with all its magic, but with enough to inspire wonder. Like music boxes, or animated toys, or illustrated books that hint at what's possible when magic and mechanics combine.'\n\nMagnus's eyes glowed brighter. 'That is how the Thornfields have always operated – bringing pieces of our world into yours. It is a worthy tradition to continue.'",
    image: "/images/eliza-thinking.jpg",
  },
  {
    title: "The First Sharing",
    content:
      "Eliza's first creation for the outside world was a gift for her best friend Sarah – a small clockwork flower in a glass dome. Though it lacked the full magic of the garden's blooms, it still opened and closed with the sun, and played a gentle tune when touched.\n\nWhen Sarah asked how it worked, Eliza simply smiled and said, 'It's a special kind of mechanics. Perhaps someday I'll show you more.'\n\nThe delight in Sarah's eyes confirmed Eliza's decision. There was a way to share the wonder of the garden without exposing its secrets – through creations that straddled the line between the possible and the magical, inviting questions about what might exist beyond the world most people knew.",
    image: "/images/clockwork-flower-gift.jpg",
  },
  {
    title: "Legacy",
    content:
      "As spring blossomed both inside and outside the garden walls, Eliza sat with her grandfather's journal, adding her own observations and sketches alongside his. She felt a connection not just to him now, but to all the Thornfields who had come before, each adding their own unique contributions to the Clockwork Garden while bringing hints of its magic into the ordinary world.\n\n'I think I understand now,' she told Magnus as they watched her mechanical mouse play among the copper flowers. 'The garden isn't just a place to be preserved. It's a source of inspiration – a reminder that there's always more to the world than what we first perceive.'\n\nMagnus nodded. 'And that is why the garden chose you, just as it chose all the Thornfields before you. Because you see not just with your eyes, but with your heart and mind together.'",
    image: "/images/journal-legacy.jpg",
  },
  {
    title: "The Future Awaits",
    content:
      "On a perfect summer day, exactly one year after discovering the garden, Eliza brought her completed project to show Magnus – a detailed blueprint for a public clock tower, designed with subtle elements inspired by the garden. If built, it would stand in the town square, its mechanisms more intricate than necessary, its decorations hinting at deeper wonders for those observant enough to notice.\n\n'It will be my first gift to the town,' she explained, 'something that exists between the ordinary and the magical.'\n\nMagnus studied the plans with admiration. 'And so the legacy continues,' he said. 'The Clockwork Garden spreads its seeds into the world, one marvel at a time.'\n\nEliza smiled and turned her face to the sun, feeling the perfect balance of the garden all around her – part magic, part mechanics, and entirely wonderful. With the brass key in her pocket and endless possibilities before her, she knew her journey with the Clockwork Garden was only just beginning.",
    image: "/images/clocktower-blueprint.jpg",
  },
];
