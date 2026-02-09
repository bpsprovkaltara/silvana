# Silvana Design System

## Design Philosophy: "Refined Data Bureau"

A sophisticated, editorial aesthetic inspired by modern data visualization and Swiss design principles, with warm Indonesian touches. The design balances authoritative professionalism with approachable usability.

## Visual Identity

### Typography

- **Display Font**: [Outfit](https://fonts.google.com/specimen/Outfit) - Geometric sans-serif for headings and numbers
  - Bold, confident presence for titles and queue numbers
  - Tight letter-spacing (-0.02em to -0.04em) for modern feel

- **Body Font**: [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) - Indonesian-made typeface
  - Excellent readability for body text and UI
  - Local connection to the Indonesian context
  - Professional yet friendly personality

### Color Palette

**Primary Colors:**

- Bureau Navy: `#0a1628` - Deep, authoritative base
- Bureau Dark: `#1a2942` - Secondary dark shade
- Bureau Blue: `#2c4570` - Accent navy
- Terracotta: `#d4744a` - Warm Indonesian earth tone (primary accent)
- Terracotta Light: `#e8956d` - Lighter variant
- Terracotta Dark: `#b85d38` - Darker variant

**Functional Colors:**

- Cyan: `#06b6d4` - "On Process" status, data elements
- Mint: `#10b981` - "Done" status, success
- Amber: `#f59e0b` - "Pending" status, warnings
- Slate: `#64748b` - "Cancelled" status, secondary text

**Background:**

- Pearl: `#f8fafc` - Light background
- Gradient: `#f8fafc` to `#e2e8f0` - Subtle page backgrounds

### Service Type Colors

Each service type has a unique color identity:

- **Konsultasi Statistik**: Cyan `#06b6d4`
- **Penjualan Data Mikro**: Purple `#8b5cf6`
- **Perpustakaan Statistik**: Mint `#10b981`
- **Rekomendasi Kegiatan**: Amber `#f59e0b`

## Components

### Status Badges

Gradient-filled badges with animated pulse dots:

- Pending: Amber gradient with pulsing dot
- On Process: Cyan gradient with pulsing dot
- Done: Green gradient with pulsing dot
- Cancelled: Gray gradient with pulsing dot

```html
<span class="status-badge status-pending">Menunggu</span>
```

### Queue Numbers

Large, gradient text with custom display font:

- 3rem (48px) base size
- 800 font weight
- Gradient from navy to terracotta
- Letter-spacing: -0.04em

```html
<div class="queue-number">3</div>
```

### Cards

Glass morphism effect with subtle backdrop blur:

- White background with 70% opacity
- 12px backdrop blur
- Soft shadows (--shadow-card)
- Hover effect: translateY(-2px) + elevated shadow
- Rounded corners: 1rem (16px)

```html
<div class="glass rounded-2xl p-6 shadow-card card-interactive">
  <!-- Card content -->
</div>
```

### Buttons

Two primary styles:

**Primary (Terracotta):**

```html
<button
  class="px-6 py-3 bg-gradient-to-r from-[#d4744a] to-[#b85d38]
  text-white font-semibold rounded-lg shadow-lg hover:shadow-xl
  transition-all duration-300 hover:scale-[1.02]"
>
  Button Text
</button>
```

**Secondary (Outlined):**

```html
<button
  class="px-6 py-3 bg-white/80 backdrop-blur-sm border-2
  border-[#0a1628] text-[#0a1628] font-semibold rounded-lg
  hover:bg-[#0a1628] hover:text-white transition-all duration-300"
>
  Button Text
</button>
```

## Animations

### Entrance Animations

Staggered slide-in-up effect for page elements:

```css
.animate-slide-in-up {
  animation: slide-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.animation-delay-100 {
  animation-delay: 100ms;
}
.animation-delay-200 {
  animation-delay: 200ms;
}
.animation-delay-300 {
  animation-delay: 300ms;
}
```

### Continuous Animations

- **Pulse Soft**: Gentle pulsing for status indicators
- **Gradient Shift**: Slow background gradient animation (15s)
- **Card Hover**: Smooth lift effect with shadow enhancement

## Layout Patterns

### Dashboard Header

Dark gradient background (navy to blue) with:

- Animated gradient shift
- Decorative blur circles (opacity 10%)
- White glass-morphism stats cards
- Large display headings

### Content Grid

- Max width: 1280px (max-w-7xl)
- Responsive padding: px-4 sm:px-6 lg:px-8
- Grid layouts: 1 column mobile, 2-3 columns desktop
- Generous gap spacing (gap-6 to gap-8)

### Ticket Cards

Two-column layout on desktop:

- Left: Service details, scheduled info
- Right: Queue number (large display)
- Full-width QR code section at bottom

## Accessibility

- Focus outlines: 2px terracotta with 2px offset
- Custom selection color: Terracotta light
- Semantic HTML structure
- ARIA labels where needed
- Color contrast meets WCAG AA standards
- Keyboard navigation support

## Responsive Design

Mobile-first approach:

- Single column layouts on mobile
- Stacked cards and grids
- Collapsible navigation
- Touch-friendly button sizes (minimum 44x44px)
- Optimized typography scaling

## Design Tokens

All design tokens are defined in CSS custom properties in `globals.css`:

- Colors: `--color-*`
- Spacing: `--spacing-base`
- Radius: `--radius-*`
- Shadows: `--shadow-*`
- Fonts: `--font-sans`, `--font-display`

## Usage Guidelines

**DO:**
✓ Use the glass effect for elevated UI elements
✓ Apply status colors consistently
✓ Use staggered animations for page loads
✓ Maintain generous spacing between elements
✓ Use gradient buttons for primary actions

**DON'T:**
✗ Mix different shadow styles
✗ Use colors outside the defined palette
✗ Over-animate (keep it purposeful)
✗ Reduce spacing too much (keep breathing room)
✗ Use generic system fonts

## File Structure

```
src/app/globals.css          # Design system CSS
src/components/
  ├── tickets/TicketCard.tsx # Reusable ticket component
  └── ui/                    # shadcn/ui components
```

## Implementation Notes

- Built with Tailwind CSS v4
- Uses CSS custom properties for theming
- Google Fonts for typography
- CSS-only animations (no JS dependencies)
- Optimized for performance
- SSR-friendly (no client-side requirements)
