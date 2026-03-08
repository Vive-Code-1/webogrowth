

# Supabase সেটআপ ভেরিফিকেশন ও লোগো আপলোড ফিচার

## ১. Supabase সেটআপ চেক
স্ক্রিনশট থেকে দেখা যাচ্ছে:
- **Site URL**: `https://webogrowth.lovable.app` ✅
- **Redirect URLs**: তিনটি URL যোগ করা আছে (lovableproject, id-preview, webogrowth.lovable.app) ✅

সেটআপ সঠিক আছে। এখন ইমেইল ভেরিফিকেশন লিংক সঠিক URL এ রিডাইরেক্ট করবে।

## ২. লোগো আপলোড ফিচার

### Database
একটি `app_settings` টেবিল তৈরি করবো যেখানে লোগো URL সহ অন্যান্য সেটিংস রাখা যাবে:
```sql
CREATE TABLE public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);
-- RLS: admin can update, all authenticated can read
```

### Storage
`branding` নামে একটি public storage bucket তৈরি করবো লোগো ফাইল রাখার জন্য।

### কোড পরিবর্তন

| ফাইল | পরিবর্তন |
|---|---|
| `src/hooks/useAppSettings.ts` | নতুন — `app_settings` থেকে লোগো URL ফেচ করার হুক |
| `src/components/AppSidebar.tsx` | "W" আইকন ও "WeboGrowth" টেক্সটের জায়গায় লোগো দেখাবে (যদি আপলোড করা থাকে) |
| `src/components/AppLayout.tsx` | হেডার ও মোবাইল ভিউতেও লোগো দেখাবে |
| `src/pages/Profile.tsx` | Admin দের জন্য "Company Logo" আপলোড সেকশন যোগ করবো |

### লোগো দেখানোর লজিক
- লোগো আপলোড করা থাকলে → সেই ইমেজ দেখাবে
- না থাকলে → আগের মতো "W" আইকন ও "WeboGrowth" দেখাবে
- Sidebar collapsed অবস্থায় শুধু ছোট লোগো দেখাবে

