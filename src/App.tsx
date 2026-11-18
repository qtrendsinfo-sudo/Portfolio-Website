import { useCallback, useEffect, useState } from 'react';
import { BrandLoader } from './components/BrandLoader';
import { ContactSection } from './components/ContactSection';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { LocationMapSection } from './components/LocationMapSection';
import { Navbar } from './components/Navbar';
import { ProcessSection } from './components/ProcessSection';
import { ServicesSection } from './components/ServicesSection';
import { StudioSection } from './components/StudioSection';
import { WorkSection } from './components/WorkSection';
import { type AdminSection } from './components/admin/AdminShell';
import { AuthProvider } from './contexts/AuthContext';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';

type ParsedRoute =
  | { page: 'home'; canonicalPath: '/' }
  | { page: 'login'; canonicalPath: '/login' }
  | { page: 'signup'; canonicalPath: '/signup' }
  | { page: 'forgot-password'; canonicalPath: '/forgot-password' }
  | {
      page: 'admin';
      section: AdminSection;
      projectId?: string;
      canonicalPath: string;
    };

function parseRoute(pathname: string): ParsedRoute {
  const clean = pathname.replace(/\/+$/, '') || '/';

  if (clean === '/login') {
    return { page: 'login', canonicalPath: '/login' };
  }
  if (clean === '/signup') {
    return { page: 'signup', canonicalPath: '/signup' };
  }
  if (clean === '/forgot-password') {
    return { page: 'forgot-password', canonicalPath: '/forgot-password' };
  }
  if (clean === '/admin') {
    return { page: 'admin', section: 'overview', canonicalPath: '/admin' };
  }
  if (clean === '/admin/projects') {
    return { page: 'admin', section: 'projects', canonicalPath: '/admin/projects' };
  }
  if (clean === '/admin/projects/new') {
    return {
      page: 'admin',
      section: 'project-new',
      canonicalPath: '/admin/projects/new',
    };
  }
  if (clean === '/admin/inquiries') {
    return {
      page: 'admin',
      section: 'inquiries',
      canonicalPath: '/admin/inquiries',
    };
  }

  const editMatch = clean.match(/^\/admin\/projects\/([^/]+)\/edit$/);
  if (editMatch && editMatch[1]) {
    const projectId = decodeURIComponent(editMatch[1]);
    return {
      page: 'admin',
      section: 'project-edit',
      projectId,
      canonicalPath: `/admin/projects/${encodeURIComponent(projectId)}/edit`,
    };
  }

  if (clean.startsWith('/admin/')) {
    return { page: 'admin', section: 'overview', canonicalPath: '/admin' };
  }

  return { page: 'home', canonicalPath: '/' };
}

function StudioExperience() {
  const [route, setRoute] = useState<ParsedRoute>(() =>
    parseRoute(window.location.pathname),
  );
  const [sceneReady, setSceneReady] = useState(false);
  const [loaderDone, setLoaderDone] = useState(
    () => parseRoute(window.location.pathname).page !== 'home',
  );
  const [selectedProjectType, setSelectedProjectType] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    const onPopState = () => {
      const next = parseRoute(window.location.pathname);
      setRoute(next);
      if (next.page !== 'home') {
        setLoaderDone(true);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((path: string) => {
    const [rawPathname, rawSearch] = path.split('?');
    const parsed = parseRoute(rawPathname || '/');
    const targetUrl = rawSearch
      ? `${parsed.canonicalPath}?${rawSearch}`
      : parsed.canonicalPath;
    const currentFull = `${window.location.pathname}${window.location.search}`;

    if (currentFull !== targetUrl) {
      window.history.pushState({}, '', targetUrl);
    }

    setRoute(parsed);
    if (parsed.page !== 'home') {
      setLoaderDone(true);
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const handleSceneReady = useCallback(() => {
    setSceneReady(true);
  }, []);

  const handleLoaderComplete = useCallback(() => {
    setLoaderDone(true);
  }, []);

  const scrollToSection = useCallback((selector: string) => {
    const target = document.querySelector(selector);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleStartProject = useCallback(() => {
    if (route.page !== 'home') {
      navigate('/');
      window.setTimeout(() => scrollToSection('#contact'), 60);
      return;
    }
    scrollToSection('#contact');
  }, [navigate, route.page, scrollToSection]);

  const handleExploreWork = useCallback(() => {
    scrollToSection('#work');
  }, [scrollToSection]);

  const handleSelectServiceForProject = useCallback(
    (projectType: string) => {
      setSelectedProjectType(projectType);
      scrollToSection('#contact');
    },
    [scrollToSection],
  );

  if (route.page === 'login') {
    return <LoginPage onNavigate={navigate} />;
  }

  if (route.page === 'signup') {
    return <SignupPage onNavigate={navigate} />;
  }

  if (route.page === 'forgot-password') {
    return <ForgotPasswordPage onNavigate={navigate} />;
  }

  if (route.page === 'admin') {
    return (
      <AdminDashboardPage
        section={route.section}
        projectId={route.projectId}
        currentPath={route.canonicalPath}
        onNavigate={navigate}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#08080a] text-[#f4f4f0]">
      {!loaderDone && (
        <BrandLoader sceneReady={sceneReady} onComplete={handleLoaderComplete} />
      )}

      <Navbar onStartProject={handleStartProject} onNavigate={navigate} />

      <main>
        <HeroSection
          onSceneReady={handleSceneReady}
          onStartProject={handleStartProject}
          onExploreWork={handleExploreWork}
        />

        <WorkSection onNavigate={navigate} />

        <ProcessSection />

        <ServicesSection
          onSelectServiceForProject={handleSelectServiceForProject}
        />

        <StudioSection />

        <LocationMapSection />

        <ContactSection preselectedProjectType={selectedProjectType} />
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <StudioExperience />
      </AuthProvider>
    </ErrorBoundary>
  );
}
