import { useEffect, useRef } from "react";

export function useEventListener<E extends keyof WindowEventMap>(
  target: Window,
  event: E,
  listener: (ev: WindowEventMap[E]) => void,
  options?: boolean | AddEventListenerOptions
): void;
export function useEventListener(
  target: EventTarget,
  event: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions
): void {
  const savedHandler = useRef<typeof listener>();

  useEffect(() => {
    savedHandler.current = listener;
  }, [listener]);

  useEffect(() => {
    const eventListener: typeof listener = (event) => {
      if (typeof savedHandler.current === "function") {
        savedHandler.current(event);
      } else if (typeof savedHandler.current === "object") {
        savedHandler.current.handleEvent(event);
      }
    };

    target.addEventListener(event, eventListener, options);
    return () => {
      target.removeEventListener(event, eventListener, options);
    };
  }, [target, options, event]);
}
