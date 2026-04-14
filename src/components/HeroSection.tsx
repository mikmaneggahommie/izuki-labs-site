"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

type HeroCard = {
  src: string;
  alt: string;
};

const heroUnits: HeroCard[][] = [
  [
    {
      src: "/images/1.JPG",
      alt: "Portrait campaign artwork",
    },
    {
      src: "/images/2.jpg",
      alt: "Editorial campaign detail",
    },
    {
      src: "/images/3.jpg",
      alt: "Interface concept artwork",
    },
    {
      src: "/images/4.jpg",
      alt: "Blue composition artwork",
    },
  ],
  [
    {
      src: "/images/5.jpg",
      alt: "Glass stack concept artwork",
    },
    {
      src: "/images/6.jpg",
      alt: "AI launch artwork",
    },
    {
      src: "/images/7.jpg",
      alt: "Luminous abstract artwork",
    },
    {
      src: "/images/2.jpg",
      alt: "Mobile concept artwork",
    },
  ],
];

type CardState = {
  x: number;
  y: number;
  z: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
};

type LoopMetrics = {
  diagonalX: number;
  diagonalY: number;
  travelY: number;
};

const getStackState = (index: number): CardState => ({
  x: 0,
  y: 0,
  z: -index * 12,
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
});

const getFanState = (index: number, metrics: LoopMetrics): CardState => ({
  x: index * metrics.diagonalX,
  y: index * metrics.diagonalY,
  z: -index * 18,
  rotationX: index === 0 ? 0 : 1.5,
  rotationY: index === 0 ? 0 : -8,
  rotationZ: index === 0 ? 0 : 4,
});

export default function HeroSection() {
  const stageRef = useRef<HTMLDivElement>(null);
  const unitRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let active = true;
    let cleanup: (() => void) | undefined;

    const runAnimation = async () => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (reducedMotion.matches || !stageRef.current) {
        return;
      }

      const gsap = (await import("gsap")).default;
      if (!active || !stageRef.current) {
        return;
      }

      const [firstUnit, secondUnit] = unitRefs.current;
      if (!firstUnit || !secondUnit) {
        return;
      }

      const firstCards = Array.from(
        firstUnit.querySelectorAll<HTMLElement>("[data-card-index]")
      );
      const secondCards = Array.from(
        secondUnit.querySelectorAll<HTMLElement>("[data-card-index]")
      );

      if (!firstCards.length || !secondCards.length) {
        return;
      }

      let timeline: ReturnType<typeof gsap.timeline> | undefined;
      let resizeTimer: number | undefined;

      const setCards = (
        cards: HTMLElement[],
        state: (index: number, metrics: LoopMetrics) => CardState,
        metrics: LoopMetrics
      ) => {
        cards.forEach((card, index) => {
          const values = state(index, metrics);
          gsap.set(card, {
            x: values.x,
            y: values.y,
            z: values.z,
            rotationX: values.rotationX,
            rotationY: values.rotationY,
            rotationZ: values.rotationZ,
            transformPerspective: 1800,
            transformOrigin: "50% 50%",
            force3D: true,
          });
        });
      };

      const buildLoop = () => {
        timeline?.kill();

        const { width, height } = firstCards[0].getBoundingClientRect();
        if (!width || !height) {
          return;
        }

        const metrics: LoopMetrics = {
          diagonalX: Math.round(width * 0.34),
          diagonalY: Math.round(height * 0.235),
          travelY: Math.round(height + height * 0.235 * (firstCards.length - 1) - 18),
        };

        setCards(firstCards, (index) => getStackState(index), metrics);
        setCards(secondCards, getFanState, metrics);

        gsap.set(firstUnit, { x: 0, y: 0, autoAlpha: 1 });
        gsap.set(secondUnit, { x: 0, y: metrics.travelY, autoAlpha: 1 });

        timeline = gsap.timeline({ repeat: -1 });

        timeline
          .to({}, { duration: 0.95 })
          .to(
            firstCards.slice(1),
            {
              x: (index) => getFanState(index + 1, metrics).x,
              y: (index) => getFanState(index + 1, metrics).y,
              z: (index) => getFanState(index + 1, metrics).z,
              rotationX: (index) => getFanState(index + 1, metrics).rotationX,
              rotationY: (index) => getFanState(index + 1, metrics).rotationY,
              rotationZ: (index) => getFanState(index + 1, metrics).rotationZ,
              duration: 0.88,
              ease: "expo.out",
              stagger: 0.08,
            },
            "unstack-a"
          )
          .to({}, { duration: 0.28 })
          .to(
            firstUnit,
            {
              y: -metrics.travelY,
              duration: 1.55,
              ease: "none",
            },
            "push-a"
          )
          .to(
            secondUnit,
            {
              y: 0,
              duration: 1.55,
              ease: "none",
            },
            "push-a"
          )
          .to(
            secondCards.slice(1),
            {
              x: 0,
              y: 0,
              z: (index) => getStackState(index + 1).z,
              rotationX: 0,
              rotationY: 0,
              rotationZ: 0,
              duration: 0.74,
              ease: "expo.out",
              stagger: 0.07,
            },
            "push-a+=0.88"
          )
          .to({}, { duration: 0.78 })
          .set(
            firstCards,
            {
              x: (index) => getFanState(index, metrics).x,
              y: (index) => getFanState(index, metrics).y,
              z: (index) => getFanState(index, metrics).z,
              rotationX: (index) => getFanState(index, metrics).rotationX,
              rotationY: (index) => getFanState(index, metrics).rotationY,
              rotationZ: (index) => getFanState(index, metrics).rotationZ,
            },
            "reset-a"
          )
          .set(firstUnit, { x: 0, y: metrics.travelY }, "reset-a")
          .to(
            secondCards.slice(1),
            {
              x: (index) => getFanState(index + 1, metrics).x,
              y: (index) => getFanState(index + 1, metrics).y,
              z: (index) => getFanState(index + 1, metrics).z,
              rotationX: (index) => getFanState(index + 1, metrics).rotationX,
              rotationY: (index) => getFanState(index + 1, metrics).rotationY,
              rotationZ: (index) => getFanState(index + 1, metrics).rotationZ,
              duration: 0.88,
              ease: "expo.out",
              stagger: 0.08,
            },
            "unstack-b"
          )
          .to({}, { duration: 0.28 })
          .to(
            secondUnit,
            {
              y: -metrics.travelY,
              duration: 1.55,
              ease: "none",
            },
            "push-b"
          )
          .to(
            firstUnit,
            {
              y: 0,
              duration: 1.55,
              ease: "none",
            },
            "push-b"
          )
          .to(
            firstCards.slice(1),
            {
              x: 0,
              y: 0,
              z: (index) => getStackState(index + 1).z,
              rotationX: 0,
              rotationY: 0,
              rotationZ: 0,
              duration: 0.74,
              ease: "expo.out",
              stagger: 0.07,
            },
            "push-b+=0.88"
          )
          .to({}, { duration: 0.78 })
          .set(
            secondCards,
            {
              x: (index) => getFanState(index, metrics).x,
              y: (index) => getFanState(index, metrics).y,
              z: (index) => getFanState(index, metrics).z,
              rotationX: (index) => getFanState(index, metrics).rotationX,
              rotationY: (index) => getFanState(index, metrics).rotationY,
              rotationZ: (index) => getFanState(index, metrics).rotationZ,
            },
            "reset-b"
          )
          .set(secondUnit, { x: 0, y: metrics.travelY }, "reset-b");
      };

      buildLoop();

      const handleResize = () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(buildLoop, 120);
      };

      window.addEventListener("resize", handleResize);

      cleanup = () => {
        window.removeEventListener("resize", handleResize);
        window.clearTimeout(resizeTimer);
        timeline?.kill();
      };
    };

    void runAnimation();

    return () => {
      active = false;
      cleanup?.();
    };
  }, []);

  return (
    <section id="top" className="section-shell hero-shell">
      <div className="content-shell hero-viewport">
        <div className="hero-copy">
          <p className="hero-eyebrow">Social media direction, campaigns, and systems</p>
          <h1 className="hero-wordmark" aria-label="Izuki Labs">
            <span>IZUKI</span>
            <span>LABS</span>
          </h1>
          <p className="hero-description">
            Motion-first visual packages for brands that need a sharper presence
            across launches, content systems, and ongoing campaigns.
          </p>
        </div>

        <div
          ref={stageRef}
          className="hero-stage"
          aria-label="Automated portfolio animation"
        >
          {heroUnits.map((unit, unitIndex) => (
            <div
              key={`hero-unit-${unitIndex}`}
              ref={(node) => {
                unitRefs.current[unitIndex] = node;
              }}
              className="hero-unit"
            >
              {unit.map((card, cardIndex) => (
                <article
                  key={`${card.src}-${cardIndex}`}
                  className="hero-card"
                  data-card-index={cardIndex}
                  style={{ zIndex: unit.length - cardIndex }}
                >
                  <Image
                    src={card.src}
                    alt={card.alt}
                    fill
                    priority={unitIndex === 0 && cardIndex === 0}
                    sizes="(max-width: 767px) 42vw, (max-width: 1023px) 28vw, 340px"
                    className="hero-card-image"
                  />
                </article>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
