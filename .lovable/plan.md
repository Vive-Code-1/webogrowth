

# "6 Months" → "This Month" পরিবর্তন

## পরিবর্তন
Revenue Overview চার্টে "6 Months" ট্যাবকে "This Month" এ পরিবর্তন করবো। এটি শুধু বর্তমান মাসের দিনগুলোর ডেটা দেখাবে (6 মাসের বদলে)।

## Technical Changes — `src/pages/Dashboard.tsx`

1. **Chart data**: `monthlyChart` (6-month data) কে বদলে `thisMonthChart` বানাবো — বর্তমান মাসের প্রতিটি দিনের budget sum দেখাবে `eachDayOfInterval` ব্যবহার করে
2. **Tab label**: `"6 Months"` → `"This Month"`
3. **Chart type**: Monthly ট্যাবে `AreaChart` রাখবো, কিন্তু X-axis এ দিনের তারিখ দেখাবে (e.g., "1", "2", ... "31")
4. `subMonths`, `eachMonthOfInterval` imports আর দরকার নেই — রিমুভ করবো

