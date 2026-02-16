# Premium Dark & Light Theme - Complete Guide

## 🎨 **Welcome to Your New Premium Theme**

Your Kisan Vriksh Yojana app now features a **sophisticated, modern design** with a carefully curated color palette that works seamlessly in both light and dark modes.

---

## 🌈 **Color System**

### **Light Mode Palette**

| Element | Color | HEX | Usage |
|---------|-------|-----|-------|
| **Primary** | Teal | `#2c7a7b` | Main actions, headers, navigation |
| **Primary Light** | Light Teal | `#45b7ba` | Hover states, accents |
| **Secondary** | Forest Green | `#1a5f3c` | Secondary actions, badges |
| **Accent** | Gold | `#f59e0b` | Highlights, alerts, CTAs |
| **Success** | Emerald | `#10b981` | Approved, completed, valid |
| **Warning** | Amber | `#f59e0b` | Pending, caution, warning |
| **Danger** | Red | `#ef4444` | Rejected, error, critical |
| **Info** | Sky Blue | `#0ea5e9` | Information, drafts, secondary |
| **Background** | Light Gray | `#f8f9fa` | Page background |
| **Card** | White | `#ffffff` | Card backgrounds |
| **Text Primary** | Dark Slate | `#0f172a` | Main text |
| **Text Secondary** | Slate | `#475569` | Secondary text |
| **Border** | Light Slate | `#cbd5e1` | Borders, dividers |

### **Dark Mode Palette**

| Element | Color | HEX | Usage |
|---------|-------|-----|-------|
| **Background** | Deep Navy | `#0f172a` | Page background |
| **Card** | Dark Slate | `#1e293b` | Card backgrounds |
| **Text Primary** | Light Gray | `#f1f5f9` | Main text |
| **Text Secondary** | Medium Gray | `#cbd5e1` | Secondary text |
| **Border** | Medium Slate | `#475569` | Borders, dividers |
| **Success BG** | Dark Green | `#064e3b` | Success backgrounds |
| **Warning BG** | Dark Orange | `#78350f` | Warning backgrounds |
| **Danger BG** | Dark Red | `#7f1d1d` | Error backgrounds |
| **Info BG** | Dark Blue | `#082f49` | Info backgrounds |

---

## 📦 **Component Styles**

### **Buttons**

#### Primary Button (Main Actions)
```html
<ion-button color="primary">
  <ion-icon slot="start" name="checkmark-outline"></ion-icon>
  Submit Application
</ion-button>
```
- **Features**: Gradient background, shadow elevation, hover animation
- **States**: Default, hover (elevated), active (pressed)

#### Secondary Button (Alt Actions)
```html
<ion-button color="secondary">
  <ion-icon slot="start" name="arrow-back-outline"></ion-icon>
  Back
</ion-button>
```
- **Features**: Forest green background, professional styling

#### Outline Button (Tertiary)
```html
<ion-button fill="outline">
  View Details
</ion-button>
```
- **Features**: Transparent with colored border, hover background

#### Clear Button (Text Only)
```html
<ion-button fill="clear">
  Learn More
</ion-button>
```
- **Features**: Minimal styling, primary color text

### **Cards**

#### Premium Card with Top Accent Bar
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
- **Features**: 
  - Top colored accent bar (4px gradient)
  - Smooth shadow elevation
  - Hover lift effect
  - Rounded corners (16px)

#### Basic Card
```html
<ion-card>
  <ion-card-content>
    Regular card content
  </ion-card-content>
</ion-card>
```

### **Form Controls**

#### Text Input
```html
<ion-label>Mobile Number</ion-label>
<ion-input 
  type="tel" 
  placeholder="Enter mobile number"
  fill="outline">
</ion-input>
```
- **Features**:
  - Fresh focus state with shadow
  - Colored border on focus
  - 44px minimum height for touch
  - Smooth transitions

#### Select Dropdown
```html
<ion-label>Select District</ion-label>
<ion-select fill="outline">
  <ion-select-option value="durg">Durg</ion-select-option>
  <ion-select-option value="raipur">Raipur</ion-select-option>
</ion-select>
```

### **Status Badges**

#### Success Badge (Approved)
```html
<span class="status-badge status-approved">Approved</span>
```
- Color: Emerald (`#10b981`)
- Background: Light emerald with 10% opacity

#### Pending Badge
```html
<span class="status-badge status-pending">Pending Review</span>
```
- Color: Amber (`#f59e0b`)
- Background: Light amber with 10% opacity

#### Rejected Badge
```html
<span class="status-badge status-rejected">Rejected</span>
```
- Color: Red (`#ef4444`)
- Background: Light red with 10% opacity

#### Draft Badge
```html
<span class="status-badge status-draft">Draft</span>
```
- Color: Sky Blue (`#0ea5e9`)
- Background: Light blue with 10% opacity

---

## 🌙 **Dark Mode Features**

### **Automatic Contrast**
- All text automatically adjusts to white/light colors
- Backgrounds become darker for reduced eye strain
- Shadows become more pronounced for depth

### **Toggling Dark Mode**
Users can toggle dark mode via the toolbar button:
```typescript
toggleTheme() {
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
```

### **Dark Mode Advantages**
✅ Reduces eye strain in low-light environments
✅ Saves battery on OLED screens
✅ Professional, modern appearance
✅ Consistent with industry standards

---

## 📐 **Spacing System**

```scss
--theme-spacing-xs: 4px      /* Minimal gaps */
--theme-spacing-sm: 8px      /* Small margins */
--theme-spacing-md: 12px     /* Form elements */
--theme-spacing-lg: 16px     /* Default spacing */
--theme-spacing-xl: 24px     /* Large sections */
--theme-spacing-2xl: 32px    /* Extra large */
--theme-spacing-3xl: 48px    /* Page sections */
--theme-spacing-4xl: 64px    /* Hero areas */
```

**Usage Example**:
```scss
.my-container {
  padding: var(--theme-spacing-lg);
  margin-bottom: var(--theme-spacing-xl);
  gap: var(--theme-spacing-md);
}
```

---

## 🔲 **Border Radius Scale**

```scss
--theme-radius-xs: 2px        /* Minimal rounding */
--theme-radius-sm: 4px        /* Subtle rounding */
--theme-radius-md: 8px        /* Default rounding */
--theme-radius-lg: 12px       /* Prominent rounding */
--theme-radius-xl: 16px       /* Large rounding */
--theme-radius-2xl: 20px      /* Extra large rounding */
--theme-radius-full: 9999px   /* Fully rounded */
```

---

## 💫 **Shadow & Depth System**

### **Shadow Levels** (Light Mode)
```scss
--theme-shadow-xs:  0 1px 2px 0 rgba(0, 0, 0, 0.05);
--theme-shadow-sm:  0 1px 3px 0 rgba(0, 0, 0, 0.1);
--theme-shadow-md:  0 4px 6px -1px rgba(0, 0, 0, 0.1);
--theme-shadow-lg:  0 10px 15px -3px rgba(0, 0, 0, 0.1);
--theme-shadow-xl:  0 20px 25px -5px rgba(0, 0, 0, 0.1);
--theme-shadow-elevation-1: 0 3px 8px rgba(0, 0, 0, 0.08);
--theme-shadow-elevation-2: 0 8px 16px rgba(0, 0, 0, 0.12);
```

### **Custom Usage**:
```scss
.elevated-card {
  box-shadow: var(--theme-shadow-lg);
  
  &:hover {
    box-shadow: var(--theme-shadow-xl);
  }
}
```

---

## ⚡ **Animations & Transitions**

### **Transition Speeds**
```scss
--theme-transition-fast: all 0.15s ease-in-out;   /* Quick feedback */
--theme-transition-base: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);  /* Default */
--theme-transition-slow: all 0.5s ease-in-out;    /* Smooth entrance */
--theme-transition-slower: all 0.7s ease-in-out;  /* Elegant transitions */
```

### **Usage Examples**:
```scss
/* Quick button hover */
ion-button {
  transition: var(--theme-transition-fast);
}

/* Smooth page transitions */
.page-content {
  animation: fadeIn var(--theme-transition-slow);
}
```

---

## 🎯 **Typography System**

### **Font Family**
```scss
--theme-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, ...
--theme-font-family-mono: 'SFMono-Regular', Menlo, 'Courier New', monospace
```

### **Font Weights**
```scss
--theme-font-weight-thin: 100
--theme-font-weight-light: 300
--theme-font-weight-regular: 400
--theme-font-weight-medium: 500
--theme-font-weight-semibold: 600
--theme-font-weight-bold: 700
--theme-font-weight-extrabold: 800
```

### **Line Heights**
```scss
--theme-line-height-tight: 1.2    /* Headings */
--theme-line-height-normal: 1.5   /* Body text */
--theme-line-height-relaxed: 1.75 /* Descriptive text */
```

---

## 🎨 **Customization Guide**

### **Change Primary Color Globally**
Edit `:root` in `src/global.scss`:
```scss
:root {
  --theme-primary: #your-color;
  --theme-primary-light: #your-light-variant;
  --theme-primary-dark: #your-dark-variant;
  --theme-primary-gradient: linear-gradient(135deg, #color1, #color2);
}
```

### **Override Dark Mode Colors**
```scss
html.ion-palette-dark,
body.ion-palette-dark {
  --theme-bg-light: #your-dark-bg;
  --theme-text-primary: #your-light-text;
  --theme-card-bg: #your-card-color;
}
```

### **Apply Theme Variables in Components**
```scss
// In your component SCSS
.my-component {
  background: var(--theme-card-bg);
  color: var(--theme-text-primary);
  border: 1px solid var(--theme-border);
  border-radius: var(--theme-radius-lg);
  box-shadow: var(--theme-shadow-md);
  padding: var(--theme-spacing-lg);
  transition: var(--theme-transition-base);
  font-weight: var(--theme-font-weight-semibold);
}
```

---

## 📱 **Responsive Design**

### **Breakpoints**
```html
<!-- Mobile: < 576px -->
<ion-col size="12">Mobile full width</ion-col>

<!-- Small: 576px - 768px -->
<ion-col size="12" size-sm="6">Half width on sm+</ion-col>

<!-- Medium: 768px - 992px -->
<ion-col size="12" size-sm="6" size-md="4">Third width on md+</ion-col>

<!-- Large: 992px+ -->
<ion-col size="12" size-sm="6" size-md="4" size-lg="3">Quarter width on lg+</ion-col>
```

---

## ✨ **Best Practices**

### **DO ✅**
- Use CSS variables for all styling
- Maintain consistent spacing using the scale
- Use status colors for user feedback
- Test in both light and dark modes
- Apply animations to enhance UX
- Use semantic color meanings (green=success, red=danger)
- Follow the shadow elevation system for depth

### **DON'T ❌**
- Hard-code colors - always use variables
- Create custom border radius values
- Ignore dark mode - test thoroughly
- Skip transitions - they enhance UX
- Use conflicting shadow systems
- Place text directly on images
- Forget accessibility (contrast ratios)

---

## 🚀 **Performance Tips**

1. **Use `var()` CSS selectors** - Best browser support and performance
2. **Leverage `transition-fast`** - For interactive elements
3. **Apply `transition-base`** - For most components
4. **Use `transition-slow`** - For non-critical animations
5. **Limit shadow elevations** - Use only when needed
6. **Cache theme preference** - localStorage for quick loading
7. **Minimize repaints** - Use GPU-accelerated transforms

---

## 📊 **Complete CSS Variable Reference**

```
=== COLORS ===
--theme-primary, --theme-primary-light, --theme-primary-lighter, --theme-primary-dark
--theme-secondary, --theme-secondary-light, --theme-secondary-lighter, --theme-secondary-dark
--theme-accent, --theme-accent-light, --theme-accent-lighter, --theme-accent-dark
--theme-success, --theme-success-light, --theme-success-bg
--theme-warning, --theme-warning-light, --theme-warning-bg
--theme-danger, --theme-danger-light, --theme-danger-bg
--theme-info, --theme-info-light, --theme-info-bg

=== BACKGROUNDS & TEXT ===
--theme-bg-light, --theme-bg-secondary, --theme-bg-tertiary
--theme-text-primary, --theme-text-secondary, --theme-text-tertiary, --theme-text-quaternary
--theme-border, --theme-border-light

=== SURFACES ===
--theme-card-bg, --theme-card-border, --theme-surface-overlay

=== SHADOWS ===
--theme-shadow-xs, --theme-shadow-sm, --theme-shadow-md, --theme-shadow-lg
--theme-shadow-xl, --theme-shadow-2xl
--theme-shadow-elevation-1, --theme-shadow-elevation-2

=== SPACING ===
--theme-spacing-xs, --theme-spacing-sm, --theme-spacing-md, --theme-spacing-lg
--theme-spacing-xl, --theme-spacing-2xl, --theme-spacing-3xl, --theme-spacing-4xl

=== TYPOGRAPHY ===
--theme-font-family, --theme-font-family-mono
--theme-font-weight-thin, --theme-font-weight-light, --theme-font-weight-regular
--theme-font-weight-medium, --theme-font-weight-semibold, --theme-font-weight-bold
--theme-font-weight-extrabold
--theme-line-height-tight, --theme-line-height-normal, --theme-line-height-relaxed
--theme-letter-spacing-tight, --theme-letter-spacing-normal, --theme-letter-spacing-wide

=== BORDER RADIUS ===
--theme-radius-xs, --theme-radius-sm, --theme-radius-md, --theme-radius-lg
--theme-radius-xl, --theme-radius-2xl, --theme-radius-3xl, --theme-radius-full

=== TRANSITIONS ===
--theme-transition-fast, --theme-transition-base, --theme-transition-slow, --theme-transition-slower

=== Z-INDEX ===
--theme-z-hide, --theme-z-auto, --theme-z-base, --theme-z-dropdown, --theme-z-sticky
--theme-z-fixed, --theme-z-modal-backdrop, --theme-z-modal, --theme-z-popover, --theme-z-tooltip
```

---

## 🎓 **Support & Customization**

For any theme customization needs:

1. Start with the primary colors in `:root`
2. Adjust shadows if needed for your aesthetic
3. Customize spacing if your design requires it
4. Test thoroughly in both light and dark modes
5. Ensure all text has sufficient contrast

Your new premium theme is production-ready and follows modern design principles! 🌟

---

**Theme Version**: 2.0 Premium
**Last Updated**: February 2026
**Compatibility**: Ionic 8.7+, Angular 19+
