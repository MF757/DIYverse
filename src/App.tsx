import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { injectVerificationMeta } from './lib/searchConsole';

const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const ImpressumPage = lazy(() => import('./pages/ImpressumPage').then((m) => ({ default: m.ImpressumPage })));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage').then((m) => ({ default: m.ProjectDetailPage })));
const ProjectUploadPage = lazy(() => import('./pages/ProjectUploadPage').then((m) => ({ default: m.ProjectUploadPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const SignInPage = lazy(() => import('./pages/SignInPage').then((m) => ({ default: m.SignInPage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })));
const UserContentPolicyPage = lazy(() => import('./pages/UserContentPolicyPage').then((m) => ({ default: m.UserContentPolicyPage })));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage').then((m) => ({ default: m.TermsOfServicePage })));
const CopyrightCompliancePage = lazy(() => import('./pages/CopyrightCompliancePage').then((m) => ({ default: m.CopyrightCompliancePage })));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));

function PageFallback() {
  return null;
}

function App() {
  useEffect(() => {
    injectVerificationMeta();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route
          index
          element={
            <Suspense fallback={<PageFallback />}>
              <HomePage />
            </Suspense>
          }
        />
        <Route
          path="project/:ownerId/:slug"
          element={
            <Suspense fallback={<PageFallback />}>
              <ProjectDetailPage />
            </Suspense>
          }
        />
        <Route
          path="publish"
          element={
            <Suspense fallback={<PageFallback />}>
              <ProjectUploadPage />
            </Suspense>
          }
        />
        <Route
          path="profile/:userId?"
          element={
            <Suspense fallback={<PageFallback />}>
              <ProfilePage />
            </Suspense>
          }
        />
        <Route
          path="signin"
          element={
            <Suspense fallback={<PageFallback />}>
              <SignInPage />
            </Suspense>
          }
        />
        <Route
          path="reset-password"
          element={
            <Suspense fallback={<PageFallback />}>
              <ResetPasswordPage />
            </Suspense>
          }
        />
        <Route
          path="impressum"
          element={
            <Suspense fallback={<PageFallback />}>
              <ImpressumPage />
            </Suspense>
          }
        />
        <Route
          path="user-content-policy"
          element={
            <Suspense fallback={<PageFallback />}>
              <UserContentPolicyPage />
            </Suspense>
          }
        />
        <Route
          path="terms-of-service"
          element={
            <Suspense fallback={<PageFallback />}>
              <TermsOfServicePage />
            </Suspense>
          }
        />
        <Route
          path="copyright-compliance"
          element={
            <Suspense fallback={<PageFallback />}>
              <CopyrightCompliancePage />
            </Suspense>
          }
        />
        <Route
          path="privacy-policy"
          element={
            <Suspense fallback={<PageFallback />}>
              <PrivacyPolicyPage />
            </Suspense>
          }
        />
        <Route
          path="about"
          element={
            <Suspense fallback={<PageFallback />}>
              <AboutPage />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
