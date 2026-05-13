const fs = require('fs');
const pagePath = 'src/app/(dashboard)/brands/page.tsx';
const addSpecsPath = 'src/lib/add_specs.js';

const pageContent = fs.readFileSync(pagePath, 'utf8');
const addSpecsContent = fs.readFileSync(addSpecsPath, 'utf8');

const match = addSpecsContent.match(/const MODEL_SPECS = (\{[\s\S]*?\n\});/);
if (match) {
  const newModelSpecs = match[1];
  const updatedPageContent = pageContent.replace(/const MODEL_SPECS: Record<string, string\[\]> = \{[\s\S]*?\n\};\n/m, "const MODEL_SPECS: Record<string, string[]> = " + newModelSpecs + ";\n");
  fs.writeFileSync(pagePath, updatedPageContent);
  console.log('Successfully updated MODEL_SPECS in page.tsx');
} else {
  console.error('Could not find MODEL_SPECS in add_specs.js');
}
