"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

type HeroCard = {
  src: string;
  alt: string;
};

const heroUnits: HeroCard[][] = [
  [
    { src: "/images/1.JPG", alt: "Editorial surface artwork" },
    { src: "/images/2.jpg", alt: "Campaign detail artwork" },
    { src: "/images/6.jpg", alt: "Launch artwork" },
    { src: "/images/4.jpg", alt: "Brand composition artwork" },
    { src: "/images/5.jpg", alt: "Poster layout artwork" },
  ],
  [
    { src: "/images/3.jpg", alt: "Mobile system artwork" },
    { src: "/images/5.jpg", alt: "Print layout artwork" },
    { src: "/images/7.jpg", alt: "Luminous motion artwork" },
    { src: "/images/2.jpg", alt: "Feed design artwork" },
    { src: "/images/4.jpg", alt: "Graphic composition artwork" },
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
  centerOffset: number;
  diagonalX: number;
  diagonalY: number;
  travelY: number;
};

const getStackState = (index: number): CardState => ({
  x: 0,
  y: 0,
  z: -index * 8,
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
});

const getFanState = (index: number, metrics: LoopMetrics): CardState => {
  const delta = index - metrics.centerOffset;

  return {
    x: delta * metrics.diagonalX,
    y: delta * metrics.diagonalY,
    z: -Math.abs(delta) * 22,
    rotationX: delta === 0 ? 0 : 1.25,
    rotationY: delta === 0 ? 0 : -8,
    rotationZ: delta === 0 ? 0 : 4,
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
          centerOffset: (firstCards.length - 1) / 2,
          diagonalX: Math.round(width * 0.27),
          diagonalY: Math.round(height * 0.19),
          travelY: Math.round(height + height * 0.19 * (firstCards.length - 1) - 20),
        };

        setCards(firstCards, (index) => getStackState(index), metrics);
        setCards(secondCards, getFanState, metrics);

        gsap.set(firstUnit, { x: 0, y: 0, autoAlpha: 1 });
        gsap.set(secondUnit, { x: 0, y: metrics.travelY, autoAlpha: 1 });

        timeline = gsap.timeline({ repeat: -1 });

        timeline
          .to({}, { duration: 1.08 })
          .to(
            firstCards,
            {
              x: (index) => getFanState(index, metrics).x,
              y: (index) => getFanState(index, metrics).y,
              z: (index) => getFanState(index, metrics).z,
              rotationX: (index) => getFanState(index, metrics).rotationX,
              rotationY: (index) => getFanState(index, metrics).rotationY,
              rotationZ: (index) => getFanState(index, metrics).rotationZ,
              duration: 0.98,
              ease: "expo.out",
              stagger: { each: 0.06, from: "center" },
            },
            "fan-a"
          )
          .to({}, { duration: 0.18 })
          .to(
            firstUnit,
            {
              y: -metrics.travelY,
              duration: 1.65,
              ease: "none",
            },
            "push-a"
          )
          .to(
            secondUnit,
            {
              y: 0,
              duration: 1.65,
              ease: "none",
            },
            "push-a"
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
              duration: 0.8,
              ease: "expo.out",
              stagger: { each: 0.05, from: "edges" },
            },
            "push-a+=0.9"
          )
          .to({}, { duration: 0.72 })
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
            secondCards,
            {
              x: (index) => getFanState(index, metrics).x,
              y: (index) => getFanState(index, metrics).y,
              z: (index) => getFanState(index, metrics).z,
              rotationX: (index) => getFanState(index, metrics).rotationX,
              rotationY: (index) => getFanState(index, metrics).rotationY,
              rotationZ: (index) => getFanState(index, metrics).rotationZ,
              duration: 0.98,
              ease: "expo.out",
              stagger: { each: 0.06, from: "center" },
            },
            "fan-b"
          )
          .to({}, { duration: 0.18 })
          .to(
            secondUnit,
            {
              y: -metrics.travelY,
              duration: 1.65,
              ease: "none",
            },
            "push-b"
          )
          .to(
            firstUnit,
            {
              y: 0,
              duration: 1.65,
              ease: "none",
            },
            "push-b"
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
              duration: 0.8,
              ease: "expo.out",
              stagger: { each: 0.05, from: "edges" },
            },
            "push-b+=0.9"
          )
          .to({}, { duration: 0.72 })
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
          {heroUnits.map((unit, unitIndex) => {
            const centerIndex = Math.floor(unit.length / 2);

            return (
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
                      zIndex: unit.length - Math.abs(cardIndex - centerIndex),
                    }}
                  >
                    <Image
                      src={card.src}
                      alt={card.alt}
                      fill
                      priority={unitIndex === 0}
                      sizes="(max-width: 767px) 44vw, (max-width: 1023px) 26vw, 360px"
                      className="hero-card-image"
                    />
                  </article>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
