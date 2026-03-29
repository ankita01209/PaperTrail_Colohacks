# PaperTrail Testing Procedure

To properly test the PaperTrail application, both the **Backend (FastAPI)** and the **Frontend (Next.js)** servers must be running simultaneously. If the backend is not running, the frontend will fail to sign you in or fetch any data.

Follow this step-by-step procedure to test the project locally.

## Step 1: Start the Backend (FastAPI)

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd c:\PaperTrail_Colohacks\backend
   ```
2. Ensure you have the required dependencies (or activate your virtual environment if you have one):
   ```bash
   pip install -r requirements.txt
   ```
3. Run the development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
4. Verify it's running by visiting [http://localhost:8000/docs](http://localhost:8000/docs) in your browser. You should see the Swagger UI documentation for all endpoints.

## Step 2: Start the Frontend (Next.js)

1. Open a new, separate terminal and navigate to the `frontend` folder:
   ```bash
   cd c:\PaperTrail_Colohacks\frontend
   ```
2. Install dependencies (if you haven't already):
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Verify the frontend is running by visiting [http://localhost:3000](http://localhost:3000) in your browser.

## Step 3: Log In using Dev Accounts

The backend is configured to bypass Firebase authentication for testing if you use specific email addresses and passwords. 

1. On the frontend, navigate to [http://localhost:3000/login](http://localhost:3000/login).
2. **For Admin Access** (to manage users and approve templates):
   - **Email**: `admin@papertrail.local`
   - **Password**: Any password will work for the mock dev bypass
3. **For Clerk Access** (to upload forms and extract data):
   - **Email**: `clerk@papertrail.local`
   - **Password**: Any password will work

> [!NOTE]
> If you experience a "Cannot connect to backend server" error when logging in, make sure your terminal running `uvicorn` hasn't crashed or stopped.

## Step 4: Testing the Dashboards

Once logged in, verify the following core functionalities:

**If logged in as `clerk@papertrail.local`**:
- You must be redirected to `/upload` (Upload form interface).
- Test uploading an image.
- Test that it routes you to `/review` after the pipeline runs successfully.

**If logged in as `admin@papertrail.local`**:
- You must be redirected to `/admin` (Metrics & KPI Dashboard).
- From the sidebar, test the "Users" view (`/admin/users`) to see user activity.
- Select the "Templates" view (`/admin/templates`) to view current processing schemas.

## Troubleshooting

- **Login Not Redirecting**: Confirm that `http://localhost:8000` is online and there are no CORS errors in your browser's Developer Tools network tab.
- **Backend Crashes**: Look at the terminal running the backend. It may crash if `tesseract` isn't installed locally (if you have `GOOGLE_VISION_ENABLED=false`).
- **Firebase/Missing Token errors**: Make sure your local `.env` and `.env.local` files aren't misconfigured. Since you are using Dev Bypass, `NEXT_PUBLIC_FIREBASE_API_KEY` may be left empty to use mock login testing.
