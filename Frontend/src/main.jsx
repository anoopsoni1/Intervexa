import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from "react-router-dom"
import { Provider } from 'react-redux'
import { store } from './store/index.js'
import {
  Home,
  Dashboard,
  Login,
  Register,
  UploadPage,
  AtsChecker,
  PricingSection,
  Payment,
  PaymentResult,
  Profile,
  Contact,
  About,
  TemplatesPage,
  ResumeView,
  PortfolioDesignView,
  TemplatesDesignPage,
  ClassicTemplate,
  MinimalTemplate,
  PremiumTemplate,
  ModernTemplate,
  ModernResumeDesignViewPage,
  PremiumResumeDesignViewPage,
  ClassResumeDesignViewPage,
  MinimalResumeDesignViewPage,
  UpPage,
  AdminDashboard,
  VideoCallInterviews,
  VideoCallInterviewCreate,
  VideoCallInterviewDetail,
  LiveInterviewCall,
  AIInterviewCall,
  AddDetails,
  EditResumePage,
  CareerRoadmapPage,
  InterviewStartPage,
  CodingInterviewPage,
  LeaderboardPage,
  AuthCallback,
  VerifyEmailPage,
} from './routes/lazyPages.js'
import { Analytics } from "@vercel/analytics/react"
import { registerSW } from 'virtual:pwa-register'
import { ToastProvider } from './context/ToastContext'
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "./lib/queryClient.js"
import GlobalBackgroundLayout from './components/layout/GlobalBackgroundLayout.jsx'
import RequireAuth from './components/auth/RequireAuth.jsx'
import RequirePremium from './components/auth/RequirePremium.jsx'

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("New content available. Reload?")) {
      updateSW()
    }
  },
  onOfflineReady() {
    console.log("App ready to work offline")
  },
})

const route = createBrowserRouter([
  {
    path: "/",
    element: <GlobalBackgroundLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "login", element: <Login /> },
      { path: "auth/callback", element: <AuthCallback /> },
      { path: "verify-email", element: <VerifyEmailPage /> },
      { path: "register", element: <Register /> },
      { path: "upload", element: <UploadPage /> },
      { path: "add-details", element: <AddDetails /> },
      { path: "edit-resume", element: <EditResumePage /> },
      { path: "atsscore", element: <AtsChecker /> },
      {
        path: "templates",
        element: <Outlet />,
        children: [
          { index: true, element: <TemplatesPage /> },
          {
            element: <RequireAuth />,
            children: [
              { path: "modern", element: <ModernTemplate /> },
              { path: "modern/resumedesign", element: <ModernResumeDesignViewPage /> },
              { path: "resumedesign/:id", element: <ResumeView /> },
              { path: "portfoliodesign", element: <TemplatesDesignPage /> },
              { path: "portfoliodesign/:id", element: <PortfolioDesignView /> },
              {
                element: <RequirePremium />,
                children: [
                  { path: "classic", element: <ClassicTemplate /> },
                  { path: "classic/resumedesign", element: <ClassResumeDesignViewPage /> },
                  { path: "minimal", element: <MinimalTemplate /> },
                  { path: "minimal/resumedesign", element: <MinimalResumeDesignViewPage /> },
                  { path: "premium", element: <PremiumTemplate /> },
                  { path: "premium/resumedesign", element: <PremiumResumeDesignViewPage /> },
                ],
              },
            ],
          },
        ],
      },
      { path: "price", element: <PricingSection /> },
      { path: "payment", element: <Payment /> },
      { path: "payment-success", element: <PaymentResult /> },
      { path: "contact", element: <Contact /> },
      { path: "about", element: <About /> },
      { path: "dashboard/profile", element: <Profile /> },
      { path: "profile", element: <Navigate to="/dashboard/profile" replace /> },
      { path: "up", element: <UpPage /> },
      { path: "admin-dashboard", element: <AdminDashboard /> },
      { path: "dashboard/interviews", element: <VideoCallInterviews /> },
      { path: "dashboard/interviews/new", element: <VideoCallInterviewCreate /> },
      { path: "dashboard/interviews/:id", element: <VideoCallInterviewDetail /> },
      { path: "dashboard/interviews/:id/call", element: <LiveInterviewCall /> },
      { path: "dashboard/interviews/:id/ai-call", element: <AIInterviewCall /> },
      { path: "career-roadmap", element: <CareerRoadmapPage /> },
      { path: "coding-interview/start", element: <InterviewStartPage /> },
      { path: "coding-interview", element: <CodingInterviewPage /> },
      { path: "leaderboard", element: <LeaderboardPage /> },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <ToastProvider>
          <RouterProvider router={route} />
          <Analytics />
        </ToastProvider>
      </Provider>
    </QueryClientProvider>
  </StrictMode>,
)
