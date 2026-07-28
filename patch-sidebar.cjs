const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Sidebar.jsx', 'utf8');

if (!code.includes('import OnboardingTour')) {
  code = code.replace("import ConfirmDialog from '../common/ConfirmDialog.jsx';", "import ConfirmDialog from '../common/ConfirmDialog.jsx';\nimport OnboardingTour from '../common/OnboardingTour.jsx';");
}

code = code.replace(
  /ref={boutonNouveauMenuRef}/,
  'ref={boutonNouveauMenuRef}\n        id="tour-nouveau-menu"'
);

const tourMarkup = `
      <OnboardingTour 
        tourKey="sidebar"
        steps={[
          {
            target: '#tour-nouveau-menu',
            content: 'Ensuite, créez un menu pour organiser vos sous-menus.',
            disableBeacon: false,
            placement: 'bottom',
          }
        ]}
      />
`;

code = code.replace('</Box>\n  );\n}\n\nexport default Sidebar;', tourMarkup + '</Box>\n  );\n}\n\nexport default Sidebar;');

fs.writeFileSync('src/components/layout/Sidebar.jsx', code);
