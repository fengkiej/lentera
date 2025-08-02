import { useState } from "react";
import { SplashScreen } from "@/components/splash-screen";
import { AppProviders } from "@/providers";
import { AppRoutes } from "@/routes";
import "@/styles";

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
};

export default App;
