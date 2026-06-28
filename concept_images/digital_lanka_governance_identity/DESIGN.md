---
name: Digital Lanka Governance Identity
colors:
  surface: '#faf8ff'
  surface-dim: '#dad9e0'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f9'
  surface-container: '#efedf3'
  surface-container-high: '#e9e7ee'
  surface-container-highest: '#e3e2e8'
  on-surface: '#1a1b20'
  on-surface-variant: '#444650'
  inverse-surface: '#2f3035'
  inverse-on-surface: '#f1f0f6'
  outline: '#757682'
  outline-variant: '#c5c6d2'
  surface-tint: '#435b9f'
  primary: '#00113a'
  on-primary: '#ffffff'
  primary-container: '#002366'
  on-primary-container: '#758dd5'
  inverse-primary: '#b3c5ff'
  secondary: '#50606f'
  on-secondary: '#ffffff'
  secondary-container: '#d1e1f4'
  on-secondary-container: '#556474'
  tertiary: '#2d0700'
  on-tertiary: '#ffffff'
  tertiary-container: '#501300'
  on-tertiary-container: '#d37758'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b3c5ff'
  on-primary-fixed: '#00174a'
  on-primary-fixed-variant: '#2a4386'
  secondary-fixed: '#d4e4f6'
  secondary-fixed-dim: '#b8c8da'
  on-secondary-fixed: '#0d1d2a'
  on-secondary-fixed-variant: '#394857'
  tertiary-fixed: '#ffdbd0'
  tertiary-fixed-dim: '#ffb59e'
  on-tertiary-fixed: '#390b00'
  on-tertiary-fixed-variant: '#783018'
  background: '#faf8ff'
  on-background: '#1a1b20'
  surface-variant: '#e3e2e8'
typography:
  h1:
    fontFamily: Public Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Public Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  h3:
    fontFamily: Public Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: 0em
  body-lg:
    fontFamily: Public Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0em
  body-md:
    fontFamily: Public Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: 0em
  label-caps:
    fontFamily: Public Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: 0.05em
  status-text:
    fontFamily: Public Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  card-padding: 32px
---

## Brand & Style

The design system is engineered to project an image of absolute stability, institutional trust, and modern efficiency. As a "Gov-Tech" platform for traffic and identity management, the visual language prioritizes authority and clarity over decorative flair. 

The aesthetic follows a **Corporate / Modern** style with a focus on structured card-based layouts. Every interface element is designed to feel secure and permanent, utilizing high-contrast typography and a restrained color palette. The goal is to evoke a sense of digital sovereignty, ensuring citizens feel their data is handled with precision and professional rigor.

## Colors

The palette is anchored by **Navy (#002366)**, representing the depth of state authority and tradition, complemented by **Slate Blue (#708090)** to soften the administrative feel without losing professionalism. 

The background is strictly **Light Gray (#F5F5F5)** to reduce eye strain during long-form data entry, while **White (#FFFFFF)** surfaces are used to isolate functional areas. Semantic colors are highly saturated for immediate recognition: **Emerald Green** for verified status, **Amber** for cautionary warnings, and **Crimson** for critical violations. This hierarchy ensures that users can scan complex identity records and immediately identify issues.

## Typography

The design system utilizes **Public Sans** (an institutional variant of the Inter/Roboto style) for its exceptional legibility and neutral, official tone. 

The type scale is optimized for information density. Headlines are heavy and tight to establish clear section breaks, while body text uses a generous line height (1.5-1.6) to ensure legal and technical documentation is readable across all devices. Small labels use uppercase styling with increased letter spacing to differentiate metadata from primary user data.

## Layout & Spacing

This design system employs a **Fixed Grid** model on desktop (12 columns) and a fluid model on mobile. A strict 8px base unit controls all rhythmic spacing.

Layouts are constructed using a hierarchy of white space:
- **Card-to-Card spacing:** 24px (3 units) to maintain clear separation of distinct records.
- **Internal Card padding:** 32px (4 units) to provide a "breathing room" that signals a high-quality, professional experience.
- **Form Grouping:** 16px (2 units) vertically between related input fields.

## Elevation & Depth

To reinforce the concept of security, depth is conveyed through **Tonal Layers** and subtle **Ambient Shadows**. 

The background is the lowest level. Cards sit on Level 1 with a very soft, diffused shadow (0px 4px 12px rgba(0, 0, 0, 0.05)) to suggest they are "files" placed on a desk. Active states or modals rise to Level 2 with a more pronounced shadow. This depth model avoids excessive "floating" effects, keeping the UI grounded and authoritative.

## Shapes

The design system uses a **Soft (0.25rem)** roundedness level. This choice strikes a balance between the rigid "sharp" corners of legacy systems and the overly "bubbly" feel of consumer apps. 

- **Small elements (Badges, Buttons):** 4px radius.
- **Large elements (Cards, Input Fields):** 8px radius.
- **QR Placeholders:** Must maintain a sharp 0px radius for the internal code area to ensure scan accuracy, though the containing card follows the standard 8px radius.

## Components

### Buttons & Inputs
Primary buttons use the Navy (#002366) fill with white text. Input fields use a 1px border of Slate Blue (#708090) and must include clear focus states with a 2px offset ring.

### Status Badges
Badges are essential trust signals. They consist of a light-tint background (10% opacity of the accent color) with a dark-tinted text and a matching 8px icon.
- **Verified:** Emerald Green background + dark green text + checkmark icon.
- **Pending:** Amber background + dark amber text + clock icon.
- **Violation:** Crimson background + dark crimson text + alert icon.

### Cards & QR Codes
Cards are the primary container for identity profiles. They should feature a header section with a secondary background color (#F5F5F5) to separate the title from the data. 
- **QR Code Placeholders:** Every profile card must include a dedicated QR slot on the right-hand side (desktop) or top (mobile), framed by a subtle 1px gray border to signify it as a scannable security feature.

### Tables & Lists
Data-heavy views use zebra-striped rows in Light Gray to assist with horizontal scanning. Every row should have a "Details" action using a text-link style in Primary Navy.