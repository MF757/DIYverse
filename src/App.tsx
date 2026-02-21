import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { injectVerificationMeta } from './lib/searchConsole';
import { HomePage } from './pages/HomePage';
import { ImpressumPage } from './pages/ImpressumPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { ProjectUploadPage } from './pages/ProjectUploadPage';
import { ProfilePage } from './pages/ProfilePage';
import { SignInPage } from './pages/SignInPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { UserContentPolicyPage } from './pages/UserContentPolicyPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { CopyrightCompliancePage } from './pages/CopyrightCompliancePage';

function App() {
  useEffect(() => {
    injectVerificationMeta();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="project/:ownerId/:slug" element={<ProjectDetailPage />} />
        <Route path="publish" element={<ProjectUploadPage />} />
        <Route path="profile/:userId?" element={<ProfilePage />} />
        <Route path="signin" element={<SignInPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="impressum" element={<ImpressumPage />} />
        <Route path="user-content-policy" element={<UserContentPolicyPage />} />
        <Route path="terms-of-service" element={<TermsOfServicePage />} />
        <Route path="copyright-compliance" element={<CopyrightCompliancePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
