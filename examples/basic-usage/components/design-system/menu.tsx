"use client";

import { type ComponentPropsWithoutRef, type ReactNode } from "react";

import { Menu } from "@base-ui-components/react/menu";

import { cn } from "@/lib/tailwind";
import { iconButtonClassName } from "@/components/design-system/icon-button";

// ========== MenuRoot ==========

type MenuRootProps = ComponentPropsWithoutRef<typeof Menu.Root>;

/**
 * Root component for the menu. Wraps Base UI Menu.Root.
 */
export function MenuRoot(props: MenuRootProps) {
  return <Menu.Root {...props} />;
}

// ========== MenuTrigger ==========

type MenuTriggerProps = ComponentPropsWithoutRef<typeof Menu.Trigger>;

/**
 * Menu trigger styled as an icon button.
 */
export function MenuTrigger({
  children,
  className,
  ...props
}: MenuTriggerProps) {
  return (
    <Menu.Trigger className={cn(iconButtonClassName, className)} {...props}>
      {children}
    </Menu.Trigger>
  );
}

// ========== MenuPopup ==========

type MenuPopupProps = Omit<
  ComponentPropsWithoutRef<typeof Menu.Popup>,
  "children"
> & {
  /**
   * Menu content (typically MenuItems).
   */
  children: ReactNode;
  /**
   * Offset from the trigger element.
   */
  sideOffset?: number;
};

/**
 * Styled menu popup with portal and positioner.
 */
export function MenuPopup({
  children,
  className,
  sideOffset = 4,
  ...props
}: MenuPopupProps) {
  return (
    <Menu.Portal>
      <Menu.Positioner className={"outline-none z-50"} sideOffset={sideOffset}>
        <Menu.Popup
          className={cn(
            "origin-(--transform-origin) rounded-md bg-white p-1 shadow-lg z-50",
            "outline-1 outline-neutral-200",
            "transition-[transform,scale,opacity]",
            "data-ending-style:scale-90 data-ending-style:opacity-0",
            "data-starting-style:scale-90 data-starting-style:opacity-0",
            className,
          )}
          {...props}
        >
          {children}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  );
}

// ========== MenuItem ==========

type MenuItemProps = ComponentPropsWithoutRef<typeof Menu.Item>;

/**
 * Styled menu item.
 */
export function MenuItem({ className, ...props }: MenuItemProps) {
  return (
    <Menu.Item
      className={cn(
        "flex cursor-pointer rounded-sm px-2 py-1.5 text-xs text-neutral-700 outline-none select-none",
        "data-highlighted:bg-neutral-100",
        className,
      )}
      {...props}
    />
  );
}
