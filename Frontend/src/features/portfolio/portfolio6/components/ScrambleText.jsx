import { useCallback, useEffect, useRef, useState } from "react";

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@&";

function randomChar() {
  return CHARSET[Math.floor(Math.random() * CHARSET.length)];
}

/**
 * Hover: scramble characters then resolve to original text.
 */
export default function ScrambleText({ children, className = "", as: Tag = "span", duration = 520 }) {
  const text = String(children ?? "");
  const [display, setDisplay] = useState(text);
  const raf = useRef(0);

  const stop = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = 0;
  }, []);

  const onEnter = useCallback(() => {
    stop();
    const t0 = performance.now();
    const frame = () => {
      const elapsed = performance.now() - t0;
      const p = Math.min(1, elapsed / duration);
      const revealCount = Math.floor(p * text.length);
      let out = "";
      for (let i = 0; i < text.length; i++) {
        if (text[i] === " ") {
          out += " ";
          continue;
        }
        if (i < revealCount) out += text[i];
        else out += randomChar();
      }
      setDisplay(out);
      if (p < 1) raf.current = requestAnimationFrame(frame);
      else setDisplay(text);
    };
    raf.current = requestAnimationFrame(frame);
  }, [stop, duration, text]);

  const onLeave = useCallback(() => {
    stop();
    setDisplay(text);
  }, [stop, text]);

  useEffect(() => {
    setDisplay(text);
  }, [text]);

  useEffect(() => () => stop(), [stop]);

  return (
    <Tag
      className={className}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
    >
      {display}
    </Tag>
  );
}
