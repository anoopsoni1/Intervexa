import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { FaFileMedical } from "react-icons/fa";
import { IoReorderThreeOutline } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { FaHome } from "react-icons/fa";
import { GrDocumentUpload } from "react-icons/gr";
import { IoMdContacts } from "react-icons/io";
import { FaBook } from "react-icons/fa";
import { LuDollarSign } from "react-icons/lu";
import { FaSignInAlt } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import { FileText, LogOut } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { setUser, clearUser } from "../../slices/user.slice";
import { useLogout } from "../../utils/authUtils";
import { API_BASE } from "../../config";
import OptimizedImage from "../ui/OptimizedImage.jsx";

const MENU_ITEMS = [
  { to: "/", label: "Home", icon: FaHome },
  { to: "/templates", label: "Templates", icon: FileText },
  { to: "/dashboard", label: "Dashboard", icon: FaUser },
  { to: "/upload", label: "Upload", icon: GrDocumentUpload },
  { to: "/price", label: "Price", icon: LuDollarSign },
  { to: "/contact", label: "Contact", icon: IoMdContacts },
  { to: "/about", label: "About", icon: FaBook },
];

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/templates", label: "Templates" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/price", label: "Price" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const MENU_ANIM_DURATION_MS = 300;

export default function AppHeader() {
  const dispatch = useDispatch();
  const logout = useLogout(); // Global logout: clears backend session, token, Redux, redirects to /login
  const user = useSelector((state) => state.user.userData);
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closeTimeoutRef = useRef(null);
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  // Only treat as logged in when Redux has user — a stale accessToken alone used to force "Logout" in the header.
  const isLoggedIn = !!user;

  // Restore Redux user from backend profile when token exists but user is missing.
  useEffect(() => {
    if (user) return;
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/profile`, {
          method: "GET",
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        const currentUser = data?.user || data?.data?.user;
        if (currentUser) dispatch(setUser(currentUser));
        else if (
          res.status === 401 ||
          res.status === 403 ||
          data?.statusCode === 401 ||
          data?.statuscode === 401
        ) {
          dispatch(clearUser());
          localStorage.removeItem("accessToken");
        }
      } catch {
        /* network / CORS */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, token, dispatch]);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
      setOpen(false);
      setClosing(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  // Lock body scroll when mobile menu is open (small screens only)
  useEffect(() => {
    if (size.width >= 768) return;
    if (open && !closing) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, closing, size.width]);

  const closeMenu = () => {
    if (!open) return;
    setClosing(true);
    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false);
      setClosing(false);
      closeTimeoutRef.current = null;
    }, MENU_ANIM_DURATION_MS);
  };

  const openMenu = () => {
    setClosing(false);
    setOpen(true);
  };

  return (
    <header
      className={`sticky top-0 z-30 backdrop-blur-xl bg-black/60 border-b border-white/5 transition-all duration-500 ease-out ${
        mounted ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
      }`}
    >
      <div className="mx-auto flex items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div
            className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500"
            whileHover={{ scale: 1.1, rotate: 6, boxShadow: "0 10px 30px -5px rgba(79, 70, 229, 0.4)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
          >
            <OptimizedImage
              src="/lo.png"
              alt="Ansoyal AI"
              width={192}
              height={192}
              fetchPriority="high"
              className="w-[9.5vh] h-[9.5vh] object-cover"
            />
          </motion.div>
          <span className="text-lg font-semibold text-white transition-colors duration-200 group-hover:text-indigo-200">
            Ansoyal AI
          </span>
        </Link>

        <nav className="hidden md:flex gap-8 text-white">
          {NAV_LINKS.map(({ to, label }, i) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) =>
                `group relative py-1 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${
                  isActive
                    ? "text-orange-500 font-semibold"
                    : "hover:text-orange-500"
                }`
              }
              style={{ transitionDelay: mounted ? `${i * 30}ms` : "0ms" }}
            >
              {({ isActive }) => (
                <span className="relative inline-block">
                  {label}
                  <span
                    className={`absolute bottom-0 left-0 h-0.5 w-full bg-orange-500 rounded-full transition-transform duration-300 origin-center ${
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                    aria-hidden
                  />
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {size.width < 768 ? (
          <>
            {/* Portal overlay to body so fixed inset-0 covers viewport (header's backdrop-blur would otherwise trap it) */}
            {(open || closing) &&
              createPortal(
                <div
                  className="fixed inset-0 z-9999 md:hidden"
                  aria-hidden
                >
                  <div
                    className={`absolute inset-0 bg-zinc-950/75 backdrop-blur-md transition-opacity duration-300 ${
                      closing ? "opacity-0" : "opacity-100"
                    }`}
                    onClick={closeMenu}
                  />
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-[min(320px,88vw)] max-w-full flex flex-col rounded-r-3xl border-r border-white/[0.08] bg-zinc-950/98 shadow-[0_0_0_1px_rgba(255,255,255,0.04),12px_0_48px_-12px_rgba(79,70,229,0.35),24px_0_80px_-24px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      closing ? "-translate-x-full" : "translate-x-0"
                    }`}
                    onClick={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Navigation menu"
                  >
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-indigo-400/25 to-transparent" aria-hidden />
                    <ul className="flex flex-1 flex-col overflow-y-auto overscroll-contain py-3 text-white">
                      <li className="shrink-0 px-4 pb-4 pt-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-0.5 shadow-lg shadow-indigo-500/30">
                              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[0.65rem] bg-zinc-950">
                                <OptimizedImage
                                  src="/lo.png"
                                  alt=""
                                  width={192}
                                  height={192}
                                  loading="lazy"
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            </div>
                            <div className="min-w-0 pt-0.5">
                              <p className="truncate bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-lg font-bold tracking-tight text-transparent">
                                Ansoyal AI
                              </p>
                              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
                                Career toolkit
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={closeMenu}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-400 transition-all hover:border-white/20 hover:bg-white/[0.08] hover:text-white active:scale-95"
                            aria-label="Close menu"
                          >
                            <RxCross2 className="h-5 w-5" />
                          </button>
                        </div>
                        <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                      </li>
                      <li className="px-3 pb-2">
                        <p className="px-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                          Menu
                        </p>
                      </li>
                      {MENU_ITEMS.map((item, index) => (
                        <li
                          key={item.to}
                          className={`px-2 transition-all duration-300 ease-out ${
                            closing ? "opacity-0 -translate-x-2" : "opacity-100 translate-x-0"
                          }`}
                          style={{
                            transitionDelay: closing ? "0ms" : `${40 + index * 35}ms`,
                            transitionProperty: "opacity, transform",
                          }}
                        >
                          <NavLink
                            to={item.to}
                            onClick={closeMenu}
                            className={({ isActive }) =>
                              `group mb-0.5 flex items-center gap-3.5 rounded-xl px-3 py-3 transition-all duration-200 active:scale-[0.99] ${
                                isActive
                                  ? "border border-indigo-500/35 bg-indigo-500/[0.12] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                                  : "border border-transparent text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                              }`
                            }
                          >
                            {({ isActive }) => (
                              <>
                                <span
                                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                                    isActive
                                      ? "bg-indigo-500/25 text-indigo-200"
                                      : "bg-white/[0.06] text-zinc-400 group-hover:bg-white/10 group-hover:text-zinc-200"
                                  }`}
                                >
                                  <item.icon size={20} className="shrink-0" aria-hidden />
                                </span>
                                <span className="text-[15px] font-medium tracking-wide">{item.label}</span>
                                {isActive ? (
                                  <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]" aria-hidden />
                                ) : null}
                              </>
                            )}
                          </NavLink>
                        </li>
                      ))}
                      <li className="mt-auto flex-1 min-h-4" aria-hidden />
                      <li
                        className={`shrink-0 border-t border-white/[0.07] bg-gradient-to-t from-black/50 to-transparent px-2 pb-6 pt-3 transition-all duration-300 ease-out ${
                          closing ? "opacity-0 -translate-x-2" : "opacity-100 translate-x-0"
                        }`}
                        style={{
                          transitionDelay: closing ? "0ms" : `${40 + MENU_ITEMS.length * 35}ms`,
                          transitionProperty: "opacity, transform",
                        }}
                      >
                        {isLoggedIn ? (
                          <button
                            type="button"
                            onClick={() => {
                              logout();
                              closeMenu();
                            }}
                            className="flex w-full items-center gap-3.5 rounded-xl border border-rose-500/20 bg-rose-500/[0.08] px-3 py-3.5 text-left text-rose-200 transition-all hover:border-rose-500/40 hover:bg-rose-500/15 hover:text-rose-100 active:scale-[0.99]"
                          >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-300">
                              <LogOut className="h-5 w-5" strokeWidth={2} aria-hidden />
                            </span>
                            <span className="text-[15px] font-semibold tracking-wide">Log out</span>
                          </button>
                        ) : (
                          <Link
                            to="/login"
                            className="flex w-full items-center gap-3.5 rounded-xl border border-indigo-500/25 bg-indigo-500/10 px-3 py-3.5 text-indigo-200 transition-all hover:border-indigo-400/40 hover:bg-indigo-500/15 hover:text-white active:scale-[0.99]"
                            onClick={closeMenu}
                          >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-200">
                              <FaSignInAlt size={20} className="shrink-0" aria-hidden />
                            </span>
                            <span className="text-[15px] font-semibold tracking-wide">Sign in</span>
                          </Link>
                        )}
                      </li>
                    </ul>
                  </div>
                </div>,
                document.body
              )}
            {/* When menu is open, hide hamburger so only drawer's X is visible; avoids two buttons in one bar */}
            <motion.button
              type="button"
              className={`flex items-center justify-center text-zinc-200 p-2 rounded-lg hover:bg-white/5 active:bg-white/10 min-w-[44px] min-h-[44px] transition-opacity duration-200 ${open && !closing ? "opacity-0 pointer-events-none" : ""}`}
              onClick={() => (open ? closeMenu() : openMenu())}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <IoReorderThreeOutline size={28} />
            </motion.button>
          </>
        ) : (
          <>
            {isLoggedIn ? (
              <motion.button
                type="button"
                onClick={logout}
                className="text-red-400 hover:text-red-300 font-medium px-3 py-1.5 rounded-lg hover:bg-red-500/10"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                Logout
              </motion.button>
            ) : (
              <Link to="/login">
                <motion.span
                  className="inline-block text-white hover:text-orange-500 font-medium px-3 py-1.5 rounded-lg hover:bg-orange-500/10"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  Login
                </motion.span>
              </Link>
            )}
          </>
        )}
      </div>
    </header>
  );
}
