

# ক্যালেন্ডার আইকন কালার ও লোগো পজিশন ফিক্স

## পরিবর্তন

### 1. Date input আইকন কালার ফিক্স
`src/index.css`-এ একটি CSS rule যোগ করা হবে যাতে `input[type="date"]`-এর ক্যালেন্ডার আইকন `#C9F368` (primary) কালারে দেখায়:

```css
input[type="date"]::-webkit-calendar-picker-indicator {
  filter: brightness(0) saturate(100%) invert(85%) sepia(45%) saturate(500%) hue-rotate(25deg);
  /* or use a direct color approach */
}
```

এটি TaskModal ও CreateProjectDialog দুই জায়গাতেই কাজ করবে কারণ দুটোতেই `<Input type="date">` ব্যবহার করা হয়েছে।

### 2. লোগো left-align
`src/components/AppSidebar.tsx`-এ লোগো wrapper-এর `justify-center` কে `justify-start` করা হবে (expanded অবস্থায়)।

| ফাইল | পরিবর্তন |
|---|---|
| `src/index.css` | date input calendar icon কালার #C9F368 করা |
| `src/components/AppSidebar.tsx` | লোগো left-align করা |

