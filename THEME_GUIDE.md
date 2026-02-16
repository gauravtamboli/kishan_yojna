# Forest Harvest Theme - Style Guide

## 🎨 Theme Overview

Your app now features the **"Forest Harvest"** theme - a warm, earthy, professional design system that perfectly complements the agricultural mission of the Kisan Vriksh Yojana application.

### Theme Philosophy
- **Warm & Inviting**: Golden and forest green tones create a welcoming atmosphere
- **Professional**: Clear hierarchy and consistent spacing convey trustworthiness
- **Accessible**: High contrast ratios ensure readability in light and dark modes
- **Responsive**: System works seamlessly across all device sizes

---

## 🎯 Color Palette

### Primary Colors
| Color | HEX | CSS Variable | Usage |
|-------|-----|--------------|-------|
| Primary Gold | `#d4a024` | `--theme-primary` | Buttons, headers, accents |
| Primary Light | `#e8b84f` | `--theme-primary-light` | Hover states, highlights |
| Primary Dark | `#8b6914` | `--theme-primary-dark` | Pressed states, borders |
| Primary Gradient | `linear-gradient(135deg, #ddc643ea, #c0ac75)` | `--theme-primary-gradient` | Headers, backgrounds |

### Secondary Colors
| Color | HEX | CSS Variable | Usage |
|-------|-----|--------------|-------|
| Forest Green | `#2d5016` | `--theme-secondary` | Secondary buttons, accents |
| Forest Light | `#4a7c2c` | `--theme-secondary-light` | Hover states |
| Forest Dark | `#1a2f0d` | `--theme-secondary-dark` | Active states |

### Accent Colors
| Color | HEX | CSS Variable | Usage |
|-------|-----|--------------|-------|
| Warm Orange | `#e67e22` | `--theme-accent` | Call-to-action, alerts |
| Accent Light | `#f39c12` | `--theme-accent-light` | Hover states |
| Accent Dark | `#d35400` | `--theme-accent-dark` | Active states |

### Status Colors
| Status | HEX | CSS Variable | Usage |
|--------|-----|--------------|-------|
| Success | `#27ae60` | `--theme-success` | Approved, completed, valid |
| Warning | `#f39c12` | `--theme-warning` | Pending, caution |
| Danger | `#e74c3c` | `--theme-danger` | Rejected, error, critical |
| Info | `#3498db` | `--theme-info` | Information, drafts |

---

## 📐 Spacing System

```css
--theme-spacing-xs:   4px    /* Extra small gaps */
--theme-spacing-sm:   8px    /* Small margins */
--theme-spacing-md:   16px   /* Medium spacing (default) */
--theme-spacing-lg:   24px   /* Large sections */
--theme-spacing-xl:   32px   /* Extra large sections */
--theme-spacing-xxl:  48px   /* Full sections */
```

## 🔲 Border Radius

```css
--theme-radius-sm:    4px    /* Subtle rounding */
--theme-radius-md:    8px    /* Default rounding */
--theme-radius-lg:    12px   /* Prominent rounding (cards) */
--theme-radius-xl:    16px   /* Large rounding (containers) */
--theme-radius-round: 50%    /* Pills and circles */
```

## ✍️ Typography

### Font Family
```css
--theme-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, ...
```

### Font Weights
```css
--theme-font-weight-light:    300
--theme-font-weight-regular:  400
--theme-font-weight-medium:   500
--theme-font-weight-bold:     700
```

---

## 🎬 Animations & Transitions

### Transition Speeds
```css
--theme-transition:       all 0.3s cubic-bezier(0.4, 0, 0.2, 1)  /* Default */
--theme-transition-fast:  all 0.15s ease                         /* Snappy */
--theme-transition-slow:  all 0.5s ease                          /* Smooth */
```

### Pre-defined Animations
```html
<!-- Fade in effect -->
<div class="fade-in">Content</div>

<!-- Slide up animation -->
<div class="slide-in-up">Content</div>

<!-- Pulsing animation -->
<div class="pulse">Content</div>
```

---

## 🌓 Light & Dark Mode

### Automatic Theme Switching
The app automatically adapts to dark mode when `.ion-palette-dark` class is applied to the root element.

**Light Mode Colors:**
```css
--theme-bg-light:       #faf8f3  /* Soft cream background */
--theme-bg-secondary:   #f3f1ec  /* Secondary background */
--theme-bg-tertiary:    #e8e5de  /* Tertiary background */
--theme-text-primary:   #1a1815  /* Dark brown text */
--theme-text-secondary: #4a4640  /* Medium text */
--theme-text-tertiary:  #7a7369  /* Light text */
```

**Dark Mode Colors:**
```css
--theme-bg-light:       #1a1815  /* Dark background */
--theme-bg-secondary:   #242118  /* Secondary background */
--theme-bg-tertiary:    #2d2924  /* Tertiary background */
--theme-text-primary:   #f5f2ec  /* Light text */
--theme-text-secondary: #d4cec4  /* Medium text */
--theme-text-tertiary:  #a39f96  /* Dimmed text */
```

---

## 🧩 Component Usage

### Buttons

#### Primary Button
```html
<ion-button color="primary">
  <ion-icon slot="start" name="checkmark-outline"></ion-icon>
  Apply
</ion-button>
```

#### Secondary Button
```html
<ion-button color="secondary">
  <ion-icon slot="start" name="arrow-back-outline"></ion-icon>
  Cancel
</ion-button>
```

#### Accent Button
```html
<ion-button color="accent">
  <ion-icon slot="start" name="alert-circle-outline"></ion-icon>
  Warning
</ion-button>
```

#### Outline Button
```html
<ion-button fill="outline">View Details</ion-button>
```

### Cards

#### Basic Card
```html
<ion-card class="glass-card">
  <ion-card-header>
    <ion-card-title>Application Status</ion-card-title>
  </ion-card-header>
  <ion-card-content>
    Your application has been approved.
  </ion-card-content>
</ion-card>
```

#### Hover Card
Cards with the `glass-card` or `custom-card` class automatically elevate on hover.

### Status Badges

#### Success Badge
```html
<span class="status-badge status-approved">Approved</span>
```

#### Pending Badge
```html
<span class="status-badge status-pending">Pending</span>
```

#### Rejected Badge
```html
<span class="status-badge status-rejected">Rejected</span>
```

#### Draft Badge
```html
<span class="status-badge status-draft">Draft</span>
```

### Shadows

```html
<!-- Subtle shadow -->
<div class="shadow-sm">...</div>

<!-- Medium shadow -->
<div class="shadow-md">...</div>

<!-- Large shadow (hover effect) -->
<div class="shadow-lg">...</div>
```

---

## 🎨 Customization Guide

### Changing Primary Color Globally
Edit `:root` in `src/global.scss`:
```scss
:root {
  --theme-primary: #your-color;
  --theme-primary-light: #your-light-color;
  --theme-primary-dark: #your-dark-color;
}
```

### Changing Dark Mode Background
Edit `html.ion-palette-dark` in `src/global.scss`:
```scss
:host-context(.ion-palette-dark) {
  --theme-bg-light: #your-dark-bg;
  --theme-text-primary: #your-light-text;
}
```

### Using Theme Variables in Components
```scss
// In your component SCSS file
.my-component {
  background: var(--theme-card-bg);
  color: var(--theme-text-primary);
  border: 1px solid var(--theme-border);
  border-radius: var(--theme-radius-lg);
  box-shadow: var(--theme-card-shadow);
  transition: var(--theme-transition);
}
```

---

## 📱 Responsive Design

The theme uses Ionic's responsive classes:
```html
<!-- Size based on screen width -->
<ion-col size="12" size-sm="6" size-md="4" size-lg="3">
  Content
</ion-col>

<!-- Hide on small screens -->
<div class="hide-sm">Desktop only</div>

<!-- Show only on large screens -->
<div class="show-lg">Large screens only</div>
```

---

## 🚀 Best Practices

### DO ✅
- Use CSS variables from the theme system
- Maintain consistent spacing using the spacing scale
- Use status colors for user feedback (success, warning, danger, info)
- Test layouts in both light and dark modes
- Use the transition system for all animations

### DON'T ❌
- Hard-code colors - always use CSS variables
- Use custom shadows - use the shadow utilities
- Ignore dark mode - test thoroughly
- Create inconsistent border radius values
- Skip transitions - they enhance UX

---

## 🔧 Toggle Dark Mode

The dark mode can be toggled in the app via the theme button in the toolbar:

```typescript
toggleTheme() {
  this.isDarkMode = !this.isDarkMode;
  
  if (this.isDarkMode) {
    document.documentElement.classList.add('ion-palette-dark');
  } else {
    document.documentElement.classList.remove('ion-palette-dark');
  }
  
  localStorage.setItem('theme-mode', this.isDarkMode ? 'dark' : 'light');
}
```

---

## 📊 Complete CSS Variable Reference

```css
/* Colors */
--theme-primary
--theme-primary-light
--theme-primary-dark
--theme-primary-gradient
--theme-secondary
--theme-secondary-light
--theme-secondary-dark
--theme-accent
--theme-accent-light
--theme-accent-dark
--theme-success
--theme-warning
--theme-danger
--theme-info

/* Backgrounds & Text */
--theme-bg-light
--theme-bg-secondary
--theme-bg-tertiary
--theme-text-primary
--theme-text-secondary
--theme-text-tertiary
--theme-border

/* Cards & Surfaces */
--theme-card-bg
--theme-card-border
--theme-card-shadow
--theme-card-shadow-hover

/* Spacing */
--theme-spacing-xs
--theme-spacing-sm
--theme-spacing-md
--theme-spacing-lg
--theme-spacing-xl
--theme-spacing-xxl

/* Typography */
--theme-font-family
--theme-font-weight-light
--theme-font-weight-regular
--theme-font-weight-medium
--theme-font-weight-bold

/* Border Radius */
--theme-radius-sm
--theme-radius-md
--theme-radius-lg
--theme-radius-xl
--theme-radius-round

/* Transitions */
--theme-transition
--theme-transition-fast
--theme-transition-slow
```

---

## 🎓 Need Help?

For theme adjustments or custom styling needs:
1. Edit `src/global.scss` for global changes
2. Edit component `*.scss` files for local overrides
3. Always use CSS variables for consistency
4. Test changes in both light and dark modes
5. Check responsive behavior on different screen sizes

---

**Enjoy your beautifully themed Kisan Vriksh Yojana application! 🌳**
