const fs = require('fs');
let content = fs.readFileSync('admin-hudafestival-main/src/App.jsx', 'utf8');

const target = "  useEffect(() => {\r\n    if (!isAuthenticated) return;\r\n    const fetchNotifications";
const target2 = "  useEffect(() => {\n    if (!isAuthenticated) return;\n    const fetchNotifications";

const insertion = `  useEffect(() => {
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

`;

if (content.includes(target)) {
  content = content.replace(target, insertion + target);
} else if (content.includes(target2)) {
  content = content.replace(target2, insertion + target2);
} else {
  console.log("Could not find target");
}

fs.writeFileSync('admin-hudafestival-main/src/App.jsx', content, 'utf8');
