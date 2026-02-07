# Toast Notification System

A comprehensive toast notification system has been implemented across the Love On The Runway application. The system provides feedback for all API calls with appropriate success, error, warning, and info messages.

## Features

- **Global Toast Container**: Toasts appear in the bottom-right corner of the page
- **Auto-dismiss**: Toasts automatically disappear after 4 seconds (configurable)
- **Multiple Types**: Support for `success`, `error`, `info`, and `warning` toast types
- **Manual Dismiss**: Users can close toasts by clicking the X button
- **Clean UI**: Beautiful, responsive design with appropriate colors for each type

## How to Use

### 1. Basic Usage in Client Components

Import and use the `useToast` hook in any client component:

```tsx
'use client';

import { useToast } from '@/context/ToastContext';

export default function MyComponent() {
  const { showToast } = useToast();

  const handleClick = async () => {
    try {
      const response = await fetch('/api/some-endpoint', {
        method: 'POST',
        body: JSON.stringify(data)
      });

      if (response.ok) {
        showToast('Operation successful!', 'success');
      } else {
        const error = await response.json();
        showToast(error.message, 'error');
      }
    } catch (err) {
      showToast('An error occurred', 'error');
    }
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

### 2. Toast Types

```tsx
showToast('Success message', 'success');  // Green - for successful operations
showToast('Error message', 'error');      // Red - for errors
showToast('Info message', 'info');        // Blue - for general information
showToast('Warning message', 'warning');  // Amber - for warnings
```

### 3. Custom Duration

```tsx
// Default is 4000ms (4 seconds)
showToast('Message', 'success', 4000);

// Keep toast visible indefinitely (0 = no auto-dismiss)
showToast('Persistent message', 'info', 0);

// Dismiss after 2 seconds
showToast('Quick message', 'warning', 2000);
```

## Implementation Details

### Files Created/Modified

1. **`context/ToastContext.tsx`** - Context and provider for managing toast state
2. **`components/ToastContainer.tsx`** - UI component that renders all toasts
3. **`app/layout.tsx`** - Updated to wrap app with `ToastProvider` and include `ToastContainer`

### Updated Components

All forms and API-calling components have been updated to use the toast system:

- `app/login/LoginForm.tsx` - Login errors
- `app/auth/designer-register/DesignerRegisterForm.tsx` - Registration feedback
- `app/admin/products/AdminProductsClient.tsx` - Product operations (create, delete, visibility)
- `app/admin/products/create/ProductForm.tsx` - Product creation/editing
- `app/admin/profile/profile-form.tsx` - Profile updates
- `app/admin/settings/SettingsForm.tsx` - Settings updates
- `app/vote/vote-form.tsx` - Voting feedback

## API Response Format

For toasts to work properly, your API endpoints should return JSON with an `error` field on failure:

```tsx
// Success
{ success: true, data: { /* ... */ } }

// Error
{ error: "User not found" }
```

## Styling

The toast system uses Tailwind CSS with the following color schemes:

- **Success**: Emerald background, text, and border
- **Error**: Red background, text, and border
- **Info**: Blue background, text, and border
- **Warning**: Amber background, text, and border

All toasts feature:
- Smooth fade-in and slide-in animations
- Icons indicating the message type
- Close button for manual dismissal
- Responsive sizing for mobile and desktop
- Maximum width of 28rem (448px) for readability
