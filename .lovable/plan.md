

# মোবাইল মেনুতে Pending Users যোগ + পেন্ডিং ইউজার না দেখানোর বাগ ফিক্স

## সমস্যা ১: মোবাইল মেনুতে Pending Users নেই
Admin এর mobile bottom nav এ Pending Users লিংক নেই।

## সমস্যা ২: পেন্ডিং ইউজার দেখায় না
**Root cause**: `handle_new_user()` ফাংশন আছে কিন্তু **trigger তৈরি হয়নি**। তাই নতুন ইউজার সাইনআপ করলে `profiles` টেবিলে কোনো row তৈরি হয় না। `usePendingUsers` hook profiles থেকে ডাটা খোঁজে — profiles empty তাই pending list empty।

## পরিবর্তন

### 1. Database Migration — trigger তৈরি
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```
এটা নতুন সাইনআপে automatically profiles row তৈরি করবে।

### 2. `src/components/MobileBottomNav.tsx`
Admin nav array তে Pending Users যোগ:
```
{ title: "Pending", url: "/pending-users", icon: UserPlus }
```
৭টি আইটেম হবে — icon size `h-3.5 w-3.5` এবং container `h-8 w-8` করে fit করাবো। অথবা কম গুরুত্বপূর্ণ আইটেম বাদ দিয়ে ৬টিতে রাখবো (Home বাদ দিয়ে, যেহেতু Dashboard desktop-only হতে পারে)।

**Approach**: Admin nav তে Pending যোগ করবো, আইকন/কন্টেইনার সাইজ কমিয়ে ৭টি fit করাবো।

### ফাইল পরিবর্তন:
| ফাইল | পরিবর্তন |
|---|---|
| DB Migration | `on_auth_user_created` trigger তৈরি |
| `src/components/MobileBottomNav.tsx` | Pending Users আইটেম যোগ, সাইজ adjust |

