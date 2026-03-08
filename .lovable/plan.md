

# ডাটাবেস ক্লিনআপ ও ফ্রেশ টেস্টিং সেটআপ

## বর্তমান অবস্থা
ডাটাবেসে তিনজন ইউজার আছে, সবার role assigned:
- `aabeg01@gmail.com` → admin (রাখবো)
- `rafikuzzaman10@gmail.com` → client (রিমুভ করবো)
- `rafiquzzamanrafi85@gmail.com` → team (রিমুভ করবো)

## সমস্যা
1. **Rafikuzzaman10@gmail.com** — ইতিমধ্যে client role আছে, তাই pending এ দেখায় না
2. **Rafiquzzamanrafi85@gmail.com** — Auth logs দেখাচ্ছে "Invalid login credentials" — সম্ভবত পাসওয়ার্ড ভুল দেওয়া হচ্ছে অথবা email confirm হয়নি
3. **Trigger মিসিং** — `handle_new_user()` ফাংশন আছে কিন্তু trigger নেই, তাই নতুন সাইনআপে profiles row তৈরি হয় না

## পরিবর্তন

### 1. Data Cleanup (insert tool দিয়ে)
Admin ছাড়া বাকি দুজনের `user_roles` এবং `profiles` থেকে ডাটা ডিলিট:
```sql
DELETE FROM user_roles WHERE user_id != '4c8ccfae-a090-45f1-980e-5102efae61e9';
DELETE FROM profiles WHERE id != '4c8ccfae-a090-45f1-980e-5102efae61e9';
```
**Note**: `auth.users` থেকে ডিলিট করতে Supabase Dashboard ব্যবহার করতে হবে (reserved schema)।

### 2. Database Migration — trigger তৈরি
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```
এটা নতুন সাইনআপে automatically profiles row তৈরি করবে।

### 3. ইউজারকে যা করতে হবে
- Supabase Dashboard → Authentication → Users থেকে `rafikuzzaman10@gmail.com` ও `rafiquzzamanrafi85@gmail.com` ম্যানুয়ালি ডিলিট করতে হবে
- তারপর নতুন করে সাইনআপ করে টেস্ট করতে পারবেন

| পরিবর্তন | টুল |
|---|---|
| user_roles ও profiles ক্লিনআপ | Data delete |
| `on_auth_user_created` trigger | DB Migration |
| auth.users ক্লিনআপ | Supabase Dashboard (ম্যানুয়াল) |

