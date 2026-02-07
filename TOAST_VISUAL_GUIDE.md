# Toast Notification System - Visual Guide

## Toast Types & Appearance

### Success Toast ✅
```
┌─────────────────────────────────────┐
│ ✓  Product created successfully      │ [X]
└─────────────────────────────────────┘
  (Green background - auto-dismiss in 4s)
```

### Error Toast ❌
```
┌─────────────────────────────────────┐
│ ✕  Failed to update profile          │ [X]
└─────────────────────────────────────┘
  (Red background - auto-dismiss in 4s)
```

### Info Toast ℹ️
```
┌─────────────────────────────────────┐
│ ⓘ  Processing your request...       │ [X]
└─────────────────────────────────────┘
  (Blue background - auto-dismiss in 4s)
```

### Warning Toast ⚠️
```
┌─────────────────────────────────────┐
│ ⚠  This action cannot be undone     │ [X]
└─────────────────────────────────────┘
  (Amber background - auto-dismiss in 4s)
```

## Location on Page

All toasts appear in the **bottom-right corner** of the viewport:

```
Desktop View:
┌────────────────────────────────────────────┐
│                                            │
│                  Content Area              │
│                                            │
│                                            │
│         ┌──────────────────────────────┐   │
│         │ ✓  Success message           │X│ │
│         └──────────────────────────────┘   │
└────────────────────────────────────────────┘

Mobile View:
┌──────────────────────────┐
│                          │
│    Content Area          │
│                          │
│   ┌──────────────────┐   │
│   │ ✓  Success      │X│   │
│   └──────────────────┘   │
└──────────────────────────┘
```

## Toast Behavior Timeline

### Auto-dismiss Scenario (Default)
```
Time: 0ms
User Action → API Call

Time: 1500ms
Response received → Toast Appears (fade-in animation)

Time: 2000ms
Toast visible to user

Time: 4000ms
Toast auto-dismisses (fade-out animation)

Time: 4500ms
Toast completely removed
```

### Manual Dismiss Scenario
```
Time: 0ms
User Action → API Call

Time: 1500ms
Response received → Toast Appears

Time: 2500ms
User clicks X button → Toast dismissed immediately

Time: 3000ms
Toast completely removed
```

## Real-World Examples

### Example 1: Creating a Product
```
User clicks "Create Product" → Form submits
↓
Loading state shows "Creating..." button
↓
API response (success)
↓
GREEN TOAST: "Product created successfully"
↓
User redirected to products list
```

### Example 2: Login Error
```
User enters wrong password → Form submits
↓
Loading state shows "Signing in..." button
↓
API response (error: 401 Unauthorized)
↓
RED TOAST: "Invalid email or password"
↓
User can try again
```

### Example 3: Product Visibility Toggle
```
User clicks "Hide Product" button
↓
Button shows "Updating..." state
↓
API request sent
↓
Success response
↓
GREEN TOAST: "Product hidden successfully"
↓
UI updates immediately (button text changes)
```

### Example 4: Designer Registration
```
User fills registration form → Clicks "Register as Designer"
↓
Form validates input
↓
If validation fails: RED TOAST with specific error
   - "Password must be at least 8 characters"
   - "Passwords do not match"
   - "Bio must be at least 10 characters"
↓
If validation passes: API request
↓
If API succeeds: GREEN TOAST: "Registration successful! Please log in."
↓
Redirect to login page
```

## Color Scheme

| Type | Background | Text | Border | Icon |
|------|-----------|------|--------|------|
| Success | Emerald-50 | Emerald-900 | Emerald-200 | ✓ (Emerald-600) |
| Error | Red-50 | Red-900 | Red-200 | ✕ (Red-600) |
| Info | Blue-50 | Blue-900 | Blue-200 | ⓘ (Blue-600) |
| Warning | Amber-50 | Amber-900 | Amber-200 | ⚠ (Amber-600) |

## Responsive Behavior

### Desktop (≥768px)
- Position: Bottom-right, 16px from edge
- Width: Maximum 448px (28rem)
- Font: Default size
- Multiple toasts stack vertically

### Mobile (<768px)
- Position: Bottom-right, 16px from edge
- Width: Maximum 448px, adapts to screen
- Font: Default size
- Multiple toasts stack vertically
- Touch-friendly X button (larger hit area)

## Animation Details

### Fade In
- Duration: 200ms
- Easing: Ease-in
- Opacity: 0 → 1

### Slide In
- Duration: 200ms
- Direction: Up from bottom
- Distance: 16px

### Fade Out (Auto-dismiss)
- Duration: 150ms
- Easing: Ease-out
- Opacity: 1 → 0

## Accessibility

✅ **Color Not Only Indicator**: Icons used alongside colors
✅ **Sufficient Contrast**: All text meets WCAG AA standards
✅ **Keyboard Support**: X button is focusable
✅ **Screen Reader Friendly**: Toast is announced
✅ **No Auto-play Audio**: Uses visual feedback only

## Z-Index Stacking

```
Toast Container: z-50 (fixed position, always on top)
↑
Modals/Dialogs: z-40
↑
Navigation: z-20
↑
Content: z-10
↑
Page Background: z-0
```

This ensures toasts always appear above all other elements.

## Maximum Visible Toasts

The system can display multiple toasts simultaneously:
- Typical limit: 3-4 toasts visible
- Older toasts auto-dismiss to make room
- New toasts appear above existing ones
- All stack with 12px spacing between them
