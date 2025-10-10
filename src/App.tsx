import { useEffect } from "react";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LicenseAgreement from "./pages/LicenseAgreementPage";
import PrivacyPolicy from "./pages/PrivacyPolicyPage";
import TermsOfService from "./pages/TermsOfServicePage";

function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const element = document.querySelector(location.hash);
        if (element) element.scrollIntoView({ behavior: "smooth" });
      }, 200);
    }
  }, [location]);

  return null;
}

function App() {
  return (
    <Router>
      <ScrollToHash /> {/* ✅ listens for hash changes */}
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/license" element={<LicenseAgreement />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
