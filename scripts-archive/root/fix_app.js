const fs = require('fs');
let content = fs.readFileSync('admin-hudafestival-main/src/App.jsx', 'utf8');

const target = "  useEffect(() => {\n    if (!isAuthenticated) return;\n    const fetchNotifications";

const insertion = \  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        if (data) setAppSettings({ maintenanceMode: data.maintenanceMode, maintenanceMessage: data.maintenanceMessage });
      } catch (e) {
      } finally {
        setSettingsLoaded(true);
      }
    };
    fetchSettings();
    const int = setInterval(fetchSettings, 30000);
    return () => clearInterval(int);
  }, []);

\;

content = content.replace(target, insertion + target);
fs.writeFileSync('admin-hudafestival-main/src/App.jsx', content, 'utf8');
