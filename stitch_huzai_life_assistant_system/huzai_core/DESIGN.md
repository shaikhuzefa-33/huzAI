---
name: huzAI Core
colors:
  surface: '#141313'
  surface-dim: '#141313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353434'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c4c7c8'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c6c6c7'
  primary: '#ffffff'
  on-primary: '#2f3131'
  primary-container: '#e2e2e2'
  on-primary-container: '#636565'
  inverse-primary: '#5d5f5f'
  secondary: '#c6c6c6'
  on-secondary: '#2f3131'
  secondary-container: '#484949'
  on-secondary-container: '#b8b8b8'
  tertiary: '#ffffff'
  on-tertiary: '#2f3131'
  tertiary-container: '#e2e2e2'
  on-tertiary-container: '#636565'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c7'
  on-primary-fixed: '#1a1c1c'
  on-primary-fixed-variant: '#454747'
  secondary-fixed: '#e3e2e2'
  secondary-fixed-dim: '#c6c6c6'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#464747'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#141313'
  on-background: '#e5e2e1'
  surface-variant: '#353434'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 30px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-padding-mobile: 20px
  container-padding-desktop: 64px
  gutter: 16px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

The design system is anchored in a **Premium Minimalist** aesthetic with a **Futuristic** edge. It prioritizes clarity, intelligence, and calm, positioning the AI as a sophisticated, unobtrusive life partner rather than a tool. 

The visual language follows a "Dark Mode First" philosophy, utilizing a high-contrast monochromatic base to ensure maximum legibility and focus. Elements are structured with a focus on depth through tonal layering and precise geometry. The emotional response should be one of "quiet power"—efficient, expert, and trustworthy. We avoid decorative clutter, favoring generous whitespace (negative space) and intentional typography to guide the user’s cognitive load.

## Colors

The palette is strictly functional. The foundation is **Pure Black (#000000)** for deep immersion and splash screens, transitioning to **Deep Gray (#0A0A0A)** for the primary interface to reduce eye strain.

- **Primary Text (#FFFFFF):** Used for headlines and critical information.
- **Secondary Text (#B8B8B8):** Used for body copy and metadata to create visual hierarchy.
- **Surface (#171717):** Defines cards and containers, providing a subtle lift from the background.
- **Borders (#2A2A2A):** Defined, low-contrast strokes replace shadows for a cleaner, modern look.
- **Accents:** Cyan, Purple, and Blue are used with extreme restraint (1-2% of the UI) specifically for AI status indicators (e.g., "Thinking") or primary call-to-actions.

## Typography

The system uses **Inter** for its systematic neutrality and exceptional legibility across all optical sizes. For technical or meta-information, **Geist** provides a precise, developer-adjacent aesthetic that reinforces the AI's "under-the-hood" intelligence.

For the **Elder Mode** implementation, the type scale shifts upward, utilizing `body-lg` as the minimum standard for paragraph text. Headlines use tight letter-spacing for a modern, editorial feel, while labels utilize increased tracking to ensure readability at small scales.

## Layout & Spacing

This design system utilizes a **Fluid Grid** with a strict 8px base unit. Layouts are characterized by significant vertical breathing room to allow the user to focus on one AI insight at a time.

- **Desktop:** 12-column grid, max-width 1440px, centered. 
- **Mobile:** Single column with 20px safe-area margins.
- **Philosophy:** Use "Stacking" rather than "Side-by-side" layouts where possible to maintain the assistant's conversational flow. Elements are grouped using the `stack-md` (24px) unit to maintain a clear relationship between content blocks.

## Elevation & Depth

Depth is achieved through **Tonal Layering** rather than traditional drop shadows. By layering `#171717` (Surface) on top of `#0A0A0A` (Background), we create a physical presence for UI components.

- **Level 0:** Pure Black/Deep Gray background.
- **Level 1:** Surface cards with a 1px solid border (#2A2A2A).
- **Level 2 (Active/Hover):** Increase border brightness to `#404040` or add a very soft, high-diffusion glow using the accent colors (0.1 opacity).
- **Glassmorphism:** Reserved exclusively for navigation bars and floating action buttons, using a subtle backdrop blur (20px) to maintain context of the content underneath.

## Shapes

The shape language is defined by **High-Radius Geometry**. Standard components use a 16px (`rounded-lg`) corner radius to feel approachable and modern. 

- **Cards/Containers:** 16px to 24px depending on size.
- **Buttons:** Fully rounded (pill-shaped) for primary actions, 12px for secondary.
- **Inputs:** 12px to match the internal rhythm of the card containers.
The consistency of these radii creates a "soft-tech" feel that balances the coldness of the dark color palette.

## Components

- **Buttons:** Primary buttons are Solid White with Black text. Secondary buttons are Ghost-style with `#2A2A2A` borders and White text. Interactive states use a subtle scale-down (0.98) to provide tactile feedback.
- **AI Input:** A central, persistent field. Unlike standard inputs, it should have a subtle gradient border using the Accent Cyan/Purple to signify the "Active Intelligence."
- **Cards:** No shadows. Use a 1px border (#2A2A2A). Padding is generous (min 24px).
- **Chips:** Used for suggested replies. Pill-shaped, background `#2A2A2A`, text `secondary_color`.
- **Status Indicators:** Small 8px glowing orbs using accent colors to represent the AI’s state (Pulse for thinking, Static for ready).
- **Elder Mode Toggles:** High-contrast switches that increase global `fontSize` and `spacing-unit` by 1.25x when active.