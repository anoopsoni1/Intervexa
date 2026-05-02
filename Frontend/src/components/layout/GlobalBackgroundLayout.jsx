import { Suspense } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";
import Particles from "../ui/Lighting.jsx";
import RoutePageSkeleton from "../ui/RoutePageSkeleton.jsx";

function GlobalBackgroundLayout() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative min-h-dvh min-h-screen bg-black [overflow-x:clip]">
      <motion.div
        className="pointer-events-none absolute -left-24 top-14 z-0 h-72 w-72 rounded-full bg-indigo-500/25 blur-3xl"
        animate={{ x: [0, 28, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -right-24 bottom-10 z-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl"
        animate={{ x: [0, -24, 0], y: [0, 18, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        id="particle"
        className="pointer-events-none absolute inset-0 z-0 min-h-full w-full mix-blend-screen"
      >
        <Particles
          particleColors={["#ffffff"]}
          particleCount={300}
          particleSpread={9}
          speed={0.08}
          particleBaseSize={88}
          moveParticlesOnHover
          alphaParticles={false}
          disableRotation={false}
          pixelRatio={1}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.22),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(14,165,233,0.18),transparent_35%),radial-gradient(circle_at_60%_90%,rgba(249,115,22,0.18),transparent_35%)]" />
      <div className="absolute inset-0 z-0 bg-black/45" />
      <div className="global-bg-content relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={
              import.meta.env.SSR || reduceMotion
                ? false
                : { opacity: 0, y: 10, filter: "blur(4px)" }
            }
            animate={reduceMotion ? {} : { opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={reduceMotion ? {} : { opacity: 0, y: -8, filter: "blur(2px)" }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <Suspense fallback={<RoutePageSkeleton />}>
              <Outlet />
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default GlobalBackgroundLayout;
