

# ইনভাইটেশন ইমেইল localhost সমস্যা ফিক্স

## সমস্যা
`inviteUserByEmail` কলে `redirectTo` প্যারামিটার দেওয়া হয়নি, তাই Supabase ডিফল্ট `http://localhost:3000` ব্যবহার করছে। ইনভাইটেড ইউজাররা "Accept the invite" ক্লিক করলে localhost এ যাচ্ছে যা কাজ করে না।

## সমাধান

### `supabase/functions/invite-user/index.ts`
`inviteUserByEmail` কলে `redirectTo` যোগ করবো যেটা আপনার প্রোডাকশন URL পয়েন্ট করবে:

```typescript
await adminClient.auth.admin.inviteUserByEmail(email, {
  data: { full_name: full_name || email },
  redirectTo: "https://webogrowth.lovable.app",
});
```

এছাড়াও, Supabase Dashboard এ **Authentication → URL Configuration → Redirect URLs** তে `https://webogrowth.lovable.app` যোগ করা আছে কিনা নিশ্চিত করতে হবে। না থাকলে Supabase ওই URL এ redirect করবে না।

### পরিবর্তন:
| ফাইল | কী বদলাবে |
|---|---|
| `supabase/functions/invite-user/index.ts` | `redirectTo` প্যারামিটার যোগ |

একটি মাত্র লাইন পরিবর্তন — edge function redeploy করতে হবে।

