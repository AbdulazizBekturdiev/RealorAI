# Backend Deployment Guide

The backend needs to be deployed separately because it requires OpenCV and heavy image processing that isn't suitable for Vercel serverless functions.

## Option 1: Railway (Recommended - Easiest)

1. **Sign up/Login**: Go to [railway.app](https://railway.app) and sign in with GitHub

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your RealorAI repository
   - Select the `backend` folder as the root directory

3. **Set Environment Variables**:
   - Go to your project → Variables
   - Add:
     - `SUPABASE_URL` = your Supabase project URL
     - `SUPABASE_KEY` = your Supabase anon key

4. **Deploy**:
   - Railway will automatically detect Python and deploy
   - Wait for deployment to complete
   - Copy the generated URL (e.g., `https://your-app.railway.app`)

5. **Update Frontend**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-app.railway.app`
   - Redeploy frontend

## Option 2: Render

1. **Sign up**: Go to [render.com](https://render.com) and sign in

2. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Settings:
     - **Name**: `realorai-backend`
     - **Root Directory**: `backend`
     - **Environment**: `Python 3`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Set Environment Variables**:
   - Add `SUPABASE_URL` and `SUPABASE_KEY`

4. **Deploy**:
   - Click "Create Web Service"
   - Wait for deployment
   - Copy the URL (e.g., `https://realorai-backend.onrender.com`)

5. **Update Frontend** (same as Railway step 5)

## Option 3: Fly.io

1. **Install Fly CLI**: `curl -L https://fly.io/install.sh | sh`

2. **Login**: `fly auth login`

3. **Initialize**: In the `backend` directory, run:
   ```bash
   fly launch
   ```

4. **Set Secrets**:
   ```bash
   fly secrets set SUPABASE_URL=your_url
   fly secrets set SUPABASE_KEY=your_key
   ```

5. **Deploy**: `fly deploy`

## Testing

After deployment, test the backend:
```bash
curl https://your-backend-url.com/docs
```

You should see the FastAPI documentation page.

## Important Notes

- The backend URL must be accessible from the internet
- Make sure CORS is enabled (already configured in `main.py`)
- The `/analyze` endpoint accepts POST requests with image files
- The `/feedback` endpoint accepts POST requests with JSON feedback data

