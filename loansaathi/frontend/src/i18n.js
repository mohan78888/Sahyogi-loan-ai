// Minimal UI strings. Scheme names, links and passport body text come from the
// backend in English for now (prototype limitation).
export const LANGS = [
  { id: "en", label: "English" },
  { id: "hi", label: "हिन्दी" },
  { id: "hing", label: "Hinglish" },
];

export const T = {
  title: { en: "Sahyogi Loan AI", hi: "सहयोगी लोन AI", hing: "Sahyogi Loan AI" },
  tagline: {
    en: "Understand your options. Prepare with confidence. Plan repayment responsibly.",
    hi: "अपने विकल्प समझें। भरोसे के साथ तैयारी करें। जिम्मेदारी से चुकाने की योजना बनाएं।",
    hing: "Apne options samjho. Confidence se tayari karo. Responsibly repayment plan karo.",
  },
  notLender: {
    en: "A decision-support tool. Not a lender, credit bureau or approval authority.",
    hi: "यह सिर्फ़ निर्णय में मदद करने वाला टूल है। यह न बैंक है, न क्रेडिट ब्यूरो, न लोन मंज़ूर करने वाला।",
    hing: "Ye sirf decision-support tool hai. Lender, credit bureau ya approval authority nahi hai.",
  },
  pickGoal: {
    en: "What do you need the loan for?",
    hi: "आपको लोन किसलिए चाहिए?",
    hing: "Aapko loan kis liye chahiye?",
  },
  student: { en: "College / studies", hi: "कॉलेज / पढ़ाई", hing: "College / padhai" },
  farmer: { en: "Farming / equipment", hi: "खेती / उपकरण", hing: "Kheti / equipment" },
  business: { en: "My shop / business", hi: "मेरी दुकान / व्यापार", hing: "Meri dukaan / business" },
  personal: { en: "Personal / emergency", hi: "निजी / आपातकाल", hing: "Personal / emergency" },
  next: { en: "Next", hi: "आगे", hing: "Aage" },
  skip: { en: "Skip (use sample)", hi: "छोड़ें (नमूना लें)", hing: "Skip (sample use karo)" },
  back: { en: "Back", hi: "पीछे", hing: "Peeche" },
  build: { en: "Build my readiness passport", hi: "मेरा रेडिनेस पासपोर्ट बनाएं", hing: "Mera readiness passport banao" },
  working: { en: "Working…", hi: "बन रहा है…", hing: "Ban raha hai…" },
  startOver: { en: "Start over", hi: "फिर से शुरू करें", hing: "Phir se shuru karo" },
  print: { en: "Print / save as PDF", hi: "प्रिंट / PDF सेव करें", hing: "Print / PDF save karo" },
  error: {
    en: "Could not reach the calculation server. Is the backend running?",
    hi: "कैलकुलेशन सर्वर से जुड़ नहीं पाए। क्या बैकएंड चालू है?",
    hing: "Calculation server se connect nahi hua. Backend chal raha hai?",
  },
};

// One question at a time. `key` maps to the API field.
export const Q = {
  amount: {
    type: "number",
    prefix: "₹",
    q: {
      en: "How much money do you need?",
      hi: "आपको कितनी रकम चाहिए?",
      hing: "Aapko kitni raqam chahiye?",
    },
  },
  tenure_months: {
    type: "number",
    suffix: "months",
    q: {
      en: "Over how many months would you like to repay?",
      hi: "कितने महीनों में चुकाना चाहेंगे?",
      hing: "Kitne mahino mein repay karna chahoge?",
    },
  },
  annual_rate_pct: {
    type: "number",
    optional: true,
    suffix: "% per year",
    q: {
      en: "Do you have an interest rate from a lender? If not, skip and we will use a clearly labelled sample rate.",
      hi: "क्या किसी बैंक ने ब्याज दर बताई है? नहीं तो छोड़ दें, हम नमूना दर लेंगे और साफ़ लिख देंगे।",
      hing: "Kisi lender ne interest rate bataya hai? Nahi to skip karo, hum sample rate lenge aur clearly label karenge.",
    },
  },
  moratorium_months: {
    type: "number",
    optional: true,
    suffix: "months",
    q: {
      en: "Is there a gap after the course before EMIs start (moratorium)? Enter months, or skip.",
      hi: "कोर्स के बाद EMI शुरू होने से पहले कोई अंतराल (मोरेटोरियम) है? महीने लिखें या छोड़ें।",
      hing: "Course ke baad EMI shuru hone se pehle gap (moratorium) hai? Months likho ya skip karo.",
    },
  },
  monthly_income_student: {
    key: "monthly_income",
    type: "number",
    prefix: "₹",
    q: {
      en: "What monthly salary do you expect after finishing studies?",
      hi: "पढ़ाई पूरी होने के बाद आपको हर महीने कितनी सैलरी की उम्मीद है?",
      hing: "Padhai ke baad aapko monthly kitni salary expect hai?",
    },
  },
  monthly_income_business: {
    key: "monthly_income",
    type: "number",
    prefix: "₹",
    q: {
      en: "What is your usual monthly income from the business (after business costs)?",
      hi: "व्यापार की खर्च निकालकर आपकी सामान्य मासिक आमदनी कितनी है?",
      hing: "Business ki costs nikal ke aapki usual monthly income kitni hai?",
    },
  },
  monthly_income_personal: {
    key: "monthly_income",
    type: "number",
    prefix: "₹",
    q: {
      en: "What is your monthly income?",
      hi: "आपकी मासिक आमदनी कितनी है?",
      hing: "Aapki monthly income kitni hai?",
    },
  },
  rabi: {
    type: "number",
    prefix: "₹",
    q: {
      en: "How much do you expect from the rabi (spring) harvest, received around April?",
      hi: "रबी की फसल से लगभग अप्रैल में कितनी आमदनी की उम्मीद है?",
      hing: "Rabi harvest se April ke aaspaas kitni income expect hai?",
    },
  },
  kharif: {
    type: "number",
    prefix: "₹",
    q: {
      en: "How much do you expect from the kharif (monsoon) harvest, received around October?",
      hi: "खरीफ की फसल से लगभग अक्टूबर में कितनी आमदनी की उम्मीद है?",
      hing: "Kharif harvest se October ke aaspaas kitni income expect hai?",
    },
  },
  monthly_expenses: {
    type: "number",
    prefix: "₹",
    q: {
      en: "What are your usual monthly expenses?",
      hi: "आपके सामान्य मासिक खर्च कितने हैं?",
      hing: "Aapke usual monthly expenses kitne hain?",
    },
  },
  existing_emis: {
    type: "number",
    optional: true,
    prefix: "₹",
    q: {
      en: "Do you already pay any EMIs each month? Enter the total, or skip.",
      hi: "क्या आप पहले से कोई EMI भरते हैं? कुल रकम लिखें या छोड़ें।",
      hing: "Kya aap pehle se koi EMI bharte ho? Total likho ya skip karo.",
    },
  },
};

export const FLOWS = {
  student: ["amount", "tenure_months", "annual_rate_pct", "moratorium_months", "monthly_income_student", "monthly_expenses", "existing_emis"],
  farmer: ["amount", "tenure_months", "annual_rate_pct", "rabi", "kharif", "monthly_expenses", "existing_emis"],
  business: ["amount", "tenure_months", "annual_rate_pct", "monthly_income_business", "monthly_expenses", "existing_emis"],
  personal: ["amount", "tenure_months", "annual_rate_pct", "monthly_income_personal", "monthly_expenses", "existing_emis"],
};
