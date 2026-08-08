# Student Expense Tracker 🎓💸

A simple, modern, and beginner-friendly full-stack MERN (MongoDB, Express, React, Node.js) web application designed specifically for college students to manage expenses, set budgets, view charts, and receive smart spending suggestions.

This project is designed with clean, readable code and comments, making it an excellent college project, resume addition, portfolio piece, or hackathon base.

---

## 🚀 Main Features

1. **User Authentication:** Secure signup & login using JSON Web Tokens (JWT) stored in `localStorage` with protected dashboard routing and smooth logout transitions.
2. **Interactive Dashboard:** Visual widgets summarizing total expenses, monthly budget caps, remaining balances, top category spend, and active overspending alert flags.
3. **Expense Management (CRUD):** Add, view, edit, and delete transactions containing title, amount, category, date, and notes.
4. **Smart Spending suggestions:** A rule-based analytics analyzer evaluating percentage spending triggers (e.g., Food > 35%, Entertainment > 20%, Shopping > 25%), weekly comparison margins, and savings performance.
5. **Threshold Alerts:** Real-time notifications and warnings pushed to the user's Alert Center when monthly or category budgets are exceeded.
6. **Detailed Analytics:** Visual charts including a Pie Chart for category shares and a Bar Chart tracking historical expenditure over the last 6 months.
7. **Expense Filters & Search:** Search title keywords, filter by category tabs, and narrow logs down by YYYY-MM dates.
8. **PDF Report Exports:** Generate a professional two-page downloadable report detailing stats, trend charts, budget breakdowns, and transaction sheets.
9. **Responsive Design:** A tailored Blue/White layout optimized for mobile, tablet, and desktop screens with collapsible slide-in panels and hover animations.

---

## 📂 Project Folder Structure

The project separates client and server code into two dedicated workspaces:

```
student-expense-tracker/
├── package.json (root runner scripts)
├── README.md (project guide)
│
├── backend/
│   ├── .env (server ports, db URIs, jwt keys)
│   ├── server.js (express setup & routes binder)
│   ├── config/
│   │   └── db.js (mongoose connector)
│   ├── models/
│   │   ├── User.js (auth schema with pre-save hash hook)
│   │   ├── Expense.js (transaction schema)
│   │   ├── Budget.js (overall and category limits schema)
│   │   └── Notification.js (alert center log schema)
│   ├── middleware/
│   │   └── auth.js (JWT validation interceptor)
│   ├── controllers/
│   │   ├── authController.js (signup/login/profile logic)
│   │   ├── expenseController.js (CRUD transaction handlers)
│   │   ├── budgetController.js (monthly limits upsert)
│   │   └── analyticsController.js (metric aggregation & spending analyzer)
│   └── routes/ (express api routes mapping)
│
└── frontend/
    ├── index.html (entry html page with Outfit/Inter typography)
    ├── package.json (vite dev & production commands)
    ├── vite.config.js (react plugin & api CORS dev-proxy)
    └── src/
        ├── main.jsx (react bootstrap file)
        ├── App.jsx (root router & protected layouts shell)
        ├── index.css (plain css variables design system tokens)
        ├── css/ (dedicated view page css rulesheets)
        ├── components/ (navbars, sidebars, protected routes wrappers)
        ├── pages/ (landing, login, signup, dashboards, analytics, profiles)
        ├── services/ (api clients & api query helper wrappers)
        └── utils/ (PDF download generators & currency formatters)
```

---

## 🛠️ Prerequisites & Installation

To run this application locally, ensure you have the following installed on your machine:
- **Node.js** (v16.0.0 or higher)
- **npm** (v7.0.0 or higher)
- **MongoDB** (local community server running or a free cloud account on MongoDB Atlas)

### Setup Instructions

1. **Clone or Open the Project Folder:**
   ```bash
   cd student-expense-tracker
   ```

2. **Install all Backend & Frontend Dependencies:**
   From the root directory, you can run the convenience install script:
   ```bash
   npm run install-all
   ```
   *Alternatively, install manually inside each folder:*
   ```bash
   # Install root tools
   npm install
   # Install backend dependencies
   cd backend && npm install
   # Install frontend dependencies
   cd ../frontend && npm install
   ```

3. **Configure Backend Environment Variables:**
   Navigate to the `backend/` directory and locate the `.env` file. You can adjust the following parameters:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/student-expense-tracker
   JWT_SECRET=student_expense_tracker_secret_key_12345
   NODE_ENV=development
   ```
   > **Note on MongoDB Atlas:** If you are connecting to a cloud database cluster instead of a local MongoDB service, swap the `MONGO_URI` value with your Atlas connection string, for example:
   > `MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/expense_tracker?retryWrites=true&w=majority`

---

## 🚀 Running the Application

### 1. Simple Concurrent Start (Recommended)
You can launch both the React frontend developer console and Node.js backend server with a single script from the project root:
```bash
npm run dev
```

### 2. Manual Independent Start
If you prefer running them in separate terminal tabs:
- **Start Backend:**
  ```bash
  cd backend
  npm run dev  # Starts nodemon daemon monitoring changes
  ```
- **Start Frontend:**
  ```bash
  cd frontend
  npm run dev  # Starts Vite server on http://localhost:3000
  ```

Once both servers are running:
- Open your browser and navigate to: **`http://localhost:3000`**

---

## 💡 Tech Stack Highlights & Instructions

### Plain CSS Design System
We avoid complex utility frameworks like Tailwind CSS. All styling tokens are maintained in **`frontend/src/index.css`** and page styles inside the **`frontend/src/css/`** folders. Variables make customizing the blue/white color scheme seamless.

### Client-Side PDF Generation
We use the lightweight client-side library **`jspdf`** in **`frontend/src/utils/pdfGenerator.js`**. It dynamically maps statistical aggregate parameters and draws a tabular grid of current month transactions, saving it directly to your downloads folder without triggering backend file processes.

### Vite Local Proxy Configuration
Vite's configuration **`vite.config.js`** proxies `/api` endpoints straight to the backend running on port `5000` during development, avoiding complex cross-origin resource sharing (CORS) configurations.
