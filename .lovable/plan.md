

# লোগো বড় করা ও Tasks পেজে Add Task বাটন

## পরিবর্তন

### 1. `src/components/AppSidebar.tsx` — লোগো বড় করা
স্ক্রিনশটে দেখা যাচ্ছে লোগো অনেক ছোট। সাইডবার expanded অবস্থায় লোগো `h-10 w-10` থেকে বড় করে `h-14` (auto width, object-contain) করা হবে যাতে পুরো সাইডবারের প্রস্থ জুড়ে ভালোভাবে দেখায়।

### 2. `src/pages/Tasks.tsx` — Add Task বাটন ও ডায়ালগ
- হেডার সেকশনে একটি "Add Task" বাটন যোগ করা হবে (ফিল্টারের পাশে বা ডানপাশে)
- বাটনে ক্লিক করলে একটি ডায়ালগ/শীট খুলবে যেখানে:
  - Title, Description, Stage, Priority, Due Date ফিল্ড থাকবে
  - **Project সিলেক্ট** করার ড্রপডাউন (সব প্রজেক্ট থেকে)
  - **Assignee সিলেক্ট** করার ড্রপডাউন (টিম মেম্বারদের তালিকা থেকে)
  - Visible to Client সুইচ
- `useProjects` হুক ব্যবহার করে প্রজেক্ট লিস্ট আনবে
- `useTeamMembers` হুক ব্যবহার করে টিম মেম্বার লিস্ট আনবে
- `useCreateTask` দিয়ে টাস্ক তৈরি হবে

### 3. `src/components/TaskModal.tsx` — প্রজেক্ট সিলেক্ট সাপোর্ট
TaskModal-এ একটি optional `projects` prop যোগ করা হবে। যখন Tasks পেজ থেকে নতুন টাস্ক তৈরি হবে, তখন প্রজেক্ট সিলেক্ট ড্রপডাউন দেখাবে। ProjectDetail পেজ থেকে ব্যবহারে এটি লুকানো থাকবে (কারণ projectId ইতিমধ্যে সেট)।

| ফাইল | পরিবর্তন |
|---|---|
| `src/components/AppSidebar.tsx` | লোগো সাইজ বড় করা |
| `src/pages/Tasks.tsx` | Add Task বাটন + TaskModal ইন্টিগ্রেশন |
| `src/components/TaskModal.tsx` | Optional project selector + team members from hook |

