# 🚀 Netlify Environment Setup - Quick Guide

**Your Firebase Project**: `examshala-ce41d`  
**Your Netlify Site**: `examshala.netlify.app`

---

## 📋 What You Need to Do

Your exam results app is ready to deploy! To enable **persistent data storage**, you need to connect Firebase to Netlify in 3 quick steps.

---

## ✅ Step 1: Get Firebase Service Account (5 minutes)

### In Firebase Console:

```
1. Go to: https://console.firebase.google.com
2. Select project: examshala-ce41d
3. Click ⚙️ "Project Settings" (top-left, near project name)
4. Click "SERVICE ACCOUNTS" tab
5. Select "Node.js" from runtime dropdown
6. Click blue "Generate New Private Key" button
7. ⬇️ JSON file automatically downloads - KEEP IT SAFE! 🔐
```

**What you get**: A JSON file with your Firebase credentials (like below)
```json
{
  "type": "service_account",
  "project_id": "examshala-ce41d",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@examshala-ce41d.iam.gserviceaccount.com",
  ...
}
```

---

## ✅ Step 2: Set Netlify Environment Variables (5 minutes)

### In Netlify Dashboard:

```
1. Go to: https://app.netlify.com
2. Select your site: "examshala" 
3. Click: "Site settings" (top menu)
4. Click: "Build & Deploy" → "Environment"
5. Click: "Edit variables" button
```

### Add Variable #1 - Database URL:
```
Key:   FIREBASE_DATABASE_URL
Value: https://examshala-ce41d.firebaseio.com
```
Click "Save"

### Add Variable #2 - Service Account:
```
Key:   FIREBASE_SERVICE_ACCOUNT
Value: [PASTE YOUR ENTIRE JSON HERE - as one line]
```

**⚠️ IMPORTANT**: 
- Open the JSON file you downloaded in step 1
- Copy the **entire contents** (everything from `{` to `}`)
- Paste it into the Netlify variable value
- It's OK if it looks like one long line - that's correct!

Click "Save"

**✅ Netlify automatically redeploys your site!**

---

## ✅ Step 3: Verify It Works (2 minutes)

### Option A: Test via Terminal (recommended)

```powershell
# From your project folder:
node .\test_firebase_save.js
```

Expected output:
```
✅ Result saved successfully!
Response: { "success": true, "resultId": "abc123", "stored": "firebase-admin" }
```

### Option B: Test via Browser

1. Go to: `https://examshala.netlify.app`
2. Take a sample exam
3. Submit your results
4. Check Firebase Console → Realtime Database
5. Look for new entry under `/results/{resultId}` ✅

### Option C: Test via cURL (PowerShell)

```powershell
$uri = "https://examshala.netlify.app/.netlify/functions/save-results"
$body = @{
    userId = "test"
    exam = "Math"
    score = 95
    total = 100
} | ConvertTo-Json

Invoke-WebRequest -Uri $uri -Method POST -Body $body -ContentType "application/json"
```

---

## 📊 What Happens Now?

| Before Setup | After Setup |
|---|---|
| Results only visible during session | ✅ Results saved to Firebase |
| Data lost after refresh | ✅ Data persists forever |
| No data for analytics | ✅ Can analyze all past attempts |
| No user history | ✅ User can see their score history |

---

## 🔧 Troubleshooting

### "Error: FIREBASE_SERVICE_ACCOUNT not found"
- Make sure you pasted the **entire JSON** in step 2
- No quotation marks around the JSON value
- Click Save after pasting

### "Error: Invalid JSON"
- Make sure you didn't accidentally cut off part of the JSON
- The JSON should start with `{` and end with `}`
- Try removing extra line breaks if they got added

### "Results still not saving"
- Wait 1-2 minutes for Netlify redeploy (check site's deploy status)
- Try clearing browser cache
- Check Firebase Console to see if data appears there

### "Netlify build failed"
- This usually means the service account JSON wasn't valid
- Double-check the JSON formatting in step 2
- Regenerate a new private key from Firebase if needed

---

## 🎯 Success Checklist

- [x] Downloaded Firebase service account JSON
- [ ] Added FIREBASE_DATABASE_URL to Netlify
- [ ] Added FIREBASE_SERVICE_ACCOUNT to Netlify
- [ ] Netlify finished redeploying (check status)
- [ ] Test script ran successfully (or browser test worked)
- [ ] Firebase Console shows new `/results/` entries

**Once all checked**: Your app is production-ready! 🎉

---

## 📚 Reference

- **Firebase Console**: https://console.firebase.google.com
- **Netlify Dashboard**: https://app.netlify.com
- **Your Site**: https://examshala.netlify.app
- **GitHub Repo**: https://github.com/DataDudeAI/Examshala

---

**Questions?** Check `.env.example` for detailed technical documentation.
