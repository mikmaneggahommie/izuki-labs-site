"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { assetPath } from "@/lib/asset-path";

/* ─── Card data ─── */
type HeroCard = { src: string; alt: string };

const GROUP_A: HeroCard[] = [
  { src: "/images/1.JPG", alt: "Editorial surface artwork" },
  { src: "/images/2.jpg", alt: "Campaign detail artwork" },
  { src: "/images/6.jpg", alt: "Launch artwork" },
  { src: "/images/4.jpg", alt: "Brand composition artwork" },
  { src: "/images/5.jpg", alt: "Poster layout artwork" },
  { src: "/images/3.jpg", alt: "Mobile system artwork" },
];

const GROUP_B: HeroCard[] = [
  { src: "/images/7.jpg", alt: "Luminous motion artwork" },
  { src: "/images/5.jpg", alt: "Print layout artwork" },
  { src: "/images/2.jpg", alt: "Feed design artwork" },
  { src: "/images/4.jpg", alt: "Graphic composition artwork" },
  { src: "/images/1.JPG", alt: "Brand motion artwork" },
  { src: "/images/6.jpg", alt: "Immersive launch artwork" },
];

const GROUPS = [GROUP_A, GROUP_B];

/* ─── Component ─── */
export default function HeroSection() {
  const stageRef = useRef<HTMLDivElement>(null);
  const groupRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let alive = true;
    let teardown: (() => void) | undefined;

    const boot = async () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (!stageRef.current) return;

      const gsap = (await import("gsap")).default;
      if (!alive) return;

      const [wrapA, wrapB] = groupRefs.current;
      if (!wrapA || !wrapB) return;

      const cardsA = Array.from(wrapA.querySelectorAll<HTMLElement>("[data-ci]"));
      const cardsB = Array.from(wrapB.querySelectorAll<HTMLElement>("[data-ci]"));
      if (!cardsA.length || !cardsB.length) return;

      let tl: ReturnType<typeof gsap.timeline> | undefined;
      let resizeId: number | undefined;

      /* ── Compute responsive metrics ── */
      const measure = () => {
        const stage = stageRef.current!.getBoundingClientRect();
        const card = cardsA[0].getBoundingClientRect();
        const count = cardsA.length;

        // Diagonal spacing between fanned cards (top-left to bottom-right)
        const stepX = Math.max(card.width * 0.58, Math.min(stage.width * 0.14, card.width * 0.82));
        const stepY = Math.max(card.height * 0.2, Math.min(stage.height * 0.14, card.height * 0.32));

        // Total vertical travel for the "shove" — must push entire fan off-screen
        const fanHeight = stepY * (count - 1) + card.height;
        const shoveY = fanHeight + stage.height * 0.15;

        return { stepX, stepY, shoveY, count, stageW: stage.width, stageH: stage.height };
      };

      /* ── State helpers ── */
      // STACKED: all cards behind the anchor (hidden stack at center)
      const applyStack = (cards: HTMLElement[]) => {
        cards.forEach((el, i) => {
          gsap.set(el, {
            x: 0,
            y: 0,
            z: -i * 8,
            rotationX: 0,
            rotationY: 0,
            rotationZ: 0,
            transformPerspective: 1800,
            transformOrigin: "50% 50%",
            force3D: true,
          });
        });
      };

      // FANNED: diagonal staircase from top-left to bottom-right
      // Card 0 (bottom of stack / first drawn) goes furthest top-left
      // Last card stays at anchor position (0,0)
      const applyFan = (cards: HTMLElement[], m: ReturnType<typeof measure>) => {
        const last = cards.length - 1;
        cards.forEach((el, i) => {
          const dist = last - i; // how far from anchor
          gsap.set(el, {
            x: -dist * m.stepX,
            y: -dist * m.stepY,
            z: -dist * 20,
            rotationX: dist === 0 ? 0 : 1.5,
            rotationY: dist === 0 ? 0 : -8,
            rotationZ: dist === 0 ? 0 : 3.8,
            transformPerspective: 1800,
            transformOrigin: "50% 50%",
            force3D: true,
          });
        });
      };

      /* ── Build the loop ── */
      const buildTimeline = () => {
        tl?.kill();

        const m = measure();

        // Initial state:
        // Group A = stacked at anchor position (visible)
        // Group B = fanned out, positioned BELOW viewport (waiting to shove up)
        applyStack(cardsA);
        applyFan(cardsB, m);

        gsap.set(wrapA, { x: 0, y: 0, autoAlpha: 1 });
        gsap.set(wrapB, { x: 0, y: m.shoveY, autoAlpha: 1 });

        tl = gsap.timeline({ repeat: -1 });

        /* ═══ CYCLE 1: Group A unstacks → shove up → Group B consolidates ═══ */

        // Phase 1a: UNSTACK — Group A fans out from center anchor
        tl.addLabel("unstack-a")
          .to({}, { duration: 0.6 }) // brief hold so user sees the stack
          .to(
            cardsA,
            {
              x: (i: number) => {
                const dist = cardsA.length - 1 - i;
                return -dist * m.stepX;
              },
              y: (i: number) => {
                const dist = cardsA.length - 1 - i;
                return -dist * m.stepY;
              },
              z: (i: number) => {
                const dist = cardsA.length - 1 - i;
                return -dist * 20;
              },
              rotationX: (i: number) => (i === cardsA.length - 1 ? 0 : 1.5),
              rotationY: (i: number) => (i === cardsA.length - 1 ? 0 : -8),
              rotationZ: (i: number) => (i === cardsA.length - 1 ? 0 : 3.8),
              duration: 0.85,
              ease: "power4.out",
              stagger: { each: 0.065, from: "start" },
            },
            "unstack-a+=0.6"
          );

        // Phase 2a: HEAVY SHOVE — both groups move UP as rigid unit
        // Group B pushes Group A out the top
        tl.addLabel("shove-a", ">-0.1")
          .to(
            wrapA,
            {
              y: -m.shoveY,
              duration: 1.6,
              ease: "expo.inOut",
            },
            "shove-a"
          )
          .to(
            wrapB,
            {
              y: 0,
              duration: 1.6,
              ease: "expo.inOut",
            },
            "shove-a"
          );

        // Phase 3a: CONSOLIDATION — Group B cards snap back to a clean stack
        tl.addLabel("snap-b", ">-0.35").to(
          cardsB,
          {
            x: 0,
            y: 0,
            z: (i: number) => -i * 8,
            rotationX: 0,
            rotationY: 0,
            rotationZ: 0,
            duration: 0.55,
            ease: "power4.out",
            stagger: { each: 0.04, from: "end" },
          },
          "snap-b"
        );

        // Reset Group A behind the scenes: position below, re-fan
        tl.addLabel("reset-a")
          .call(() => {
            applyFan(cardsA, m);
            gsap.set(wrapA, { y: m.shoveY });
          })
          .to({}, { duration: 0.15 }); // tiny breath

        /* ═══ CYCLE 2: Group B unstacks → shove up → Group A consolidates ═══ */

        tl.addLabel("unstack-b")
          .to({}, { duration: 0.6 })
          .to(
            cardsB,
            {
              x: (i: number) => {
                const dist = cardsB.length - 1 - i;
                return -dist * m.stepX;
              },
              y: (i: number) => {
                const dist = cardsB.length - 1 - i;
                return -dist * m.stepY;
              },
              z: (i: number) => {
                const dist = cardsB.length - 1 - i;
                return -dist * 20;
              },
              rotationX: (i: number) => (i === cardsB.length - 1 ? 0 : 1.5),
              rotationY: (i: number) => (i === cardsB.length - 1 ? 0 : -8),
              rotationZ: (i: number) => (i === cardsB.length - 1 ? 0 : 3.8),
              duration: 0.85,
              ease: "power4.out",
              stagger: { each: 0.065, from: "start" },
            },
            "unstack-b+=0.6"
          );

        tl.addLabel("shove-b", ">-0.1")
          .to(
            wrapB,
            {
              y: -m.shoveY,
              duration: 1.6,
              ease: "expo.inOut",
            },
            "shove-b"
          )
          .to(
            wrapA,
            {
              y: 0,
              duration: 1.6,
              ease: "expo.inOut",
            },
            "shove-b"
          );

        tl.addLabel("snap-a", ">-0.35").to(
          cardsA,
          {
            x: 0,
            y: 0,
            z: (i: number) => -i * 8,
            rotationX: 0,
            rotationY: 0,
            rotationZ: 0,
            duration: 0.55,
            ease: "power4.out",
            stagger: { each: 0.04, from: "end" },
          },
          "snap-a"
        );

        // Reset Group B behind the scenes
        tl.addLabel("reset-b")
          .call(() => {
            applyFan(cardsB, m);
            gsap.set(wrapB, { y: m.shoveY });
          })
          .to({}, { duration: 0.15 });
      };

      buildTimeline();

      const onResize = () => {
        window.clearTimeout(resizeId);
        resizeId = window.setTimeout(buildTimeline, 150);
      };

      window.addEventListener("resize", onResize);

      teardown = () => {
        window.removeEventListener("resize", onResize);
        window.clearTimeout(resizeId);
        tl?.kill();
      };
    };

    void boot();
    return () => {
      alive = false;
      teardown?.();
    };
  }, []);

  return (
    <section id="top" className="section-shell hero-shell">
      <div className="content-shell hero-viewport">
        {/* Bottom-left wordmark */}
        <div className="hero-copy">
          <h1 className="hero-wordmark" aria-label="Izuki Labs">
            <span className="hero-wordmark-line">
              <span>IZUKI</span>
              <span className="hero-wordmark-dot" aria-hidden />
            </span>
            <span className="hero-wordmark-line">LABS</span>
          </h1>
        </div>

        {/* Animation stage */}
        <div
          ref={stageRef}
          className="hero-stage"
          aria-label="Automated portfolio animation"
        >
          {GROUPS.map((group, gi) => (
            <div
              key={`group-${gi}`}
              ref={(node) => {
                groupRefs.current[gi] = node;
              }}
              className="hero-unit"
            >
              {group.map((card, ci) => (
                <article
                  key={`${card.src}-${ci}`}
                  className="hero-card"
                  data-ci={ci}
                  style={{ zIndex: ci + 1 }}
                >
                  <Image
                    src={assetPath(card.src)}
                    alt={card.alt}
                    fill
                    priority={gi === 0 && ci === group.length - 1}
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
