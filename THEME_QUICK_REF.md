# 🎨 Premium Theme - Quick Reference Cheat Sheet

## Color Palette at a Glance

### Light Mode
```
🎨 PRIMARY (Teal)      #2c7a7b     Main brand color
🎨 SECONDARY (Green)   #1a5f3c     Alternative actions
🎨 ACCENT (Gold)       #f59e0b     Highlights & alerts
✅ SUCCESS (Emerald)   #10b981     Approved/Valid
⚠️  WARNING (Amber)     #f59e0b     Pending/Caution
❌ DANGER (Red)        #ef4444     Error/Rejected
ℹ️  INFO (Sky)         #0ea5e9     Info/Draft
```

### Dark Mode
```
🌙 BACKGROUND         #0f172a     Deep navy page bg
🌙 CARD BG            #1e293b     Card backgrounds
🌙 TEXT PRIMARY       #f1f5f9     Main white text
🌙 TEXT SECONDARY     #cbd5e1     Secondary text
🌙 BORDER             #475569     Dividers
```

---

## Quick Component Usage

### Buttons
```html
<!-- Primary Action (Blue gradient) -->
<ion-button color="primary">Submit</ion-button>

<!-- Secondary Action (Green) -->
<ion-button color="secondary">Back</ion-button>

<!-- Outline Button -->
<ion-button fill="outline">View</ion-button>

<!-- Clear/Text Button -->
<ion-button fill="clear">Learn More</ion-button>
```

### Cards
```html
<ion-card class="glass-card">
  <ion-card-header>
    <ion-card-title>Premium Card</ion-card-title>
  </ion-card-header>
  <ion-card-content>Content with gradient top border</ion-card-content>
</ion-card>
```

### Badges & Status
```html
<span class="status-badge status-approved">✓ Approved</span>
<span class="status-badge status-pending">⏳ Pending</span>
<span class="status-badge status-rejected">✕ Rejected</span>
<span class="status-badge status-draft">📝 Draft</span>
```

### Forms
```html
<ion-label>Field Label</ion-label>
<ion-input fill="outline" placeholder="Enter text"></ion-input>
<ion-select fill="outline">
  <ion-select-option>Option 1</ion-select-option>
</ion-select>
```

---

## CSS Variable Categories

| Category | Variables | Count |
|----------|-----------|-------|
| 🎨 Colors | `--theme-primary*`, `--theme-secondary*`, etc. | 40+ |
| 📦 Spacing | `--theme-spacing-xs` to `--theme-spacing-4xl` | 8 |
| 🔲 Radius | `--theme-radius-xs` to `--theme-radius-full` | 7 |
| 💫 Shadows | `--theme-shadow-*` (8 levels) | 10 |
| ⚡ Transitions | `--theme-transition-*` (4 speeds) | 4 |
| 🔤 Typography | `--theme-font-*`, `--theme-line-height-*` | 15+ |
| 🎯 Z-Index | `--theme-z-*` (11 levels) | 11 |

---

## Dark Mode Toggle

```typescript
// In your component
toggleDarkMode() {
  this.isDarkMode = !this.isDarkMode;
  
  if (this.isDarkMode) {
    document.documentElement.classList.add('ion-palette-dark');
    document.body.classList.add('ion-palette-dark');
  } else {
    document.documentElement.classList.remove('ion-palette-dark');
    document.body.classList.remove('ion-palette-dark');
  }
  
  localStorage.setItem('theme-mode', this.isDarkMode ? 'dark' : 'light');
}

// On component init
ngOnInit() {
  const saved = localStorage.getItem('theme-mode');
  this.isDarkMode = saved === 'dark';
  this.toggleDarkMode();
}
```

---

## Spacing Scale Quick Reference

| Alias | Value | Use Case |
|-------|-------|----------|
| `xs` | 4px | Minimal gaps, tight spacing |
| `sm` | 8px | Small margins, label spacing |
| `md` | 12px | UI element spacing |
| `lg` | 16px | Default padding, margins |
| `xl` | 24px | Large section gaps |
| `2xl` | 32px | Large container spacing |
| `3xl` | 48px | Major section breaks |
| `4xl` | 64px | Page-level spacing |

### Usage
```scss
padding: var(--theme-spacing-lg);        // 16px
margin-bottom: var(--theme-spacing-xl);  // 24px
gap: var(--theme-spacing-md);            // 12px
```

---

## Shadow Elevation Scale

| Level | Depth | Use Case |
|-------|-------|----------|
| `xs` | Minimal | Subtle elevation on hover |
| `sm` | Light | Cards, buttons |
| `md` | Medium | Default card elevation |
| `lg` | Strong | Elevated panels |
| `xl` | Very Strong | Overlays, modals |
| `elevation-1` | Medium | Focused items |
| `elevation-2` | High | Toolbars, headers |

### Usage
```scss
.card {
  box-shadow: var(--theme-shadow-md);
  
  &:hover {
    box-shadow: var(--theme-shadow-lg);
  }
}
```

---

## Utility Classes

### Shadows
```html
<div class="shadow-sm">Light shadow</div>
<div class="shadow-md">Medium shadow</div>
<div class="shadow-lg">Large shadow</div>
```

### Border Radius
```html
<div class="rounded-sm">2px radius</div>
<div class="rounded-md">8px radius</div>
<div class="rounded-lg">12px radius</div>
<div class="rounded-full">Fully rounded</div>
```

### Text Colors
```html
<p class="text-primary">Primary color text</p>
<p class="text-secondary">Secondary color text</p>
<p class="text-accent">Accent color text</p>
<p class="text-success">Success green</p>
<p class="text-warning">Warning amber</p>
<p class="text-danger">Danger red</p>
```

### Animations
```html
<!-- Fade in effect -->
<div class="fade-in">Fades in smoothly</div>

<!-- Slide up effect -->
<div class="slide-in-up">Slides up on load</div>

<!-- Pulse effect -->
<div class="pulse">Pulses continuously</div>
```

---

## Typography Quick Ref

### Font Weights
```scss
--theme-font-weight-thin: 100
--theme-font-weight-light: 300
--theme-font-weight-regular: 400
--theme-font-weight-medium: 500
--theme-font-weight-semibold: 600
--theme-font-weight-bold: 700
--theme-font-weight-extrabold: 800
```

### Line Heights
```scss
--theme-line-height-tight: 1.2    // Headings
--theme-line-height-normal: 1.5   // Body
--theme-line-height-relaxed: 1.75 // Descriptive
```

---

## Component States

### Button States
```
Default   → Normal color
Hover     → Elevated (translateY -1px) + shadow increase
Active    → Pressed effect
Disabled  → 50% opacity, no interaction
```

### Form Elements
```
Default   → Border: --theme-border
Focus     → Border: --theme-primary, Shadow: var(--theme-shadow-md)
Filled    → Background: var(--theme-bg-secondary)
Error     → Border color: --theme-danger
```

### Cards
```
Default   → Shadow: --theme-shadow-md
Hover     → Shadow: --theme-shadow-lg, Transform: translateY(-2px)
Active    → Border: 2px solid --theme-primary
```

---

## Testing Checklist

- [ ] Light mode renders correctly on all pages
- [ ] Dark mode text is visible and readable (white)
- [ ] Buttons have proper hover/active states
- [ ] Cards show gradient top border
- [ ] Forms are 44px minimum height
- [ ] Shadows add depth without overwhelming
- [ ] Status badges show correct colors
- [ ] Tables have gradient headers
- [ ] Animations are smooth (no jank)
- [ ] Dark mode toggle persists on reload
- [ ] Spacing is consistent throughout
- [ ] Border radius looks modern
- [ ] Contrast ratios meet accessibility standards

---

## File Locations

| File | Purpose |
|------|---------|
| `src/global.scss` | Main theme system, 1100+ lines |
| `PREMIUM_THEME_GUIDE.md` | Complete documentation |
| `THEME_QUICK_REF.md` | This file! |
| Component SCSS files | Component-specific overrides using variables |

---

## Pro Tips

✨ **Always use CSS variables** - Never hard-code colors or spacing
✨ **Test in dark mode** - Your app supports it, use it!
✨ **Use semantic colors** - Green for success, red for danger, etc.
✨ **Respect spacing scale** - Creates visual hierarchy
✨ **Apply transitions** - Smooth interactions feel premium
✨ **Combine with angular** - Use `ngClass` for dynamic themes
✨ **Monitor performance** - CSS variables are efficient!

---

## Customization Examples

### Change Primary Color
```scss
:root {
  --theme-primary: #your-color;
  --theme-primary-light: #your-light;
  --theme-primary-gradient: linear-gradient(135deg, #color1, #color2);
}
```

### Add Custom Color
```scss
:root {
  --theme-custom: #your-color;
  --theme-custom-light: #lighter;
  --theme-custom-dark: #darker;
}

html.ion-palette-dark,
body.ion-palette-dark {
  --theme-custom: #dark-variant;
}
```

### Override Dark Mode Colors
```scss
html.ion-palette-dark,
body.ion-palette-dark {
  --theme-bg-light: #1a1a1a;
  --theme-text-primary: #f5f5f5;
}
```

---

## Support

For issues or questions:
1. Check if CSS variables are being used
2. Verify dark mode class is applied to html/body
3. Check for hard-coded colors (replace with variables!)
4. Test in both light and dark modes
5. Ensure localStorage is accessible

---

**Version**: 2.0 Premium
**Updated**: February 2026
**Framework**: Angular 19+ + Ionic 8.7+
