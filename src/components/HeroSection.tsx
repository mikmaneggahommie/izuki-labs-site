"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { assetPath } from "@/lib/asset-path";

type HeroCard = {
  src: string;
  alt: string;
};

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
  travelX: number;
  travelY: number;
};

const heroUnits: HeroCard[][] = [
  [
    { src: "/images/1.JPG", alt: "Editorial surface artwork" },
    { src: "/images/2.jpg", alt: "Campaign detail artwork" },
    { src: "/images/6.jpg", alt: "Launch artwork" },
    { src: "/images/4.jpg", alt: "Brand composition artwork" },
    { src: "/images/5.jpg", alt: "Poster layout artwork" },
    { src: "/images/3.jpg", alt: "Mobile system artwork" },
  ],
  [
    { src: "/images/7.jpg", alt: "Luminous motion artwork" },
    { src: "/images/5.jpg", alt: "Print layout artwork" },
    { src: "/images/2.jpg", alt: "Feed design artwork" },
    { src: "/images/4.jpg", alt: "Graphic composition artwork" },
    { src: "/images/1.JPG", alt: "Brand motion artwork" },
    { src: "/images/6.jpg", alt: "Immersive launch artwork" },
  ],
];

const getStackState = (index: number): CardState => ({
  x: 0,
  y: 0,
  z: -index * 10,
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
});

const getFanState = (
  index: number,
  count: number,
  metrics: LoopMetrics
): CardState => {
  const trailIndex = count - 1 - index;

  return {
    x: -trailIndex * metrics.diagonalX,
    y: -trailIndex * metrics.diagonalY,
    z: -trailIndex * 24,
    rotationX: trailIndex === 0 ? 0 : 1.4,
    rotationY: trailIndex === 0 ? 0 : -10,
    rotationZ: trailIndex === 0 ? 0 : 4.5,
  };
};

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
      if (!active) {
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
        state: (index: number, count: number, metrics: LoopMetrics) => CardState,
        metrics: LoopMetrics
      ) => {
        cards.forEach((card, index) => {
          const values = state(index, cards.length, metrics);

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

        const stageBounds = stageRef.current?.getBoundingClientRect();
        const cardBounds = firstCards[firstCards.length - 1].getBoundingClientRect();

        if (!stageBounds || !cardBounds.width || !cardBounds.height) {
          return;
        }

        const metrics: LoopMetrics = {
          diagonalX: Math.max(
            cardBounds.width * 0.64,
            Math.min(stageBounds.width * 0.2, cardBounds.width * 0.86)
          ),
          diagonalY: Math.max(
            cardBounds.height * 0.18,
            Math.min(stageBounds.height * 0.19, cardBounds.height * 0.3)
          ),
          travelX: 0,
          travelY: 0,
        };

        metrics.travelX = metrics.diagonalX * firstCards.length;
        metrics.travelY = metrics.diagonalY * firstCards.length;

        setCards(firstCards, (index) => getStackState(index), metrics);
        setCards(secondCards, getFanState, metrics);

        gsap.set(firstUnit, { x: 0, y: 0, autoAlpha: 1 });
        gsap.set(secondUnit, {
          x: metrics.travelX,
          y: metrics.travelY,
          autoAlpha: 1,
        });

        timeline = gsap.timeline({ repeat: -1 });

        timeline
          .to({}, { duration: 0.85 })
          .to(
            firstCards,
            {
              x: (index) => getFanState(index, firstCards.length, metrics).x,
              y: (index) => getFanState(index, firstCards.length, metrics).y,
              z: (index) => getFanState(index, firstCards.length, metrics).z,
              rotationX: (index) =>
                getFanState(index, firstCards.length, metrics).rotationX,
              rotationY: (index) =>
                getFanState(index, firstCards.length, metrics).rotationY,
              rotationZ: (index) =>
                getFanState(index, firstCards.length, metrics).rotationZ,
              duration: 0.96,
              ease: "expo.out",
              stagger: { each: 0.06, from: "end" },
            },
            "fan-a"
          )
          .to({}, { duration: 0.16 })
          .to(
            firstUnit,
            {
              x: -metrics.travelX,
              y: -metrics.travelY,
              duration: 1.72,
              ease: "power2.inOut",
            },
            "slide-a"
          )
          .to(
            secondUnit,
            {
              x: 0,
              y: 0,
              duration: 1.72,
              ease: "power2.inOut",
            },
            "slide-a"
          )
          .to(
            secondCards,
            {
              x: (index) => getStackState(index).x,
              y: (index) => getStackState(index).y,
              z: (index) => getStackState(index).z,
              rotationX: 0,
              rotationY: 0,
              rotationZ: 0,
              duration: 0.78,
              ease: "expo.out",
              stagger: { each: 0.05, from: "start" },
            },
            "slide-a+=0.9"
          )
          .to({}, { duration: 0.55 })
          .set(
            firstCards,
            {
              x: (index) => getFanState(index, firstCards.length, metrics).x,
              y: (index) => getFanState(index, firstCards.length, metrics).y,
              z: (index) => getFanState(index, firstCards.length, metrics).z,
              rotationX: (index) =>
                getFanState(index, firstCards.length, metrics).rotationX,
              rotationY: (index) =>
                getFanState(index, firstCards.length, metrics).rotationY,
              rotationZ: (index) =>
                getFanState(index, firstCards.length, metrics).rotationZ,
            },
            "reset-a"
          )
          .set(
            firstUnit,
            {
              x: metrics.travelX,
              y: metrics.travelY,
            },
            "reset-a"
          )
          .to(
            secondCards,
            {
              x: (index) => getFanState(index, secondCards.length, metrics).x,
              y: (index) => getFanState(index, secondCards.length, metrics).y,
              z: (index) => getFanState(index, secondCards.length, metrics).z,
              rotationX: (index) =>
                getFanState(index, secondCards.length, metrics).rotationX,
              rotationY: (index) =>
                getFanState(index, secondCards.length, metrics).rotationY,
              rotationZ: (index) =>
                getFanState(index, secondCards.length, metrics).rotationZ,
              duration: 0.96,
              ease: "expo.out",
              stagger: { each: 0.06, from: "end" },
            },
            "fan-b"
          )
          .to({}, { duration: 0.16 })
          .to(
            secondUnit,
            {
              x: -metrics.travelX,
              y: -metrics.travelY,
              duration: 1.72,
              ease: "power2.inOut",
            },
            "slide-b"
          )
          .to(
            firstUnit,
            {
              x: 0,
              y: 0,
              duration: 1.72,
              ease: "power2.inOut",
            },
            "slide-b"
          )
          .to(
            firstCards,
            {
              x: (index) => getStackState(index).x,
              y: (index) => getStackState(index).y,
              z: (index) => getStackState(index).z,
              rotationX: 0,
              rotationY: 0,
              rotationZ: 0,
              duration: 0.78,
              ease: "expo.out",
              stagger: { each: 0.05, from: "start" },
            },
            "slide-b+=0.9"
          )
          .to({}, { duration: 0.55 })
          .set(
            secondCards,
            {
              x: (index) => getFanState(index, secondCards.length, metrics).x,
              y: (index) => getFanState(index, secondCards.length, metrics).y,
              z: (index) => getFanState(index, secondCards.length, metrics).z,
              rotationX: (index) =>
                getFanState(index, secondCards.length, metrics).rotationX,
              rotationY: (index) =>
                getFanState(index, secondCards.length, metrics).rotationY,
              rotationZ: (index) =>
                getFanState(index, secondCards.length, metrics).rotationZ,
            },
            "reset-b"
          )
          .set(
            secondUnit,
            {
              x: metrics.travelX,
              y: metrics.travelY,
            },
            "reset-b"
          );
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
          <h1 className="hero-wordmark" aria-label="Izuki Labs">
            <span className="hero-wordmark-line">
              <span>IZUKI</span>
              <span className="hero-wordmark-dot" aria-hidden />
            </span>
            <span className="hero-wordmark-line">LABS</span>
          </h1>
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
                  style={{
                    zIndex: cardIndex + 1,
                  }}
                >
                  <Image
                    src={assetPath(card.src)}
                    alt={card.alt}
                    fill
                    priority={unitIndex === 0 && cardIndex === unit.length - 1}
                    sizes="(max-width: 767px) 42vw, (max-width: 1023px) 28vw, 360px"
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
