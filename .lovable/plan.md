

# পেন্ডিং ইউজার না দেখানোর বাগ ফিক্স

## সমস্যা
`handle_new_user()` ফাংশন আছে কিন্তু `auth.users` টেবিলে কোনো **trigger** নেই। তাই নতুন সাইনআপে `profiles` টেবিলে row তৈরি হচ্ছে না → `usePendingUsers` hook কোনো pending user খুঁজে পাচ্ছে না।

## সমাধান

### 1. Database Migration — trigger তৈরি
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### 2. Profiles INSERT policy যোগ
বর্তমানে profiles টেবিলে INSERT policy নেই। `handle_new_user()` ফাংশন `SECURITY DEFINER` তাই RLS bypass করে — কিন্তু নিরাপত্তার জন্য এবং ভবিষ্যতে কোনো সমস্যা না হওয়ার জন্য profiles এ একটি INSERT policy থাকা উচিত নয় (trigger SECURITY DEFINER দিয়ে কাজ করবে)।

### 3. বিদ্যমান ইউজারদের জন্য backfill
যেসব ইউজার ইতিমধ্যে সাইনআপ করেছে কিন্তু profiles এ নেই, তাদের জন্য:
```sql
INSERT INTO public.profiles (id, full_name, email)
SELECT id, COALESCE(raw_user_meta_data->>'full_name', email), email
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
```

### পরিবর্তন সারাংশ
| কী | বিবরণ |
|---|---|
| DB Migration | `on_auth_user_created` trigger তৈরি + existing users backfill |
| কোড পরিবর্তন | নেই |

এটি করার পর নতুন সাইনআপ করা ইউজাররা automatically profiles এ যুক্ত হবে এবং Pending Users পেজে দেখাবে।

