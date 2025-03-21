# Responsive Design Guidelines

## Breakpoints

The application follows these breakpoints for responsive design:

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## Core Principles

1. **Mobile-First Approach**:
   - Start with mobile layouts and enhance for larger screens
   - Use fluid layouts where possible
   - Prioritize critical functionality on smaller screens

2. **Content Prioritization**:
   - Identify and maintain the most important content at all viewport sizes
   - Reorganize or collapse secondary content on smaller viewports
   - Ensure primary actions remain accessible

3. **Fluid Typography**:
   - Scale font sizes responsively
   - Maintain minimum 14px body text on mobile
   - Ensure adequate line height (150% minimum)

## Component Adaptations

### Navigation
- Collapses to hamburger menu on tablet and mobile
- Sidebar becomes bottom navigation on mobile
- Critical actions remain visible at all screen sizes
- Search functionality adapts to available width

### Tables and Data Grids
- Horizontal scroll on smaller screens with fixed ID column
- Card view option on mobile devices
- Responsive column hiding based on priority
- Collapsible row details for complex data

### Forms
- Stack labels above inputs on mobile
- Full-width inputs on smaller screens
- Date picker optimized for touch on mobile
- Simplified controls for complex interactions

### Grid Layout
- Reduces columns or switches to vertical layout
- Maintains critical information hierarchy
- Reorders content based on importance
- Uses collapsible sections for secondary content

## Touch Considerations

- **Minimum touch target size**: 44px × 44px
- **Increased spacing** between interactive elements on touch devices
- **Swipe gestures** where appropriate:
  - Swipe between form pages
  - Pull to refresh for data tables
  - Swipe to delete or archive items
  - Horizontal scrolling in carousels
- **Visual feedback** for touch interactions:
  - Tap highlight color on touch
  - Animation for pressed state
  - Clear focus indicators
  - Haptic feedback where supported

## Implementation

### CSS Approach
```css
/* Base mobile styles */
.component {
  padding: 0.5rem;
}

/* Tablet styles */
@media (min-width: 640px) {
  .component {
    padding: 1rem;
  }
}

/* Desktop styles */
@media (min-width: 1024px) {
  .component {
    padding: 1.5rem;
  }
}
```

### Tailwind Implementation
```tsx
// Responsive column layouts example
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div>Content 1</div>
  <div>Content 2</div>
  <div>Content 3</div>
</div>

// Responsive typography example
<h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
  Responsive Heading
</h1>

// Responsive spacing example
<div className="p-2 md:p-4 lg:p-6">
  Responsive padding
</div>

// Responsive visibility example
<div className="hidden md:block">
  Only visible on tablet and above
</div>
```

## Testing Requirements

- Test all breakpoints during development
- Verify touch interactions on actual devices
- Ensure keyboard navigation works across all screen sizes
- Test with browser zoom levels (up to 200%)
- Validate performance on lower-end mobile devices
