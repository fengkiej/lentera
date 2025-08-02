import { Route, Routes } from "react-router-dom";
import { PageTransition } from "@/components/page-transition";
import { ROUTES } from "./constants";
import { lazyLoad } from "@/utils/lazy-component";

// Pages - eagerly loaded
import Explore from "@/pages/Explore";
import NotFound from "@/pages/NotFound";

// Pages - lazily loaded
const Index = lazyLoad(() => import("@/pages/Index"));

// Page wrapper component to handle transitions
const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <PageTransition>
      {children}
    </PageTransition>
  );
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Main Route - eagerly loaded for faster initial render */}
      <Route
        path={ROUTES.HOME}
        element={
          <PageWrapper>
            <Explore />
          </PageWrapper>
        }
      />
      
      {/* Lazily loaded routes */}
      <Route
        path={ROUTES.ORIGINAL}
        element={
          <PageWrapper>
            <Index />
          </PageWrapper>
        }
      />
      
      {/* Catch-all route for 404 errors - eagerly loaded for error handling */}
      <Route
        path={ROUTES.NOT_FOUND}
        element={
          <PageWrapper>
            <NotFound />
          </PageWrapper>
        }
      />
    </Routes>
  );
};