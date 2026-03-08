

# ক্লায়েন্ট কমেন্টে ফাইল অ্যাটাচমেন্ট সাপোর্ট

## পরিবর্তন

### 1. DB মাইগ্রেশন
- `comments` টেবিলে `attachment_url` (text, nullable) কলাম যোগ
- নতুন `comment-attachments` স্টোরেজ বাকেট তৈরি (public)
- বাকেটে RLS: authenticated users আপলোড করতে পারবে, সবাই পড়তে পারবে

### 2. `src/hooks/useComments.ts` আপডেট
- `CommentWithUser` ইন্টারফেসে `attachment_url` যোগ
- `useAddComment` মিউটেশনে optional `file: File` প্যারামিটার — ফাইল থাকলে প্রথমে Storage এ আপলোড, তারপর URL সহ comment insert

### 3. `src/components/ClientTaskComments.tsx` আপডেট
- ইনপুট এরিয়ায় Paperclip আইকন বাটন যোগ → hidden file input trigger করবে
- ফাইল সিলেক্ট করলে প্রিভিউ দেখাবে (ইমেজ হলে থাম্বনেইল, অন্যথায় ফাইলনেম)
- কমেন্ট লিস্টে `attachment_url` থাকলে ইমেজ প্রিভিউ বা ডাউনলোড লিঙ্ক দেখাবে

| ফাইল | পরিবর্তন |
|---|---|
| DB migration | `attachment_url` কলাম + `comment-attachments` বাকেট + RLS |
| `src/hooks/useComments.ts` | ফাইল আপলোড লজিক যোগ |
| `src/components/ClientTaskComments.tsx` | ফাইল পিকার UI + অ্যাটাচমেন্ট প্রিভিউ |

