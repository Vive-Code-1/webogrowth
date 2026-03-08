

# Revenue কার্ডে USD/BDT টগল

বর্তমানে `currency` state এবং `convertAmount`/`formatCurrency` ফাংশন ইতিমধ্যে আছে এবং Revenue কার্ড সেগুলো ব্যবহার করছে। কিন্তু কারেন্সি সুইচ টগলটি শুধু Revenue Overview চার্ট সেকশনে আছে।

## পরিবর্তন — `src/pages/Dashboard.tsx`

Revenue কার্ডের পাশে (বা Stat Cards সেকশনের উপরে) USD/BDT টগল বাটন যোগ করবো, যাতে ইউজার কার্ড এরিয়া থেকেই কারেন্সি সুইচ করতে পারে। যেহেতু একই `currency` state ব্যবহার হচ্ছে, টগল করলে কার্ড ও চার্ট দুটোই আপডেট হবে।

**UI**: Header সেকশনে (Dashboard title এর পাশে) কারেন্সি টগল বাটন রাখবো — এতে পুরো পেজে একটাই টগল থাকবে, এবং Revenue Overview চার্ট থেকে ডুপ্লিকেট টগল সরিয়ে দেবো।

