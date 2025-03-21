# NC Cigar Sales Form Filler - UI Specification

## Design System

### Typography
- **Primary Font**: Inter
- **Headings**: 
  - H1: Inter 28px/36px, 700 weight
  - H2: Inter 24px/32px, 600 weight
  - H3: Inter 20px/28px, 600 weight
  - H4: Inter 18px/24px, 600 weight
- **Body Text**: 
  - Regular: Inter 16px/24px, 400 weight
  - Small: Inter 14px/20px, 400 weight
- **Form Labels**: Inter 14px/20px, 500 weight
- **Buttons**: Inter 16px/24px, 500 weight

### Color Palette
- **Primary**: #0f766e (teal-700)
  - Hover: #0d9488 (teal-600)
  - Active: #0f766e (teal-700)
  - Light: #99f6e4 (teal-200)
- **Secondary**: #475569 (slate-600)
  - Hover: #64748b (slate-500)
  - Active: #334155 (slate-700)
  - Light: #cbd5e1 (slate-300)
- **Accent**: #f59e0b (amber-500)
  - Hover: #d97706 (amber-600)
  - Active: #b45309 (amber-700)
  - Light: #fcd34d (amber-300)
- **Neutral**: 
  - White: #ffffff
  - Gray-50: #f8fafc
  - Gray-100: #f1f5f9
  - Gray-200: #e2e8f0
  - Gray-300: #cbd5e1
  - Gray-400: #94a3b8
  - Gray-500: #64748b
  - Gray-600: #475569
  - Gray-700: #334155
  - Gray-800: #1e293b
  - Gray-900: #0f172a
  - Black: #020617
- **Semantic**:
  - Success: #22c55e (green-500)
  - Warning: #f59e0b (amber-500)
  - Error: #ef4444 (red-500)
  - Info: #3b82f6 (blue-500)

### Spacing
- **Base Unit**: 4px
- **Spacing Scale**:
  - xs: 4px
  - sm: 8px
  - md: 16px
  - lg: 24px
  - xl: 32px
  - 2xl: 48px
  - 3xl: 64px
  - 4xl: 96px

### Border Radius
- **Small**: 4px
- **Medium**: 6px
- **Large**: 8px
- **XL**: 12px
- **Round**: 9999px (for pills and circles)

### Shadows
- **Small**: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
- **Medium**: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
- **Large**: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)
- **XL**: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)

### Component Styling

#### Buttons
- **Primary Button**:
  - Background: Primary color
  - Text: White
  - Padding: 8px 16px
  - Border Radius: Medium
  - Height: 40px
- **Secondary Button**:
  - Background: White
  - Border: 1px solid Gray-200
  - Text: Gray-700
  - Padding: 8px 16px
  - Border Radius: Medium
  - Height: 40px
- **Tertiary Button**:
  - Background: Transparent
  - Text: Primary color
  - Padding: 8px 16px
  - Border Radius: Medium
  - Height: 40px
- **Danger Button**:
  - Background: Error color
  - Text: White
  - Padding: 8px 16px
  - Border Radius: Medium
  - Height: 40px

#### Form Controls
- **Text Input**:
  - Border: 1px solid Gray-300
  - Border Radius: Medium
  - Padding: 8px 12px
  - Height: 40px
  - Focus: 2px ring Primary Light color
- **Select**:
  - Same as Text Input with dropdown icon
- **Checkbox**:
  - Size: 16px × 16px
  - Checked Color: Primary
- **Radio**:
  - Size: 16px × 16px
  - Checked Color: Primary
- **Table**:
  - Header Background: Gray-100
  - Border: 1px solid Gray-200
  - Row Hover: Gray-50
  - Row Alternate: White/Gray-50

## UI Screens

### 1. Login/Registration Screen

![Login Screen Wireframe](https://via.placeholder.com/800x600?text=Login+Screen+Wireframe)

**Key Elements**:
- Logo and branding at top
- Tab navigation between "Login" and "Register"
- Form fields:
  - Email input
  - Password input (with visibility toggle)
  - Remember me checkbox
  - Forgot password link
- Primary action button (Login/Register)
- SSO buttons:
  - "Continue with Google"
  - "Continue with Apple"
  - "Continue with GitHub"
- Terms of service and privacy policy links

**Interactions**:
- Form validation shows errors inline
  - Red border and error message below invalid fields
  - Green checkmark for valid fields
- Password strength indicator during registration
  - Color-coded strength meter (red, yellow, green)
  - Requirements checklist updates in real-time
- Successful login redirects to Dashboard
- Failed login shows error message
  - Gentle animation to draw attention
  - Clear error message with suggested action
- Password requirements displayed on registration
- Field focus states with clear visual indicators
- Tab key navigation follows logical order

### 2. Dashboard

![Dashboard Wireframe](https://via.placeholder.com/800x600?text=Dashboard+Wireframe)

**Key Elements**:
- Top navigation bar with:
  - Logo
  - User menu (profile, settings, logout)
  - Notifications indicator
  - Help/support button
- Sidebar navigation (collapsible on smaller screens):
  - Dashboard (home)
  - Forms
  - Business Profiles
  - Reports
  - Settings
  - Help & Support
- Welcome section with user name and quick stats
- Summary statistics:
  - Forms submitted this month
  - Total tax calculated
  - Pending drafts
  - Upcoming deadlines
- Quick actions card:
  - "Create New Form" (primary button)
  - "Resume Draft" (if applicable)
  - "Import Data" (for bulk operations)
- Recent submissions table:
  - Date column
  - Form ID column
  - Status column
  - Total entries column
  - Total amount column
  - Actions column (view, download, duplicate)
- Announcements/notifications area
  - System updates
  - Important deadlines
  - Feature announcements

**Interactions**:
- Clicking "Create New Form" navigates to form entry
- Clicking on a recent submission navigates to view/edit it
- Sidebar navigation allows access to other app sections
- Notifications can be marked as read or dismissed
- Table rows are clickable to view details
- Table can be sorted by clicking column headers
- Quick filters above table for common status values
- Hovering over statistics shows additional information

### 3. Form Entry Interface

![Form Entry Wireframe](https://via.placeholder.com/800x600?text=Form+Entry+Wireframe)

**Key Elements**:
- Form header with:
  - Title "NC Cigar Tax Form"
  - Save as draft button
  - Exit button
  - Form status indicator
- Form metadata section:
  - Business profile selector (dropdown)
  - NC DOR ID (from selected profile)
  - Reporting period (date range picker)
  - Form description (optional text field)
- Spreadsheet-like grid with columns:
  - Date of Sale
  - Invoice Number
  - Vendor Name
  - Cigar Description
  - Number of Cigars
  - Cost of Cigar ($)
  - Tax Amount (calculated, read-only)
  - Subtotal (calculated, read-only)
- Row actions:
  - Add row button
  - Delete row button
  - Duplicate row button
  - Drag handle for reordering
- Pagination controls if entries exceed one page
  - Page selector
  - Items per page dropdown
  - First/previous/next/last buttons
- Running totals section:
  - Total number of cigars
  - Total cost amount
  - Total tax amount (12.8%)
  - Total multiplier amount ($0.30 per cigar)
  - Subtotal
  - Discount (2%)
  - Final total amount
- Form actions:
  - "Save Draft" button
  - "Import Data" button
  - "Clear Form" button
  - "Preview Form" button
  - "Generate PDF" button (primary)
- Bulk import/export options:
  - CSV template download
  - Excel template download
  - File upload area
  - Paste from clipboard option

**Interactions**:
- Adding/removing rows updates totals automatically
- Entering data in cost fields triggers calculations
  - Immediate update of calculated fields
  - Formatting of currency values
  - Visual indication of changes
- Validation errors shown inline as user types
  - Field-level validation messages
  - Summary of errors at form level
  - Cannot generate PDF with validation errors
- Saving draft shows confirmation message
  - Toast notification with success message
  - Option to continue editing or exit
- Generate PDF proceeds to preview screen
- Data auto-saves every 30 seconds
- Ability to reorder rows with drag-and-drop
- Keyboard shortcuts for common actions
- Tab navigation through editable fields
- Filter and sort options for entries

### 4. Form Preview

![Form Preview Wireframe](https://via.placeholder.com/800x600?text=Form+Preview+Wireframe)

**Key Elements**:
- Preview header with:
  - "Form Preview" title
  - "Back to Edit" button
  - "Download PDF" button
  - "Print" button
  - Page navigation controls
- PDF preview panel with zoom controls
  - Zoom in/out buttons
  - Fit to width/height options
  - Page thumbnails sidebar
  - Current page indicator
- Form summary sidebar:
  - Reporting period
  - Total entries
  - Total tax amount
  - Form pages (count)
  - Form ID and date created
- Payment section:
  - Payment amount (form generation fee)
  - Payment method selection (credit card, PayPal, etc.)
  - Saved payment methods (if available)
  - "Pay and Download" button
  - Subscription upsell (if applicable)
- Form details accordion:
  - Business information section
  - Entry summary section
  - Calculations breakdown
  - Audit information

**Interactions**:
- PDF preview scrollable and zoomable
  - Mouse wheel zooming
  - Pinch-to-zoom on touch devices
  - Pan by dragging when zoomed in
- Clicking "Back to Edit" returns to form entry
  - Confirmation prompt if changes were made
  - Option to save current state before returning
- Clicking "Pay and Download" processes payment
  - Loading state during processing
  - Error handling for failed payments
  - Success state with download options
- Successfully processed payment enables immediate download
  - Automatic download initiation
  - Email with download link as backup
  - Option to generate additional copies
- Page navigation with keyboard shortcuts
  - Arrow keys for page navigation
  - Ctrl+/- for zoom
  - Esc to exit full-screen preview
- Form details sections expandable/collapsible

### 5. Account Management
![Account Management Wireframe](https://via.placeholder.com/800x600?text=Account+Management+Wireframe)

**Key Elements**:
- Account settings navigation tabs:
  - Profile
  - Business Information
  - Payment Methods
  - Security
  - Preferences
  - Subscription
- Profile section:
  - Email address (with edit option)
  - Name (with edit option)
  - Account created date
  - Profile picture upload
  - Role/permissions indicator
  - Account status
- Business Information section:
  - List of business profiles
  - Add new business profile button
  - For each business:
    - Legal business name (max 35 chars, all caps)
    - NC DOR ID (11 chars)
    - Business address
    - Contact information
    - Default status toggle
  - Edit/delete actions for each profile
- Payment Methods section:
  - Saved payment methods list
  - Default payment method indicator
  - Last 4 digits and expiry for cards
  - Add new payment method button
  - Edit/delete actions for each method
  - Payment history link
- Security section:
  - Change password form
  - Password strength requirements
  - Two-factor authentication toggle
  - Backup codes generation
  - Session management with device list
  - Login history with timestamps and locations
  - Account deletion option (with confirmation)
- Preferences section:
  - Email notification settings
    - Form submission notifications
    - Payment notifications
    - System updates
    - Marketing communications
  - Default form settings
    - Default reporting period
    - Default business profile
    - Table display preferences
    - Currency format
  - Accessibility preferences
    - High contrast mode
    - Font size adjustment
    - Reduced motion toggle
- Subscription section:
  - Current plan details
  - Usage statistics and limits
  - Billing information
  - Payment history
  - Plan upgrade/downgrade options
  - Cancel subscription option

**Interactions**:
- Editing fields shows inline forms
  - Edit/Cancel buttons appear on field focus
  - Real-time validation during editing
  - Save button enables only when valid
- Saving changes shows success confirmation
  - Green toast notification
  - Animated checkmark for visual feedback
  - Field highlight effect on successful update
- Adding payment methods opens secure form
  - Credit card input with validation
  - Address verification fields
  - Security code requirements
  - Payment processor secure iframe
- Changing password requires current password verification
  - Multi-step process for security
  - Email notification of password change
  - Session management options after change
- Adding/removing business profiles
  - Validation against state database (when possible)
  - Warning if deleting a profile used in existing forms
  - Option to transfer forms to another profile
- Subscription management
  - Clear comparison between plan options
  - Prorated billing explanations
  - Confirmation for plan changes
  - Grace period notifications for cancellations

## Responsive Design Guidelines

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Responsive Behavior
- **Navigation**: 
  - Collapses to hamburger menu on tablet and mobile
  - Sidebar becomes bottom navigation on mobile
  - Critical actions remain visible at all screen sizes
  - Search functionality adapts to available width
- **Tables**: 
  - Horizontal scroll on smaller screens, with fixed ID column
  - Card view option for mobile devices
  - Responsive column hiding based on priority
  - Collapsible row details for complex data
- **Forms**: 
  - Stack labels above inputs on mobile
  - Full-width inputs on smaller screens
  - Date picker optimized for touch on mobile
  - Simplified controls for complex interactions
- **Grid Layout**: 
  - Reduces columns or switches to vertical layout
  - Maintains critical information hierarchy
  - Reorders content based on importance
  - Uses collapsible sections for secondary content
- **Font Sizes**: 
  - Slightly reduced on mobile
  - Minimum body text size of 14px
  - Increased line height for readability
  - Respects user font size preferences
- **Spacing**: 
  - Compressed on mobile
  - Maintains minimum 8px between interactive elements
  - Consistent padding within containers
  - Proper whitespace for content separation

### Touch Considerations
- Minimum touch target size: 44px × 44px
- Increased spacing between interactive elements on touch devices
- Implement swipe gestures where appropriate:
  - Swipe between form pages
  - Pull to refresh for data tables
  - Swipe to delete or archive items
  - Horizontal scrolling in carousels
- Visual feedback for touch interactions:
  - Tap highlight color on touch
  - Animation for pressed state
  - Clear focus indicators
  - Haptic feedback where supported

## Accessibility Guidelines

### WCAG 2.1 AA Compliance
- Sufficient color contrast (minimum 4.5:1 for normal text, 3:1 for large text)
- Keyboard navigation for all interactive elements
- Appropriate focus indicators (visible and clearly distinguishable)
- Descriptive link text (no "click here" or "read more")
- Proper heading structure (hierarchical and meaningful)
- Text resizing without loss of content or functionality (up to 200%)
- Consistent navigation patterns across the application
- Multiple ways to find content (search, menus, sitemap)
- Error identification and suggestions for correction
- Form labels and instructions for user input

### Screen Reader Support
- All images have alt text
  - Decorative images have empty alt attributes
  - Complex images have extended descriptions
  - Charts and graphs have text alternatives
- Form inputs have associated labels
  - Explicitly associated using `for` and `id` attributes
  - Error messages linked to respective inputs
  - Required fields clearly indicated
- ARIA attributes where appropriate
  - `aria-required` for mandatory fields
  - `aria-invalid` for validation errors
  - `aria-expanded` for collapsible sections
  - `aria-live` regions for dynamic content
  - `aria-label` for buttons with icon-only interfaces
- Semantic HTML structure
  - Proper use of HTML5 semantic elements
  - Landmarks for main content areas
  - Lists for navigation menus
  - Tables for tabular data only
  - Appropriate use of headings and sections

### Keyboard Navigation
- Logical tab order
  - Follows natural reading flow
  - Grouped by functional sections
  - Skip links for navigation
- Visible focus states
  - Clearly visible focus indicators
  - Consistent styling across components
  - High contrast focus styles
- Keyboard shortcuts for common actions
  - Documented and discoverable
  - Configurable where possible
  - No conflicts with browser or screen reader shortcuts
- Modal focus management
  - Trapped focus in modal dialogs
  - Return focus when closed
  - Escape key closes dialogs

### Form Field Validation Rules
- **Text Fields**:
  - Required field indicators (asterisk and aria-required)
  - Character limits with visible counters
  - Inline validation with clear error messages
  - Error states persist until correction
- **Date Fields**:
  - Format validation (MM/DD/YYYY)
  - Range validation for reporting periods
  - Calendar picker with keyboard navigation
  - Relative date options (e.g., "Previous Month")
- **Numeric Fields**:
  - Format validation for numbers and currency
  - Range validation (min/max values)
  - Step validation for integer-only fields
  - Automatic formatting of currency values

### Error Message Styling
- **Error Container**:
  - Background: Light red (#fee2e2)
  - Border: 1px solid red (#ef4444)
  - Border-radius: Medium (6px)
  - Padding: 12px 16px
  - Icon: Alert triangle
- **Field-Level Errors**:
  - Text color: Error red (#dc2626)
  - Font size: Small (14px)
  - Position: Below input field
  - Icon: Small alert circle
  - Animation: Gentle fade-in
- **Error Message Content**:
  - Be specific about the error
  - Provide clear correction instructions
  - Use positive language
  - Maintain a consistent tone
  - Include validation requirements

### Loading State Designs
- **Page Loading**:
  - Centered spinner with brand colors
  - Progress indicator for longer operations
  - Skeleton screens for content loading
  - Maintain layout stability during loading
- **Button Loading**:
  - Replace text with spinner
  - Disable button during loading
  - Maintain button width
  - Return to original state on completion
- **Table Loading**:
  - Skeleton rows with animated gradient
  - Maintain header visibility
  - Show loading count indication
  - Partial loading for pagination

### Animation and Transition Effects
- **Page Transitions**:
  - Fade in/out (300ms)
  - Slide transitions for related views
  - Respect reduced motion preferences
- **Component Animations**:
  - Dropdown menus: Fade in/slide (150ms)
  - Modal dialogs: Fade in + scale (200ms)
  - Toast notifications: Slide in from top (250ms)
  - Accordion panels: Smooth height transition (200ms)
- **Feedback Animations**:
  - Form submission success: Checkmark animation
  - Error state: Gentle shake animation
  - Button press: Subtle scale down
  - Hover states: Color transitions (100ms)

### Empty State Designs
- **Empty Tables**:
  - Illustration relevant to data type
  - Friendly, informative message
  - Clear call-to-action button
  - Guidance for getting started
- **No Search Results**:
  - Confirmation of search terms
  - Suggestions for broadening search
  - Option to clear filters
  - Alternative actions
- **No Recent Activity**:
  - Welcome message for new users
  - Quick start guide
  - Sample data option
  - Tutorial links