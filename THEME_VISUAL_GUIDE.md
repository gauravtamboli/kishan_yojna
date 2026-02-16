# 🎨 Theme System - Visual Component Guide

## Button Styles & Examples

### 1. Primary Button
**Color**: Teal gradient (#2c7a7b → #45b7ba)
**Use Case**: Main actions, submit, apply, save

```html
<ion-button color="primary">
  <ion-icon slot="start" name="checkmark-outline"></ion-icon>
  Submit Application
</ion-button>
```

**States**:
- Default: Gradient, shadow-sm
- Hover: Shadow elevated, translateY(-1px)
- Active: Darker gradient
- Disabled: 50% opacity

**Dark Mode**: Gradient remains, text white

---

### 2. Secondary Button
**Color**: Forest Green (#1a5f3c)
**Use Case**: Alternative actions, back, cancel

```html
<ion-button color="secondary">
  <ion-icon slot="start" name="arrow-back-outline"></ion-icon>
  Go Back
</ion-button>
```

**States**:
- Default: Solid green
- Hover: Lighter green + shadow
- Active: Darker green
- Disabled: 50% opacity

---

### 3. Outline Button
**Color**: Themed border + text
**Use Case**: Tertiary actions, view, learn more

```html
<ion-button fill="outline" color="primary">
  View Details
</ion-button>
```

**States**:
- Default: Transparent, colored border
- Hover: Light background, elevated shadow
- Active: Solid background

---

### 4. Clear Button
**Color**: Text only (primary color)
**Use Case**: Minimal actions, links

```html
<ion-button fill="clear" color="primary">
  Learn More →
</ion-button>
```

**States**:
- Default: Text only
- Hover: Underline appears
- Active: Text darker

---

## Card Styles & Examples

### Premium Card with Gradient Top Border
```html
<ion-card class="glass-card">
  <ion-card-header>
    <ion-card-title>Application Status</ion-card-title>
    <ion-card-subtitle>Submitted on Feb 15, 2026</ion-card-subtitle>
  </ion-card-header>
  <ion-card-content>
    Your application has been reviewed and approved.
  </ion-card-content>
  <ion-card-footer>
    <ion-button fill="clear">View Details</ion-button>
  </ion-card-footer>
</ion-card>
```

**Visual**:
```
┌─────────────────────────────────────────┐
│█████████ GRADIENT TOP BORDER ███████████│ ← 4px gradient accent
│                                         │
│  Application Status                     │
│  Submitted on Feb 15, 2026              │
│                                         │
│  Your application has been reviewed and │
│  approved.                              │
│                                         │
│  [View Details]                         │
└─────────────────────────────────────────┘
```

**Features**:
- Gradient top border (4px, colored)
- Rounded corners (16px)
- Shadow: shadow-md (default)
- Shadow: shadow-lg (on hover)
- White background (light mode)
- Dark slate background (dark mode)
- Smooth lift on hover (translateY -2px)

---

## Form Elements

### Text Input
```html
<ion-item>
  <ion-label position="floating">Mobile Number</ion-label>
  <ion-input 
    type="tel"
    fill="outline"
    placeholder="Enter your number"
    required>
  </ion-input>
</ion-item>
```

**States**:
- Default: Border #cbd5e1, height 44px
- Focus: Border primary color, shadow-md
- Filled: Background #f3f4f6
- Error: Border danger color #ef4444
- Disabled: 50% opacity, cursor not-allowed

### Select Dropdown
```html
<ion-item>
  <ion-label position="floating">Select District</ion-label>
  <ion-select 
    fill="outline"
    required>
    <ion-select-option value="durg">Durg</ion-select-option>
    <ion-select-option value="raipur">Raipur</ion-select-option>
  </ion-select>
</ion-item>
```

### Textarea
```html
<ion-item>
  <ion-label position="floating">Comments</ion-label>
  <ion-textarea
    fill="outline"
    placeholder="Enter your comments"
    rows="3"
    counter
    maxlength="500">
  </ion-textarea>
</ion-item>
```

---

## Status Badges

### Approved Badge
```html
<span class="status-badge status-approved">
  ✓ Approved
</span>
```
- **Color**: Emerald green (#10b981)
- **Background**: Light green (10% opacity)
- **Text**: Uppercase, bold, letter-spaced
- **Use**: Successful completion, approved status

### Pending Badge
```html
<span class="status-badge status-pending">
  ⏳ Pending Review
</span>
```
- **Color**: Amber (#f59e0b)
- **Background**: Light amber (10% opacity)
- **Use**: Awaiting action, pending state

### Rejected Badge
```html
<span class="status-badge status-rejected">
  ✕ Rejected
</span>
```
- **Color**: Red (#ef4444)
- **Background**: Light red (10% opacity)
- **Use**: Failed, rejected, error state

### Draft Badge
```html
<span class="status-badge status-draft">
  📝 Draft
</span>
```
- **Color**: Sky blue (#0ea5e9)
- **Background**: Light blue (10% opacity)
- **Use**: Work in progress, draft state

---

## Table Styling

### Basic Table with Premium Header
```html
<table>
  <thead>
    <tr>
      <th>Applicant Name</th>
      <th>Application Date</th>
      <th>Status</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Rajesh Kumar</td>
      <td>Feb 15, 2026</td>
      <td><span class="status-badge status-approved">Approved</span></td>
      <td><ion-button fill="clear">View</ion-button></td>
    </tr>
  </tbody>
</table>
```

**Header Styling**:
- Background: Primary gradient (teal colors)
- Text: White, bold, uppercase
- Height: 48px minimum
- Letter-spacing: 0.5px
- Font-weight: 600

**Row Styling**:
- Default: White background (light) / Dark background (dark)
- Alternating: Subtle background color
- Hover: Light overlay background
- Height: 44px minimum

**Dark Mode**:
- Header: Primary gradient (same)
- Rows: Dark slate backgrounds
- Text: White/light gray
- Hover: Darker overlay

---

## Toolbar Header

### Dashboard Header (70px height)
```html
<ion-toolbar color="primary">
  <ion-buttons slot="start">
    <ion-menu-button></ion-menu-button>
  </ion-buttons>
  <ion-title>Dashboard</ion-title>
  <ion-buttons slot="end">
    <ion-button>
      <ion-icon slot="icon-only" name="settings-outline"></ion-icon>
    </ion-button>
  </ion-buttons>
</ion-toolbar>
```

**Styling**:
- Background: Primary gradient (#2c7a7b → #45b7ba)
- Height: 70px
- Shadow: elevation-2
- Text: White
- Padding: Safe area inset top
- Flex: Center aligned

**Dark Mode**:
- Gradient remains the same
- Text and icons: White
- Shadow more pronounced

---

## Animation Examples

### Fade In
```html
<div class="fade-in">
  Content fades in smoothly
</div>
```

**Effect**: Opacity: 0 → 1 over 0.3s

### Slide Up
```html
<div class="slide-in-up">
  Content slides up smoothly
</div>
```

**Effect**: TranslateY(20px) + Opacity: 0 → TranslateY(0) + Opacity: 1 over 0.3s

### Pulse
```html
<div class="pulse">
  Pulsing indicator
</div>
```

**Effect**: Opacity oscillates: 0.5 ↔ 1 continuously over 2s

---

## Spacing & Layout

### Spacing Scale Applied
```
xs: 4px   gap between tight elements
sm: 8px   small margin, label spacing
md: 12px  form element spacing
lg: 16px  standard padding, margins ← Most common
xl: 24px  section gaps
2xl: 32px container spacing
3xl: 48px major sections
4xl: 64px page-level spacing
```

### Example Layout
```scss
.card-container {
  margin: var(--theme-spacing-xl);        // 24px from edges
  padding: var(--theme-spacing-lg);       // 16px inside
  gap: var(--theme-spacing-md);           // 12px between items
  border-radius: var(--theme-radius-lg);  // 12px corners
  box-shadow: var(--theme-shadow-md);     // Medium depth
}
```

---

## Shadow Elevation Guide

### Visual Depth Progression
```
No Shadow         ↓
Shadow XS (1px)   ↓
Shadow SM (light) ↓ ← Default for small elements
Shadow MD (soft)  ↓ ← Default for cards
Shadow LG (strong)↓
Shadow XL (very strong) ↓
Elevation 1       ↓
Elevation 2       ↓ ← Toolbars, headers
(Maximum depth)   ↓
```

### Usage Examples
```scss
// Button default
box-shadow: var(--theme-shadow-sm);

// Button hover
box-shadow: var(--theme-shadow-lg);

// Card default
box-shadow: var(--theme-shadow-md);

// Card hover
box-shadow: var(--theme-shadow-xl);

// Toolbar
box-shadow: var(--theme-shadow-elevation-2);

// Modal/Popover
box-shadow: var(--theme-shadow-xl);
```

---

## Border Radius Options

### Radius Scale
```
xs:   2px         (Subtle, minimal rounding)
sm:   4px         (Light rounding)
md:   8px         (Default, most common)
lg:  12px         (Rounded feel)
xl:  16px         (Cards, prominent)
2xl: 20px         (Extra rounded)
full: 9999px      (Perfect circles/pills)
```

### Applied To
```
Buttons:     var(--theme-radius-md)    // 8px
Cards:       var(--theme-radius-lg)    // 12px
Forms:       var(--theme-radius-md)    // 8px
Badges:      var(--theme-radius-sm)    // 4px
Modals:      var(--theme-radius-xl)    // 16px
Avatars:     var(--theme-radius-full)  // Circle
```

---

## Font Weights & Typography

### Weight Scale (7 levels)
```
100: Thin       (Decorative, headings)
300: Light      (Secondary text)
400: Regular    (Body text, default)
500: Medium     (Slightly emphasized)
600: Semibold   (Section headers)
700: Bold       (Emphasis, labels)
800: Extrabold  (Strong emphasis)
```

### Line Heights
```
1.2: Tight      (Headings, dense content)
1.5: Normal     (Body text, comfortable reading) ← Default
1.75: Relaxed   (Descriptive text, accessibility)
```

### Typography Examples
```scss
// Heading
h1, h2, h3 {
  font-weight: var(--theme-font-weight-bold);      // 700
  line-height: var(--theme-line-height-tight);     // 1.2
}

// Body text
p, span {
  font-weight: var(--theme-font-weight-regular);  // 400
  line-height: var(--theme-line-height-normal);   // 1.5
}

// Label
label {
  font-weight: var(--theme-font-weight-semibold); // 600
  line-height: var(--theme-line-height-normal);   // 1.5
}
```

---

## Color Semantics

### Use Colors Meaningfully
```
🟢 Green (#10b981)   = Success, Approved, Valid, Complete
🟡 Amber (#f59e0b)   = Warning, Pending, Caution, Review
🔴 Red (#ef4444)     = Error, Rejected, Critical, Delete
🔵 Blue (#0ea5e9)    = Info, Draft, Secondary, Help
🔷 Teal (#2c7a7b)    = Primary, Main action, Brand
🟢 Green2 (#1a5f3c)  = Secondary, Alternative action
```

### Wrong vs Right
```
❌ Wrong:  <button class="status-badge danger">Approved</button>
✅ Right:  <button class="status-badge success">Approved</button>

❌ Wrong:  <button class="text-primary">Delete Account</button>
✅ Right:  <button class="text-danger">Delete Account</button>

❌ Wrong:  <button color="secondary">Save</button>
✅ Right:  <button color="primary">Save</button>
```

---

## Dark Mode Visual Comparison

### Light Mode
```
Background:  #f8f9fa (light gray)
Cards:       #ffffff (white)
Text:        #0f172a (dark blue)
Shadows:     Subtle, 10% black
Headers:     Teal gradient
Accents:     Gold highlight
```

### Dark Mode (Same Colors, Inverted)
```
Background:  #0f172a (blue-black)
Cards:       #1e293b (dark slate)
Text:        #f1f5f9 (light gray)
Shadows:     Pronounced, 20% black
Headers:     Same teal gradient
Accents:     Gold highlight (brighter)
```

### Automatic Switching
```html
<!-- Light Mode (default) -->
<div class="my-element">
  background: var(--theme-card-bg);     /* #ffffff */
  color: var(--theme-text-primary);     /* #0f172a */
</div>

<!-- Dark Mode (when .ion-palette-dark is applied) -->
<!-- Same HTML, variables auto-switch to: -->
<!-- background: #1e293b, color: #f1f5f9 -->
```

---

## Responsive Grid Examples

### Mobile Layout (< 576px)
```html
<ion-row>
  <ion-col size="12">
    Full width card on mobile
  </ion-col>
</ion-row>
```

### Small Devices (576px+)
```html
<ion-row>
  <ion-col size="12" size-sm="6">
    Half width card on small devices
  </ion-col>
  <ion-col size="12" size-sm="6">
    Second column
  </ion-col>
</ion-row>
```

### Medium Devices (768px+)
```html
<ion-row>
  <ion-col size="12" size-sm="6" size-md="4">
    Third width on medium+
  </ion-col>
</ion-row>
```

### Large Devices (992px+)
```html
<ion-row>
  <ion-col size="12" size-sm="6" size-md="4" size-lg="3">
    Quarter width on large screens
  </ion-col>
</ion-row>
```

---

## Quick Copy-Paste Components

### Premium Card
```html
<ion-card class="glass-card">
  <ion-card-header>
    <ion-card-title>Card Title</ion-card-title>
  </ion-card-header>
  <ion-card-content>
    Card content here
  </ion-card-content>
</ion-card>
```

### Status Row
```html
<ion-item>
  <ion-label>Status</ion-label>
  <ion-badge slot="end" class="status-badge status-approved">
    Approved
  </ion-badge>
</ion-item>
```

### Action Buttons
```html
<ion-row class="ion-padding">
  <ion-col size="12" size-sm="6">
    <ion-button color="secondary" expand="block">
      Cancel
    </ion-button>
  </ion-col>
  <ion-col size="12" size-sm="6">
    <ion-button color="primary" expand="block">
      Submit
    </ion-button>
  </ion-col>
</ion-row>
```

### Form Group
```html
<ion-card class="ion-margin">
  <ion-card-header>
    <ion-card-title>Personal Information</ion-card-title>
  </ion-card-header>
  <ion-card-content>
    <ion-item>
      <ion-label position="floating">Full Name</ion-label>
      <ion-input fill="outline" required></ion-input>
    </ion-item>
    
    <ion-item>
      <ion-label position="floating">Email</ion-label>
      <ion-input fill="outline" type="email" required></ion-input>
    </ion-item>
  </ion-card-content>
</ion-card>
```

---

**Visual Guide Version**: 1.0
**For Theme Version**: 2.0 Premium
**Framework**: Ionic 8.7+ with Angular 19+
