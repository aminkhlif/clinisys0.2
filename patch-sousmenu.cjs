const fs = require('fs');
let code = fs.readFileSync('src/pages/SousMenuPage.jsx', 'utf8');

if (!code.includes('import OnboardingTour')) {
  code = code.replace("import ConfirmDialog from '../components/common/ConfirmDialog.jsx';", "import ConfirmDialog from '../components/common/ConfirmDialog.jsx';\nimport OnboardingTour from '../components/common/OnboardingTour.jsx';");
}

code = code.replace(
  /onClick={\(\) => setDialogUploadOuvert\(true\)}/,
  'onClick={() => setDialogUploadOuvert(true)}\n            id="tour-ajouter-capture"'
);

const tourMarkup = `
      <OnboardingTour 
        tourKey="sousmenu"
        steps={[
          {
            target: '#tour-ajouter-capture',
            content: "Maintenant, ajoutez une capture d'écran pour ce sous-menu.",
            disableBeacon: false,
            placement: 'bottom',
          }
        ]}
      />
`;

code = code.replace('</Box>\n  );\n}\n\nexport default SousMenuPage;', tourMarkup + '</Box>\n  );\n}\n\nexport default SousMenuPage;');

fs.writeFileSync('src/pages/SousMenuPage.jsx', code);
