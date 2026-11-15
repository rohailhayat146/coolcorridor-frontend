/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { RoutePlanner } from './components/RoutePlanner';
import { RouteHistory } from './components/RouteHistory';
import { FeedbackSection } from './components/FeedbackSection';
import { HowItWorks } from './components/HowItWorks';
import { KeyFindingsDashboard } from './components/KeyFindingsDashboard';
import { ResearchSection } from './components/ResearchSection';
import { MethodologySection } from './components/MethodologySection';
import { Footer } from './components/Footer';
import { LocationPoint } from './types/routes';

export default function App() {
  const [loadedRoute, setLoadedRoute] = useState<{
    origin: LocationPoint;
    destination: LocationPoint;
  } | null>(null);

  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLoadRouteFromHistory = (
    originLat: number,
    originLng: number,
    originLabel: string,
    destLat: number,
    destLng: number,
    destLabel: string
  ) => {
    setLoadedRoute({
      origin: {
        latitude: originLat,
        longitude: originLng,
        label: originLabel,
        address: `${originLat.toFixed(4)}, ${originLng.toFixed(4)}`,
      },
      destination: {
        latitude: destLat,
        longitude: destLng,
        label: destLabel,
        address: `${destLat.toFixed(4)}, ${destLng.toFixed(4)}`,
      },
    });
    scrollTo('planner');
  };

  return (
    <AuthProvider>
      <div id="top" className="min-h-screen flex flex-col relative text-[#202522]">
        {/* 1. Full-Page Fixed Background Video */}
        <div className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source
              src="https://ytbbxbtftsreqadvwxwn.supabase.co/storage/v1/object/public/urban%20city/276340_tiny.mp4"
              type="video/mp4"
            />
          </video>

          {/* 2. Tuned Readability Overlay */}
          <div className="absolute inset-0 bg-[#F7F7F3]/75 backdrop-blur-[3px]" />
        </div>

        {/* 3. Global CSS styling for card readability */}
        <style>{`
          section {
            background-color: rgba(247, 247, 243, 0.45) !important;
          }
          .bg-white, [class*="bg-white"] {
            background-color: #ffffff !important;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.08) !important;
          }
          nav {
            background-color: rgba(247, 247, 243, 0.85) !important;
            backdrop-filter: blur(8px) !important;
          }
          footer {
            background-color: rgba(247, 247, 243, 0.90) !important;
          }
        `}</style>

        {/* 4. Main Page Content Layer */}
        <div className="relative z-10 flex flex-col flex-1">
          {/* Top Navigation */}
          <Navbar onPlanRouteClick={() => scrollTo('planner')} />

          {/* Main sections */}
          <main className="flex-1">
            <HeroSection
              onPlanClick={() => scrollTo('planner')}
              onExploreResearchClick={() => scrollTo('key-findings')}
            />

            {/* Centerpiece Route Planner */}
            <RoutePlanner
              loadedRoute={loadedRoute}
              onRouteSaved={() => setHistoryRefreshTrigger((prev) => prev + 1)}
            />

            {/* Saved Route History Section */}
            <RouteHistory
              onLoadRoute={handleLoadRouteFromHistory}
              refreshTrigger={historyRefreshTrigger}
            />

            {/* 3-Step Process Explanation */}
            <HowItWorks />

            {/* Empirical Key Findings Research Dashboard */}
            <KeyFindingsDashboard />

            {/* Empirical Research & Routing Cost Function */}
            <ResearchSection />

            {/* Scientific Limitations & Transparency */}
            <MethodologySection />

            {/* Community & Research Feedback Section */}
            <FeedbackSection />
          </main>

          {/* Footer */}
          <Footer />
        </div>

        {/* Authentication Modal */}
        <AuthModal />
      </div>
    </AuthProvider>
  );
}