

# মোবাইল মেনুতে Team অপশন যোগ করা

## সমস্যা
Admin রোলের মোবাইল bottom nav এ Team পেজের লিংক নেই। Desktop sidebar এ আছে কিন্তু মোবাইলে missing।

## পরিবর্তন — `src/components/MobileBottomNav.tsx`

Admin এর nav items এ `Team` যোগ করবো `Users` আইকন দিয়ে। যেহেতু ইতিমধ্যে ৫টি আইটেম আছে (Home, Projects, Tasks, Clients, Profile), Team যোগ করলে ৬টি হবে — তাই "More" মেনু বা আইটেম সাইজ ছোট করে adjust করতে হবে, অথবা Clients কে Team এর সাথে একটি "More" sheet/drawer এ রাখা যায়।

**Approach**: Admin nav তে Team আইটেম যোগ করবো Clients এর পাশে। ৬টি আইটেম bottom bar এ fit করানোর জন্য আইকন ও টেক্সট সাইজ সামান্য ছোট করবো।

```
Admin mobile nav: Home | Projects | Tasks | Team | Clients | Profile
```

### ফাইল পরিবর্তন:
- **`src/components/MobileBottomNav.tsx`**: `Users` আইকন import, admin array তে `{ title: "Team", url: "/team", icon: Users }` যোগ, আইকন/টেক্সট সাইজ `h-4 w-4` ও `text-[9px]` করবো ৬টি আইটেম fit করতে।

