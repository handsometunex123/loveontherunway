# Toast System - Quick Reference

## Installation & Setup ✅

Already done! The system is:
- ✅ Integrated into `app/layout.tsx`
- ✅ Available in all client components
- ✅ Connected to all API-calling forms

## Quick Usage

### 1-Line Setup
```tsx
const { showToast } = useToast();
```

### Common Patterns

```tsx
// Success
showToast('Data saved successfully', 'success');

// Error with API response
const data = await response.json();
showToast(data.error || 'Failed to save', 'error');

// Loading message (persistent)
showToast('Processing...', 'info', 0);

// Warning
showToast('This action cannot be undone', 'warning');
```

## API Call Pattern

```tsx
const handleSubmit = async () => {
  try {
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    if (response.ok) {
      showToast('Success!', 'success');
      // Refresh or redirect
    } else {
      const error = await response.json();
      showToast(error.error || 'Failed', 'error');
    }
  } catch (err) {
    showToast('An error occurred', 'error');
  }
};
```

## Toast Parameters

| Parameter | Type | Default | Example |
|-----------|------|---------|---------|
| message | string | Required | "Product saved" |
| type | 'success' \| 'error' \| 'info' \| 'warning' | 'info' | 'success' |
| duration | number | 4000 | 2000 |

## Files to Know

| File | Purpose |
|------|---------|
| `context/ToastContext.tsx` | State management |
| `components/ToastContainer.tsx` | UI component |
| `app/layout.tsx` | Integration point |

## Already Integrated Components

- ✅ Login form
- ✅ Designer registration
- ✅ Product management (create/edit/delete)
- ✅ Profile updates
- ✅ Settings changes
- ✅ Voting

## Customization

### Change Auto-dismiss Duration
```tsx
// 2 seconds
showToast('Quick message', 'info', 2000);

// 10 seconds
showToast('Important message', 'warning', 10000);

// Never auto-dismiss
showToast('Persistent message', 'info', 0);
```

### Add to New Component
```tsx
'use client'; // Must be client component

import { useToast } from '@/context/ToastContext';

export default function MyComponent() {
  const { showToast } = useToast();
  
  // Use showToast() anywhere
}
```

## Best Practices

✅ Do:
- Use `'success'` for completed actions
- Use `'error'` for failures
- Use specific, user-friendly messages
- Keep messages short and clear
- Handle errors gracefully

❌ Don't:
- Use for everything (not every action needs feedback)
- Stack too many toasts (more than 3-4)
- Use generic "Error" messages
- Use toasts for critical alerts
- Exceed 2-3 lines of text per toast

## Troubleshooting

**Toast not showing?**
- Ensure component has `'use client'` directive
- Make sure component is wrapped by `ToastProvider` (it is by default in layout)
- Check browser console for errors

**Wrong message type?**
- Use `'success'` for positive outcomes
- Use `'error'` for failures
- Use `'warning'` for cautionary messages
- Use `'info'` for general information

**Toast dismissed too quickly?**
- Increase duration: `showToast(msg, type, 6000)`
- Set to 0 for persistent toast: `showToast(msg, type, 0)`

## Complete Example

```tsx
'use client';

import { useState } from 'react';
import { useToast } from '@/context/ToastContext';

export default function SettingsForm() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSave = async (formData: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        // Error response
        showToast(data.error || 'Failed to save settings', 'error');
        return;
      }

      // Success!
      showToast('Settings saved successfully', 'success');
    } catch (err) {
      showToast('An unexpected error occurred', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSave({ /* form data */ });
    }}>
      {/* form fields */}
      <button disabled={loading}>
        {loading ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
```

## Testing Toasts

You can manually test from browser console:
```javascript
// Won't work directly, but shows intent
// Instead, interact with app normally

// Examples:
// 1. Go to /login and enter wrong password
// 2. Go to /admin/products and delete a product
// 3. Go to /admin/profile and update your info
// 4. Go to /vote and submit a vote
```

## Documentation Files

- 📄 `TOAST_SYSTEM.md` - Full documentation
- 📄 `TOAST_IMPLEMENTATION.md` - Implementation details
- 📄 `TOAST_VISUAL_GUIDE.md` - Visual examples
- 📄 `QUICK_REFERENCE.md` - This file!
