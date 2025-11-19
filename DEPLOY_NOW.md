# 🚀 FIREBASE DEPLOYMENT - DO THIS NOW

Your ExamPro app is live at **https://examshala.netlify.app** ✅

To enable **permanent data storage**, do these 3 steps (15 minutes):

---

## Step 1: Get Firebase Credentials (5 min)

```
1. Go to: https://console.firebase.google.com
2. Select: examshala-ce41d
3. Click ⚙️ "Project Settings"
4. Click "SERVICE ACCOUNTS" tab
5. Select "Node.js"
6. Click "Generate New Private Key" → saves JSON file
```

---

## Step 2: Add to Netlify (5 min)

```
1. Go to: https://app.netlify.com
2. Select: examshala
3. Site settings → Build & Deploy → Environment
4. Edit variables → Add these TWO variables:

   FIREBASE_DATABASE_URL
   https://examshala-ce41d.firebaseio.com

   FIREBASE_SERVICE_ACCOUNT
   {paste your entire JSON file here}

5. Click Save → Netlify redeploys automatically
```

---

## Step 3: Test (5 min)

```bash
node test_firebase_save.js
```

Expected: `"stored": "firebase-admin"` ✅

---

## Done! 🎉

Your app now saves data permanently!

**Full guides**: See NETLIFY_ENV_SETUP.md or DEPLOYMENT_CHECKLIST.md

