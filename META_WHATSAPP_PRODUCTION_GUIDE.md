# 📱 Meta WhatsApp Cloud API - Production & Permanent Setup Guide

यह गाइड आपको 3 चीज़ें सेट करने में मदद करेगी:
1. **Permanent Access Token** (जो कभी एक्सपायर नहीं होगा - Life Time Token)
2. **Charges & Pricing** (Meta के वास्तविक खर्चे की पूरी जानकारी)
3. **Send to All Customers** (किसी भी ग्राहक को WhatsApp मैसेज भेजने के लिए असली नंबर जोड़ना)

---

## 💰 1. क्या इसमें पैसे लगते हैं? (Pricing & Charges)

**हाँ, लेकिन यह SMS और Twilio से 10 गुना सस्ता है!**

| Type | Meta का चार्ज (India +91) | Free Quota |
| :--- | :--- | :--- |
| **Service Conversations** (ग्राहक ने पहले मैसेज किया) | ₹0.00 | **हर महीने 1,000 बातचीत बिल्कुल FREE** |
| **Utility Templates** (Order Confirmed / Status Update) | **~₹0.11 से ₹0.14 (सिर्फ 11 से 14 पैसे)** प्रति 24 घंटे की बातचीत | कोई मासिक शुल्क नहीं, केवल भेजे गए मैसेज पर |
| **Twilio (पुरानी सर्विस)** | ~₹4.50 प्रति मैसेज | बहुत महँगा था |

> **उदाहरण:** अगर आपके महीने में **500 Orders** आते हैं, तो कुल खर्च लगभग सिर्फ **₹60 से ₹70** आएगा!

---

## 🔑 2. Permanent Access Token कैसे बनाएँ? (जो कभी Expire न हो)

Meta Developer का Temporary Token सिर्फ 24 घंटे चलता है। **Permanent Token** बनाने के लिए इन स्टेप्स को फॉलो करें:

### डायरेक्ट लिंक:
👉 **[Meta Business Suite - System Users](https://business.facebook.com/settings/system-users)**

### स्टेप्स:
1. ऊपर दिए गए लिंक को खोलें और अपना **Business Account** चुनें।
2. बाईं तरफ **Users** ➔ **System Users** (सिस्टम उपयोगकर्ता) पर क्लिक करें।
3. **Add** (जोड़ें) बटन पर क्लिक करें:
   - **System User Name:** `GiftFestive Server`
   - **Role:** `Admin` चुनें।
   - **Create System User** पर क्लिक करें।
4. अब उस यूजर पर क्लिक करें और **Assign Assets** (एसेट असाइन करें) पर क्लिक करें:
   - **Apps** में जाएँ ➔ अपना WhatsApp App चुनें ➔ **Full Control (Manage App)** को ऑन करें ➔ **Save Changes** करें।
   - **WhatsApp Accounts** में जाएँ ➔ अपना Business Account चुनें ➔ **Full Control (Manage WhatsApp Account)** को ऑन करें ➔ **Save Changes** करें।
5. अब उसी पेज पर **Generate New Token** (नया टोकन जनरेट करें) बटन पर क्लिक करें:
   - **App:** अपना App सेलेक्ट करें।
   - **Token Expiration:** **`Never`** (कभी नहीं) चुनें।
   - **Available Permissions:** नीचे दी गई 2 परमिशन पर टिक करें:
     - `whatsapp_business_messaging`
     - `whatsapp_business_management`
6. **Generate Token** पर क्लिक करें।
7. एक बड़ा टोकन स्क्रीन पर दिखेगा — उसे **Copy** कर लें। (इसे कहीं सुरक्षित रख लें, यह सिर्फ एक बार दिखता है)।
8. अपने `backend/.env` और Render में:
   ```env
   META_WHATSAPP_TOKEN=यहाँ_अपना_Permanent_Token_पेस्ट_करें
   ```

---

## 👥 3. सभी Customers को मैसेज कैसे भेजें? (Sandbox से Live Number)

### समस्या:
अभी जो नंबर आप इस्तेमाल कर रहे हैं (`+1 555 641 0693`) वह Meta का **Sandbox Test Number** है। Sandbox में Meta सिर्फ उन नंबरों पर मैसेज भेजने देता है जो आपने डैशबोर्ड में टेस्ट के लिए जोड़े हैं।

### समाधान (असली नंबर जोड़ना):
किसी भी ग्राहक को ऑटोमैटिक WhatsApp भेजने के लिए आपको अपना **असली मोबाइल नंबर** Meta में जोड़ना होगा:

### डायरेक्ट लिंक:
👉 **[Meta Developers - WhatsApp API Setup](https://developers.facebook.com/apps/)** ➔ अपना App चुनें ➔ **WhatsApp** ➔ **API Setup**

### स्टेप्स:
1. API Setup पेज पर नीचे स्क्रॉल करें ➔ **"Step 5: Add a phone number"** दिखेगा।
2. **Add phone number** बटन पर क्लिक करें:
   - **Business Profile:**
     - **Profile name:** `GiftFestive`
     - **Category:** `Retail / E-commerce`
     - **Description:** `Online gifts, cakes, flowers and hampers`
3. अपना **Business Mobile Number** डालें:
   > ⚠️ **जरूरी नियम:** इस नंबर पर पहले से पर्सनल WhatsApp App चालू **नहीं** होना चाहिए।
   > - अगर आप अपना मौजूदा WhatsApp नंबर इस्तेमाल करना चाहते हैं, तो पहले अपने फ़ोन में WhatsApp Settings ➔ Account ➔ **Delete My Account** करना होगा।
   > - सबसे आसान तरीका: एक नया/अलग SIM नंबर इस्तेमाल करें जो सिर्फ GiftFestive के बिजनेस के लिए हो।
4. **OTP** (SMS या Call) के ज़रिए नंबर वेरिफाई करें।
5. वेरिफाई होते ही Meta आपको एक नया **Phone Number ID** देगा।
6. अपने `backend/.env` और Render में यह नया ID अपडेट करें:
   ```env
   META_PHONE_NUMBER_ID=नया_Phone_Number_ID
   ```

---

## 💳 4. Payment Method जोड़ना (ताकि मैसेज ब्लॉक न हों)

क्योंकि Meta 11-14 पैसे प्रति मैसेज चार्ज करता है, इसलिए अपने बिजनेस मैनेजर में कार्ड जोड़ना ज़रूरी है:

👉 **[Meta Billing & Payments](https://business.facebook.com/billing_hub)**
1. **Payment Methods** ➔ **Add Payment Method** पर क्लिक करें।
2. अपना Debit Card या Credit Card जोड़ें (जिसमें International Transactions चालू हों)।
3. जब भी ग्राहक ऑर्डर करेंगे, 12 पैसे के हिसाब से आपके कार्ड से ऑटो-बिलिंग होगी।

---

## 🚀 5. App को Live Mode में करना

1. [Meta Developers Dashboard](https://developers.facebook.com/apps/) खोलें।
2. सबसे ऊपर हेडर में एक स्विच दिखेगा:
   - `App Mode: Development` ➔ इसे क्लिक करके **`Live`** कर दें।
3. Privacy Policy URL मांगेगा, उसमें अपनी वेबसाइट का लिंक डाल दें:
   `https://giftcartrepo.onrender.com/privacy-policy`

---

## 📋 सारांश (Checklist)

- [ ] System User से **Never Expire** वाला Permanent Token बनाया।
- [ ] `backend/.env` और Render में `META_WHATSAPP_TOKEN` बदला।
- [ ] API Setup में अपना असली Business Phone Number जोड़ा और OTP वेरिफाई किया।
- [ ] `backend/.env` और Render में नया `META_PHONE_NUMBER_ID` डाला।
- [ ] Meta Billing में कार्ड जोड़ा।
- [ ] App को `Development` से `Live` मोड में स्विच किया।
