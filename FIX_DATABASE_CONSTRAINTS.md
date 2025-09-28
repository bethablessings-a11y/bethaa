# 🔧 Fix Database Constraint Error

## 🎯 Problem
You're getting this error: `duplicate key value violates unique constraint "coffee_links_user_id_key"`

This means there's a unique constraint on `user_id` in the `coffee_links` table that prevents users from having multiple coffee links.

## 🔍 Root Cause
The database has a unique constraint on `user_id` that was likely created automatically by Supabase or from a previous migration. This constraint prevents users from having multiple coffee links.

## ✅ Solutions

### **Option 1: Fix Database Constraints (Recommended)**

#### **Step 1: Run the Fix Script**
Execute the SQL script in your Supabase dashboard:

1. **Go to Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Copy and paste the contents of `fix-database-constraints.sql`**
4. **Run the SQL script**

#### **Step 2: Verify the Fix**
The script will:
- Remove the unique constraint on `user_id`
- Keep the unique constraint on `coffee_link` (this is what we want)
- Update RLS policies to allow multiple coffee links per user

### **Option 2: Use the API Fix Endpoint**

#### **Step 1: Test Database Status**
```bash
curl -X GET http://localhost:3000/api/fix-database
```

#### **Step 2: Fix Database Issues**
```bash
curl -X POST http://localhost:3000/api/fix-database
```

### **Option 3: Manual Database Fix**

#### **Step 1: Check Current Constraints**
```sql
SELECT 
    constraint_name, 
    constraint_type, 
    table_name 
FROM information_schema.table_constraints 
WHERE table_name = 'coffee_links' 
ORDER BY constraint_name;
```

#### **Step 2: Drop the Problematic Constraint**
```sql
ALTER TABLE coffee_links DROP CONSTRAINT coffee_links_user_id_key;
```

#### **Step 3: Verify the Fix**
```sql
-- This should now work without errors
INSERT INTO coffee_links (user_id, coffee_link) 
VALUES ('user-123', 'coffee-test-123');
```

## 🧪 Testing the Fix

### **Step 1: Test Coffee Link Generation**
1. **Start your dev server:** `npm run dev`
2. **Go to seller dashboard:** `/dashboard/seller`
3. **Click "Buy Me Coffee" tab**
4. **Try generating a coffee link**

### **Step 2: Test Multiple Links**
1. **Generate a coffee link**
2. **Try generating another one**
3. **Both should work without errors**

### **Step 3: Check Database**
```sql
-- Check if user has multiple coffee links
SELECT user_id, coffee_link, created_at 
FROM coffee_links 
WHERE user_id = 'your-user-id'
ORDER BY created_at DESC;
```

## 🔧 Code Changes Made

### **Enhanced API Logic**
The coffee link generation now handles existing links properly:

```javascript
// Check if user already has a coffee link
const { data: existingUserLink } = await supabase
  .from('coffee_links')
  .select('id, coffee_link')
  .eq('user_id', user.id)
  .maybeSingle()

if (existingUserLink) {
  // Update existing user's coffee link
  result = await supabase
    .from('coffee_links')
    .update({ coffee_link: newLink })
    .eq('id', existingUserLink.id)
} else {
  // Create new coffee link
  result = await supabase
    .from('coffee_links')
    .insert({ user_id: user.id, coffee_link: newLink })
}
```

### **Database Schema Updates**
- **Removed unique constraint on `user_id`**
- **Kept unique constraint on `coffee_link`**
- **Updated RLS policies for multiple links per user**

## 🚨 Troubleshooting

### **If the SQL script fails:**

#### **Check if constraint exists:**
```sql
SELECT constraint_name 
FROM information_schema.table_constraints 
WHERE table_name = 'coffee_links' 
AND constraint_name = 'coffee_links_user_id_key';
```

#### **If constraint doesn't exist, check for other constraints:**
```sql
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'coffee_links';
```

### **If you still get errors:**

#### **Check RLS policies:**
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'coffee_links';
```

#### **Test with a simple insert:**
```sql
-- This should work after the fix
INSERT INTO coffee_links (user_id, coffee_link) 
VALUES ('test-user-123', 'coffee-test-456');
```

## 📊 Expected Behavior After Fix

### **Before Fix:**
- ❌ Users can only have one coffee link
- ❌ Error: `duplicate key value violates unique constraint`
- ❌ Cannot generate new coffee links

### **After Fix:**
- ✅ Users can have multiple coffee links
- ✅ No constraint errors
- ✅ Can generate new coffee links freely
- ✅ Each coffee link is still unique

## 🔄 Alternative Approach

If you prefer to keep the one-coffee-link-per-user constraint, you can modify the API to always update the existing link instead of creating new ones:

```javascript
// Always update existing link instead of creating new ones
const { data: existingLink } = await supabase
  .from('coffee_links')
  .select('id')
  .eq('user_id', user.id)
  .single()

if (existingLink) {
  // Update existing link
  result = await supabase
    .from('coffee_links')
    .update({ coffee_link: newLink })
    .eq('id', existingLink.id)
} else {
  // Create new link
  result = await supabase
    .from('coffee_links')
    .insert({ user_id: user.id, coffee_link: newLink })
}
```

---

*This fix will resolve the database constraint error and allow users to generate coffee links without issues.*
