

# ইমেইল ভেরিফিকেশন localhost রিডাইরেক্ট ফিক্স

## সমস্যা
সাইনআপ করার পর ইমেইল ভেরিফিকেশন লিংকে ক্লিক করলে `localhost:3000` এ রিডাইরেক্ট হচ্ছে। দুটি জায়গায় সমস্যা:

1. **Supabase Dashboard Site URL** — `localhost:3000` সেট আছে, এটাই ইমেইল টেমপ্লেটে ব্যবহার হয়
2. **Signup.tsx** — `emailRedirectTo: window.location.origin` ব্যবহার করছে, যা preview URL দেয় — published URL না

## পরিবর্তন

### 1. `src/pages/Signup.tsx`
`emailRedirectTo` কে হার্ডকোড করে published URL দেওয়া:
```ts
emailRedirectTo: "https://webogrowth.lovable.app",
```

### 2. `src/pages/ForgotPassword.tsx`
একই ফিক্স — reset password redirect URL ও published URL হতে হবে।

### 3. Supabase Dashboard (ম্যানুয়াল — আপনাকে করতে হবে)
**Supabase Dashboard → Authentication → URL Configuration**:
- **Site URL**: `https://webogrowth.lovable.app` সেট করুন
- **Redirect URLs** এ যোগ করুন:
  - `https://webogrowth.lovable.app/**`
  - `https://id-preview--9ce009ab-7420-492c-91c4-9057c8a71267.lovable.app/**`

এটি না করলে Supabase ইমেইলে এখনো localhost লিংক পাঠাবে।

| ফাইল | পরিবর্তন |
|---|---|
| `src/pages/Signup.tsx` | `emailRedirectTo` → published URL |
| `src/pages/ForgotPassword.tsx` | `redirectTo` → published URL |
| Supabase Dashboard | Site URL ও Redirect URLs আপডেট (ম্যানুয়াল) |

