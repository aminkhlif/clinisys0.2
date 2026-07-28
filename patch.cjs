const fs = require('fs');

let code = fs.readFileSync('src/pages/AdminDashboardPage.jsx', 'utf8');
code = code.replace(/export function AdminNav[\s\S]*?\}\n/, "import AdminNav from '../components/admin/AdminNav.jsx';\n");
code = code.replace(/<Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Administration<\/Typography>/, "");
fs.writeFileSync('src/pages/AdminDashboardPage.jsx', code);

code = fs.readFileSync('src/pages/AdminUsersPage.jsx', 'utf8');
code = code.replace(/import \{ AdminNav \} from '.\/AdminDashboardPage.jsx';/, "import AdminNav from '../components/admin/AdminNav.jsx';");
code = code.replace(/<Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Administration<\/Typography>/, "");
fs.writeFileSync('src/pages/AdminUsersPage.jsx', code);

code = fs.readFileSync('src/pages/AdminJournalPage.jsx', 'utf8');
code = code.replace(/import \{ AdminNav \} from '.\/AdminDashboardPage.jsx';/, "import AdminNav from '../components/admin/AdminNav.jsx';");
code = code.replace(/<Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Administration<\/Typography>/, "");
fs.writeFileSync('src/pages/AdminJournalPage.jsx', code);
