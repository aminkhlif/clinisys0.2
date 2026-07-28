const fs = require('fs');
let code = fs.readFileSync('src/pages/ModulesPage.jsx', 'utf8');

if (!code.includes('import OnboardingTour')) {
  code = code.replace("import ModulePreviewDrawer from '../components/module/ModulePreviewDrawer.jsx';", "import ModulePreviewDrawer from '../components/module/ModulePreviewDrawer.jsx';\nimport OnboardingTour from '../components/common/OnboardingTour.jsx';");
}

code = code.replace(
  /ref={boutonNouveauModuleRef}/,
  'ref={boutonNouveauModuleRef}\n              id="tour-nouveau-module"'
);

// Add the Tour component inside the return, before the main Box close if possible, or just inside <Box> at the end.
const tourMarkup = `
      <OnboardingTour 
        tourKey="modules"
        steps={[
          {
            target: '#tour-nouveau-module',
            content: 'Commencez par créer un espace pour vos menus (module).',
            disableBeacon: false,
            placement: 'bottom',
          }
        ]}
      />
`;

code = code.replace('</Box>\n  );\n}\n\nexport default ModulesPage;', tourMarkup + '</Box>\n  );\n}\n\nexport default ModulesPage;');

fs.writeFileSync('src/pages/ModulesPage.jsx', code);
