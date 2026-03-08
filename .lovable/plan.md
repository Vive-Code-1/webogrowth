

# প্রোফাইল পাসওয়ার্ড চেঞ্জ + মোবাইল রেস্পন্সিভ + প্রোফাইল পিকচার সব রোলে

## বর্তমান অবস্থা
- Profile পেজ আছে — avatar upload ও name edit কাজ করে
- পাসওয়ার্ড চেঞ্জ অপশন নেই
- MobileBottomNav এ Profile লিংক আছে সব রোলের জন্য
- AppLayout এ header এ avatar দেখায় কিন্তু প্রোফাইল লিংক নেই
- কিছু পেজে টেবিল/কার্ড মোবাইলে overflow হতে পারে

## পরিবর্তনসমূহ

### 1. Profile পেজে পাসওয়ার্ড চেঞ্জ সেকশন — `src/pages/Profile.tsx`
- "Change Password" সেকশন যোগ করবো
- Current password field লাগবে না (Supabase `updateUser({ password })` কল করলেই হয় logged-in অবস্থায়)
- New password + Confirm password ফিল্ড
- Validation: minimum 6 chars, passwords match
- `supabase.auth.updateUser({ password: newPassword })` কল

### 2. AppLayout Header এ প্রোফাইল লিংক — `src/components/AppLayout.tsx`
- Header এর Avatar ক্লিক করলে `/profile` এ যাবে
- Avatar তে প্রোফাইল ইমেজ দেখাবে (যদি আপলোড করা থাকে)

### 3. মোবাইল রেস্পন্সিভ উন্নতি — একাধিক পেজ
নিচের পেজগুলোতে মোবাইল ফ্রেন্ডলি করবো:

- **Tasks.tsx**: ফিল্টার row কে `flex-wrap` করবো, টেবিল row কে কার্ড ভিউ করবো মোবাইলে
- **Team.tsx / Clients.tsx**: কার্ড গ্রিড ইতিমধ্যে `grid-cols-1 md:grid-cols-2` আছে — ঠিক আছে
- **ProjectDetail.tsx**: Info grid ও Kanban board মোবাইলে horizontal scroll যোগ
- **PendingUsers.tsx**: কার্ড লেআউট মোবাইলে stack করবো
- **Dashboard.tsx**: Currency toggle মোবাইলে ইতিমধ্যে visible — stat cards গ্রিড ঠিক করবো
- **Profile.tsx**: ইতিমধ্যে `max-w-lg mx-auto` — মোবাইলে ভালো কাজ করবে

### 4. কোনো ডাটাবেজ পরিবর্তন লাগবে না
- avatars bucket ইতিমধ্যে আছে
- profiles টেবিলে avatar_url কলাম আছে
- RLS policies ঠিক আছে (users can update own profile)

### ফাইল পরিবর্তন তালিকা:
| ফাইল | পরিবর্তন |
|---|---|
| `src/pages/Profile.tsx` | পাসওয়ার্ড চেঞ্জ সেকশন যোগ |
| `src/components/AppLayout.tsx` | Avatar কে profile link করা + profile image দেখানো |
| `src/pages/Tasks.tsx` | মোবাইল কার্ড ভিউ, filter wrap |
| `src/pages/ProjectDetail.tsx` | মোবাইল responsive info + kanban |
| `src/pages/PendingUsers.tsx` | মোবাইল stack layout |
| `src/pages/MyTasks.tsx` | মোবাইল কার্ড spacing |
| `src/pages/Dashboard.tsx` | Stat grid mobile fix |

