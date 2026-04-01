import { useLayoutEffect } from "react";
import gsap from "gsap";
import SplitType from "split-type";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function useScrollAnimations(rootRef, deps = []) {
  const depsKey = JSON.stringify(deps);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const splitInstances = [];
    const cleanupFns = [];

    const ctx = gsap.context(() => {
      gsap.set("[data-section]", { transformPerspective: 1200 });

      const splitTargets = root.querySelectorAll("[data-split='chars']");
      splitTargets.forEach((el) => {
        const split = new SplitType(el, { types: "chars,words" });
        splitInstances.push(split);
        gsap.fromTo(
          split.chars,
          { opacity: 0, yPercent: 100, rotateX: -78, transformOrigin: "50% 100%" },
          {
            opacity: 1,
            yPercent: 0,
            rotateX: 0,
            z: 0,
            stagger: 0.016,
            duration: 1.15,
            ease: "expo.out",
          }
        );
      });

      gsap.utils.toArray("[data-reveal]").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 72, skewY: 3 },
          {
            opacity: 1,
            y: 0,
            skewY: 0,
            ease: "power3.out",
            duration: 1,
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              end: "top 48%",
              scrub: 0.65,
            },
          }
        );
      });

      // Per-section cinematic reveal (no full-page pin — keeps horizontal pin + all sections reachable)
      gsap.utils.toArray("[data-section]").forEach((section) => {
        const inner = section.querySelector("[data-section-inner]") || section;
        gsap.fromTo(
          inner,
          {
            opacity: 0.2,
            y: 56,
            clipPath: "inset(6% 3% 8% 3% round 1.25rem)",
            filter: "blur(6px)",
          },
          {
            opacity: 1,
            y: 0,
            clipPath: "inset(0% 0% 0% 0% round 0rem)",
            filter: "blur(0px)",
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              end: "top 40%",
              scrub: 0.9,
            },
          }
        );

        const staggerEls = section.querySelectorAll("[data-stagger]");
        if (staggerEls.length) {
          gsap.fromTo(
            staggerEls,
            { opacity: 0, y: 36 },
            {
              opacity: 1,
              y: 0,
              stagger: 0.07,
              duration: 0.85,
              ease: "power3.out",
              scrollTrigger: {
                trigger: section,
                start: "top 78%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }
      });

      const horizontalTrack = root.querySelector("[data-horizontal-track]");
      const horizontalInner = root.querySelector("[data-horizontal-inner]");
      if (horizontalTrack && horizontalInner) {
        const desktopMq = window.matchMedia("(min-width: 768px)");
        if (desktopMq.matches) {
          const totalShift = () => Math.max(0, horizontalInner.scrollWidth - horizontalTrack.clientWidth);
          const tween = gsap.to(horizontalInner, {
            x: () => -totalShift(),
            ease: "none",
            scrollTrigger: {
              trigger: horizontalTrack,
              start: "top top",
              end: () => `+=${Math.max(800, totalShift())}`,
              scrub: true,
              pin: true,
              anticipatePin: 1,
            },
          });
          cleanupFns.push(() => tween.kill());
        } else {
          gsap.set(horizontalInner, { x: 0 });
        }
      }

      gsap.utils.toArray("[data-parallax]").forEach((el) => {
        gsap.fromTo(
          el,
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });
    }, root);

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cleanupFns.forEach((fn) => fn());
      splitInstances.forEach((split) => split.revert());
      ctx.revert();
    };
  }, [rootRef, depsKey]);
}
