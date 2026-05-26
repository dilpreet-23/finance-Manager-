<<<<<<< HEAD
<<<<<<< HEAD
# Finance-Manager-
=======
# Finance Track

A sophisticated, full-stack personal finance application built with React and Firebase.

## 🚀 Features

- **Secure Authentication**: Google Login via Firebase Auth.
- **Real-time Tracking**: Instant updates for income and expenses using Firestore.
- **Elegant Visualizations**: Interactive charts for category breakdown and monthly trends.
- **Modern UI**: A refined "Warm Organic" aesthetic using Tailwind CSS and Framer Motion.
- **Responsive Design**: Fully optimized for mobile and desktop.

## 🛠️ Tech Stack

- **Frontend**: React 19, Tailwind CSS 4, Recharts, Framer Motion.
- **Backend**: Firebase (Firestore, Auth).

## ⚙️ Setup Instructions

1. **Firebase Setup**:
   - The app uses Firebase for data and auth.
   - Configuration is stored in `firebase-applet-config.json`.
   - Security rules are defined in `firestore.rules`.

2. **Running Locally**:
   - `npm install`
   - `npm run dev`

## 🔐 Security

- **Firestore Rules**: Strict per-user data isolation.
- **Validation**: Server-side validation of transaction types, amounts, and dates.
- **PII Protection**: User emails and private data are locked to the document owner.

## 📁 Data Structure

- `/users/{uid}`: User profile and settings.
- `/transactions/{id}`: Individual income/expense records.
- `/budgets/{id}`: Monthly category limits.
>>>>>>> 094edbc (initial commit)
=======
# finance-Manager-
>>>>>>> 9649a261b65e4e8cd0f041a753890947cbee0675
