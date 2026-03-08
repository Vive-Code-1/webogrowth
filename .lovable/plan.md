
# মোবাইল UI + প্রোফাইল + পাসওয়ার্ড রিসেট প্ল্যান

## সামারি
এই প্ল্যানে ৪টি মূল ফিচার থাকবে:
1. মোবাইলে bottom navigation bar (সাইডবারের বদলে)
2. ড্যাশবোর্ডে মোবাইল কারেন্সি টগল
3. প্রোফাইল পেজ (ইমেজ আপলোড সহ)
4. পাসওয়ার্ড ফরগট/রিসেট ফ্লো

---

## 1. Mobile Bottom Navigation

### নতুন কম্পোনেন্ট: `src/components/MobileBottomNav.tsx`
- রেফারেন্স ইমেজের মতো pill-shaped bottom bar
- শুধু মোবাইলে (`< 768px`) দেখাবে
- Role-based nav items (admin/team/client অনুযায়ী)
- Active state highlight (primary color circle)
- Icons: Home, Projects, Tasks, Profile

### `src/components/AppLayout.tsx` পরিবর্তন
- মোবাইলে `AppSidebar` হাইড করবো
- মোবাইলে `MobileBottomNav` দেখাবো
- main content এ `pb-20` padding দেবো মোবাইলে

---

## 2. Dashboard Mobile Currency Toggle

### `src/pages/Dashboard.tsx`
- `hidden sm:flex` থেকে কারেন্সি টগল আলাদা করবো
- মোবাইলে header এর নিচে একটি row তে currency toggle দেখাবো
- Exchange rate indicator সহ

---

## 3. Profile Page + Avatar Upload

### Database: Storage bucket
- `avatars` নামে public bucket তৈরি করতে হবে

### নতুন পেজ: `src/pages/Profile.tsx`
- Full name, email দেখাবে
- Avatar আপলোড (Supabase storage)
- Profile update functionality

### Route যোগ
- `/profile` route App.tsx এ

---

## 4. Forgot Password / Reset Password

### `src/pages/Login.tsx` এ
- "Forgot password?" লিংক যোগ করবো

### নতুন পেজ: `src/pages/ForgotPassword.tsx`
- Email input
- `resetPasswordForEmail` কল করবে

### নতুন পেজ: `src/pages/ResetPassword.tsx`
- Recovery token detect করবে
- New password set form
- `updateUser({ password })` কল

### Routes যোগ
- `/forgot-password`
- `/reset-password`

---

## Technical Details

### Files to Create:
1. `src/components/MobileBottomNav.tsx` — Bottom nav bar component
2. `src/pages/Profile.tsx` — Profile page with avatar upload
3. `src/pages/ForgotPassword.tsx` — Email input for password reset
4. `src/pages/ResetPassword.tsx` — Set new password page

### Files to Modify:
1. `src/components/AppLayout.tsx` — Mobile responsive layout, hide sidebar
2. `src/pages/Dashboard.tsx` — Mobile currency toggle visibility
3. `src/pages/Login.tsx` — Forgot password link
4. `src/App.tsx` — New routes

### Database Migration:
- Avatars storage bucket creation with RLS policies
