"use client";

import React, { useLayoutEffect } from "react";

/**
 * This hook is used to automatically resize the textarea based on its content.
 * It is useful for html <textarea> elements that grow with the content and do not allow users to resize it.
 *
 * **Reference:** this hook is rewritten to be React friendly based on [autosize](https://github.com/jackmoore/autosize),
 * which was written using raw JavaScript.
 *
 * @param ref - The reference to the textarea element.
 * @param value - The value of the textarea.
 */
export const useAutosizeTextarea = (
  ref: React.RefObject<HTMLTextAreaElement>,
  value: string | undefined,
) => {
  useLayoutEffect(() => {
    // Check if the textarea ref is available and the window object is available.
    // Otherwise, the code is running on the server side, which cannot get proper client side dimension values.
    const textarea = ref.current;
    if (!textarea || typeof window === "undefined") return;
    // Get the computed style of the textarea.
    const computed = window.getComputedStyle(textarea);
    /**
     * This function will be reused to set the height of the textarea.
     * @param restoreTextAlign - Pass the `textAlign` value to restore the `textAlign` after setting the height.
     * @param testForHeightReduction - Pass `true` when we need to consider the potential height reduction.
     */
    const setHeight = ({
      restoreTextAlign = null,
      testForHeightReduction = true,
    }: {
      restoreTextAlign?: string | null;
      testForHeightReduction?: boolean;
    } = {}) => {
      if (textarea.scrollHeight === 0) return;
      if (computed.resize === "vertical") {
        textarea.style.resize = "none";
      } else if (computed.resize === "both") {
        textarea.style.resize = "horizontal";
      }
      // If we need to consider the potential height reduction, cache the `textAlign` and scroll tops of the parent elements.
      // This is because the height reduction may cause the text to flow differently and might scroll to a different position.
      // We need to restore the `textAlign` and scroll tops after setting the height.
      let restoreScrollTops: (() => void) | undefined;
      if (testForHeightReduction) {
        restoreScrollTops = cacheScrollTops(textarea);
        textarea.style.height = "";
      }
      // Compute new height (considering edge case from `box-sizing` property).
      let newHeight;
      if (computed.boxSizing === "content-box") {
        newHeight =
          textarea.scrollHeight -
          (parseFloat(computed.paddingTop) +
            parseFloat(computed.paddingBottom));
      } else {
        newHeight =
          textarea.scrollHeight +
          parseFloat(computed.borderTopWidth) +
          parseFloat(computed.borderBottomWidth);
      }
      if (
        // When `maxHeight` is set and the new height is greater than the `maxHeight`, set the height to `maxHeight`.
        // So that the textarea can scroll when the content is more than the `maxHeight`.
        computed.maxHeight !== "none" &&
        newHeight > parseFloat(computed.maxHeight)
      ) {
        if (computed.overflowY === "hidden") {
          textarea.style.overflow = "scroll";
        }
        newHeight = parseFloat(computed.maxHeight);
      } else if (computed.overflowY !== "hidden") {
        // Set the overflow to hidden to avoid the scrollbar when the content is less than the `maxHeight`.
        textarea.style.overflow = "hidden";
      }
      // Set the new height to the DOM styling.
      textarea.style.height = newHeight + "px";
      if (restoreTextAlign) {
        textarea.style.textAlign = restoreTextAlign;
      }
      if (restoreScrollTops) {
        restoreScrollTops();
      }
      textarea.dispatchEvent(new Event("autosize:resized", { bubbles: true }));
    };
    /**
     * This function is used to keep the scrolling position of the parent view of the textarea.
     * @param el - The textarea element.
     * @returns A function to restore the scroll tops of the parent elements. A reset function.
     */
    const cacheScrollTops = (el: HTMLElement) => {
      const arr: [HTMLElement, number][] = [];
      while (el && el.parentNode instanceof HTMLElement) {
        if (el.parentNode.scrollTop) {
          arr.push([el.parentNode, el.parentNode.scrollTop]);
        }
        el = el.parentNode as HTMLElement;
      }
      return () =>
        arr.forEach(([node, scrollTop]) => {
          node.style.scrollBehavior = "auto";
          node.scrollTop = scrollTop;
          node.style.scrollBehavior = "";
        });
    };
    /**
     * Compute and set new height when input event is triggered.
     */
    const handleInput = () => {
      const previousValue = textarea.value;
      setHeight({
        testForHeightReduction:
          previousValue === "" || !textarea.value.startsWith(previousValue),
        restoreTextAlign: null,
      });
    };
    /**
     * When the window is resized or the textarea itself is resized,
     * we don't know how text will be flowing intuitively, so we reset the height entirely.
     */
    const fullSetHeight = () => {
      setHeight({
        testForHeightReduction: true,
        restoreTextAlign: null,
      });
    };
    // Register the event listeners.
    textarea.addEventListener("input", handleInput);
    // Create a ResizeObserver to monitor the textarea element for size changes.
    const resizeObserver = new ResizeObserver(() => {
      fullSetHeight();
    });
    // Start observing the textarea element.
    resizeObserver.observe(textarea);
    // Execute the initial height setting.
    setHeight();
    return () => {
      // Unregister the event listeners.
      textarea.removeEventListener("input", handleInput);
      // Disconnect the ResizeObserver.
      resizeObserver.disconnect();
    };
  }, [ref, value]);
};
