const ts = require('typescript');
const fs = require('fs');
const path = require('path');
const ramda = require('ramda');

const invalidElements = [
    'input',
    'script',
    'link',
    'head',
    'meta',
    'body',
    'html',
    'slot',
    'template',
    // IMPORTANT: object breaks the build
    'object',
];

const template = `import * as React from 'react';
import {enhanceProps} from 'commons';
import {HtmlOmittedProps, DazzlerHtmlProps} from '../../commons/js/types';

type Props = Omit<%(propType), HtmlOmittedProps> & DazzlerHtmlProps;

const %(upperName) = (props: Props) => <%(lowerName) {...enhanceProps(props)} />

export default React.memo(%(upperName));
`;

let tsconfig = {};

if (fs.existsSync('tsconfig.json')) {
    tsconfig = JSON.parse(fs.readFileSync('tsconfig.json'));
}

const elementFile = path.join(__dirname, './elements.ts');

const program = ts.createProgram([elementFile], tsconfig);
const checker = program.getTypeChecker();
const source = program.getSourceFile(elementFile);
const moduleSymbol = checker.getSymbolAtLocation(source);
const exported = checker.getExportsOfModule(moduleSymbol);
const elements = exported[0];

const elementsType = checker.getTypeOfSymbolAtLocation(
    elements,
    elements.valueDeclaration
);

const components = [];
const svgComponents = [];

elementsType.getProperties().forEach((element) => {
    const elementName = element.escapedName;
    if (invalidElements.includes(elementName)) {
        return;
    }
    const elementType = checker.getTypeOfSymbolAtLocation(
        element,
        element.declarations[0]
    );
    let typeString = checker.typeToString(elementType);
    const isSvg = ramda.startsWith('SVGProps', typeString);
    typeString = 'React.' + typeString;

    if (!isSvg) {
        const s = ramda.split('<', typeString);
        typeString = `${s[0]}<React.${ramda.join('<', s.slice(1, s.length))}`;
    }

    const upperName =
        elementName[0].toUpperCase() + elementName.slice(1, elementName.length);

    const component = ramda.pipe(
        ramda.replace('%(propType)', typeString),
        ramda.replace('%(upperName)', upperName),
        ramda.replace('%(upperName)', upperName),
        ramda.replace('%(lowerName)', elementName)
    )(template);
    let componentFile;
    if (isSvg) {
        svgComponents.push(upperName);
        componentFile = path.resolve(
            __dirname,
            '..',
            'svg',
            'components',
            `${upperName}.tsx`
        );
    } else {
        components.push(upperName);
        componentFile = path.join(__dirname, 'components', `${upperName}.tsx`);
    }

    fs.writeFileSync(componentFile, component);
});

const formatIndex = (c) => `${ramda.join(
    '\n',
    c.map((c) => `import ${c} from './components/${c}';`)
)}

export {
    ${ramda.join(',\n    ', c)},
};
`;

fs.writeFileSync(path.join(__dirname, 'index.ts'), formatIndex(components));
fs.writeFileSync(
    path.resolve(__dirname, '..', 'svg', 'index.ts'),
    formatIndex(svgComponents)
);
