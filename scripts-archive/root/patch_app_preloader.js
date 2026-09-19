const fs = require('fs');

let content = fs.readFileSync('admin-hudafestival-main/src/App.jsx', 'utf8');

// Import LoadingScreen instead of defining Preloader
content = content.replace(
  "import TopicManagementPage from './pages/TopicManagementPage';\\nimport TeamPortalDashboard from './pages/TeamPortalDashboard';",
  "import TopicManagementPage from './pages/TopicManagementPage';\\nimport TeamPortalDashboard from './pages/TeamPortalDashboard';\\nimport LoadingScreen from './components/LoadingScreen';"
);

// Delete the Preloader component
const preloaderStart = content.indexOf('const Preloader = () => {');
const appStart = content.indexOf('function App() {');
if (preloaderStart > -1 && appStart > -1) {
  content = content.substring(0, preloaderStart) + content.substring(appStart);
}

// Replace showPreloader state with bootComplete and settingsLoaded
content = content.replace(
  "  const [showPreloader, setShowPreloader] = useState(true);",
  "  const [bootComplete, setBootComplete] = useState(false);\n  const [settingsLoaded, setSettingsLoaded] = useState(false);"
);

// Replace setTimeout in useEffect with logic that relies on fetchSettings
content = content.replace(
  "  useEffect(() => {\n    const t = setTimeout(() => setShowPreloader(false), 2000);\n    return () => clearTimeout(t);\n  }, []);",
  "" // Remove this useEffect entirely, we will handle it in fetchSettings
);

// Add setSettingsLoaded to fetchSettings
content = content.replace(
  "        if (data) setAppSettings({ maintenanceMode: data.maintenanceMode, maintenanceMessage: data.maintenanceMessage });\n      } catch (e) {}\n    };\n    fetchSettings();",
  "        if (data) setAppSettings({ maintenanceMode: data.maintenanceMode, maintenanceMessage: data.maintenanceMessage });\n      } catch (e) {} finally { setSettingsLoaded(true); }\n    };\n    fetchSettings();"
);

// handleLoginSuccess
content = content.replace(
  "    setShowPreloader(true);\n    setTimeout(() => setShowPreloader(false), 2000);",
  "    setBootComplete(false);\n    setSettingsLoaded(false);\n    // We will let the useEffect fetch settings again or just set it to true immediately\n    // actually, let's just trigger it\n    setTimeout(() => setSettingsLoaded(true), 100);"
);

// Replace {showPreloader && <Preloader />} with {!bootComplete && <LoadingScreen />}
content = content.replaceAll(
  "<AnimatePresence>{showPreloader && <Preloader />}</AnimatePresence>",
  "{!bootComplete && <LoadingScreen isReady={settingsLoaded} onComplete={() => setBootComplete(true)} />}"
);

fs.writeFileSync('admin-hudafestival-main/src/App.jsx', content, 'utf8');
