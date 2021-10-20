module.paths.push(process.env.MODULES_PATH)
const ts = require('typescript');
const fs = require('fs');
const path = require('path');
const R = require('ramda');

const args = process.argv.slice(2);
const src = args[0];

const isOptional = (prop) => (prop.getFlags() & ts.SymbolFlags.Optional) !== 0;

const PRIMITIVES = [
    'string',
    'number',
    'bool',
    'any',
    'array',
    'object',
    'node',
];

const unionSupport = R.concat(PRIMITIVES, ['boolean', 'Element']);

const reArray = new RegExp(`(${R.join('|', unionSupport)})\\[\\]`);

const isArray = (rawType) => reArray.test(rawType);

const isUnionlitteral = (typeObj) =>
    typeObj.types.every(
        (t) =>
            t.getFlags() &
            (ts.TypeFlags.StringLiteral |
                ts.TypeFlags.NumberLiteral |
                ts.EnumLiteral |
                ts.TypeFlags.Undefined)
    );

let tsconfig = {};

if (fs.existsSync('tsconfig.json')) {
    tsconfig = JSON.parse(fs.readFileSync('tsconfig.json'));
}

function walk(directory, components = {}) {
    const names = [];
    const filepaths = [];
    fs.readdirSync(src).forEach((f) => {
        const filepath = path.join(directory, f);
        if (fs.lstatSync(filepath).isDirectory()) {
            walk(f, components);
        } else {
            try {
                filepaths.push(filepath);
                const name = /(.*)\.tsx/.exec(f)[1];
                names.push(name);
            } catch (err) {
                process.stderr.write(
                    `ERROR: Invalid component file ${filepath}: ${err}`
                );
            }
        }
    });

    const program = ts.createProgram(filepaths, tsconfig);
    const checker = program.getTypeChecker();

    const coerceValue = (t) => {
        // May need to improve for shaped/list literals.
        if (t.isStringLiteral()) return `'${t.value}'`;
        return t.value;
    };

    // Not sure this get used, but should get some type of components
    // we not using in the dazzler libraries for now.
    const getComponentFromExp = (exp) => {
        const decl = exp.valueDeclaration || exp.declarations[0];
        const type = checker.getTypeOfSymbolAtLocation(exp, decl);
        const typeSymbol = type.symbol || type.aliasSymbol;

        if (!typeSymbol) {
            return exp;
        }

        const symbolName = typeSymbol.getName();

        if (
            (symbolName === 'MemoExoticComponent' ||
                symbolName === 'ForwardRefExoticComponent') &&
            exp.valueDeclaration &&
            ts.isExportAssignment(exp.valueDeclaration) &&
            ts.isCallExpression(exp.valueDeclaration.expression)
        ) {
            const component = checker.getSymbolAtLocation(
                exp.valueDeclaration.expression.arguments[0]
            );

            if (component) return component;
        }
        return exp;
    };

    const getEnum = (typeObj) => ({
        name: 'enum',
        value: typeObj.types.map((t) => ({
            value: coerceValue(t),
            computed: false,
        })),
    });

    const getUnion = (typeObj, propObj) => {
        let name = 'union',
            value;
        // Union only do base types
        value = typeObj.types
            .filter((t) => {
                const s = checker.typeToString(t);
                return R.includes(s, unionSupport) || isArray(s);
            })
            .map((t) => getAspectType(t, propObj));
        // empty union make the generator go wonky and create invalid
        // components types
        if (!value.length) {
            name = 'any';
            value = undefined;
        }
        return {
            name,
            value,
        };
    };

    const getAspectTypeName = (propName) => {
        if (R.includes('=>', propName) || propName === 'Function') {
            return 'func';
        } else if (propName === 'boolean') {
            return 'bool';
        } else if (propName === '[]') {
            return 'array';
        } else if (
            propName === 'Element'
            || propName === 'ReactNode'
            || propName === 'ReactElement'
        ) {
            return 'node';
        }
        return propName
    }

    // Format the type output as required by the dazzler generator.
    const getAspectType = (propType, propObj) => {
        let name = checker.typeToString(propType);
        let value;
        const raw = name;

        if (propType.isUnion()) {
            if (isUnionlitteral(propType)) {
                return {...getEnum(propType), raw};
            } else if (R.includes('|', raw)) {
                return {...getUnion(propType, propObj), raw};
            }
        }

        name = getAspectTypeName(name);

        // Shapes & array support.
        if (
            !R.includes(name, R.concat(PRIMITIVES, ['enum', 'func', 'union']))
        ) {
            if (
                R.includes('[]', name) ||
                R.includes('Array', name) ||
                name === 'tuple'
            ) {
                name = 'arrayOf';
                const replaced = R.replace('[]', '', raw);
                if (R.includes(replaced, unionSupport)) {
                    // Simple types are easier.
                    value = {
                        name: getAspectTypeName(replaced),
                        raw: replaced,
                    };
                } else {
                    // Complex types get the type parameter (Array<type>)
                    const [nodeType] = checker.getTypeArguments(propType);

                    if (nodeType) {
                        // const props = checker.getPropertiesOfType(nodeType);
                        value = getAspectType(nodeType, propObj);
                    } else {
                        // Not sure, might be unsupported here.
                        name = 'array';
                    }
                }
            } else {
                name = 'shape';
                // If the type is declared as union it will have a types attribute.
                if (propType.types && propType.types.length) {
                    if (isUnionlitteral(propType)) {
                        return {...getEnum(propType), raw};
                    }
                    return {...getUnion(propType, propObj), raw};
                }

                value = getProps(
                    checker.getPropertiesOfType(propType),
                    propObj,
                    [],
                    {},
                    true
                );
            }
        }

        return {
            name,
            value,
            raw,
        };
    };

    const getDefaultProps = (symbol, source) => {
        const statements = source.statements.filter(
            (stmt) =>
                (!!stmt.name &&
                    checker.getSymbolAtLocation(stmt.name) === symbol) ||
                ts.isExpressionStatement(stmt) ||
                ts.isVariableStatement(stmt)
        );
        return statements.reduce((acc, statement) => {
            let propMap = {};

            statement.getChildren().forEach((child) => {
                let {right} = child;
                if (right && ts.isIdentifier(right)) {
                    const value = source.locals.get(right.escapedText);
                    if (
                        value &&
                        value.valueDeclaration &&
                        ts.isVariableDeclaration(value.valueDeclaration) &&
                        value.valueDeclaration.initializer
                    ) {
                        right = value.valueDeclaration.initializer;
                    }
                }
                if (right) {
                    const {properties} = right;
                    if (properties) {
                        propMap = getDefaultPropsValues(properties);
                    }
                }
            });

            return {
                ...acc,
                ...propMap,
            };
        }, {});
    };

    const getComment = (symbol) => {
        const comment = symbol.getDocumentationComment();
        const tags = symbol.getJsDocTags();
        // FIXME @ char lose indent for examples eg: @page.bind(...)
        if (comment) {
            return R.join('\n')(
                R.concat(
                    comment.map((c) => c.text),
                    // Lose the indent grr. why not complete???
                    tags.map((t) =>
                        R.concat(
                            ['@', t.name],
                            (t.text || []).map((e) => e.text)
                        )
                    )
                )
            );
        }
        return '';
    };

    const getPropsForFunctionalComponent = (type) => {
        const callSignatures = type.getCallSignatures();

        for (const sig of callSignatures) {
            const params = sig.getParameters();
            if (params.length === 0) {
                continue;
            }

            // There is only one parameter for functional components: props
            const p = params[0];
            if (p.name === 'props' || params.length === 1) {
                return p;
            }
        }
        return null;
    };

    const getPropsForClassComponent = (typeSymbol, source, defaultProps) => {
        const childs = source.getChildAt(0);
        let stop;

        for (let i = 0, n = childs.getChildCount(); i < n && !stop; i++) {
            const c = childs.getChildAt(i);
            if (!ts.isClassDeclaration(c)) continue;

            if (!c.heritageClauses) continue;

            for (const clause of c.heritageClauses) {
                if (clause.token !== ts.SyntaxKind.ExtendsKeyword) continue;
                const t = clause.types[0];
                const propType = t.typeArguments[0];

                const type = checker.getTypeFromTypeNode(propType);

                return getProps(
                    type.getProperties(),
                    typeSymbol,
                    [],
                    defaultProps
                );
            }
        }
    };

    const getDefaultPropsValues = (properties) =>
        properties.reduce((acc, p) => {
            if (!p.name || !p.initializer) {
                return acc;
            }
            let propName, value;

            switch (p.name.kind) {
                case ts.SyntaxKind.NumericLiteral:
                case ts.SyntaxKind.StringLiteral:
                case ts.SyntaxKind.Identifier:
                    propName = p.name.text;
                    break;
                case ts.SyntaxKind.ComputedPropertyName:
                    propName = p.name.getText();
                    break;
            }

            const {initializer} = p;

            switch (initializer.kind) {
                case ts.SyntaxKind.StringLiteral:
                    value = `'${initializer.text}'`;
                    break;
                case ts.SyntaxKind.NumericLiteral:
                    value = Number(initializer.text);
                    break;
                case ts.SyntaxKind.NullKeyword:
                    value = null;
                    break;
                case ts.SyntaxKind.FalseKeyword:
                    value = false;
                    break;
                case ts.SyntaxKind.TrueKeyword:
                    value = true;
                    break;
                default:
                    try {
                        value = initializer.getText();
                    } catch (e) {
                        value = undefined;
                    }
            }

            acc[propName] = {value, computed: false};

            return acc;
        }, {});

    const getDefaultPropsForClassComponent = (type, source) => {
        // For class component, the type has it's own property, then get the
        // first declaration and one of them will be either
        // an ObjectLiteralExpression or an Identifier which get in the
        // newChild with the proper props.
        const defaultProps = type.getProperty('defaultProps');
        if (!defaultProps) {
            return {};
        }
        const decl = defaultProps.getDeclarations()[0];
        let propValues = {};

        decl.getChildren().forEach((child) => {
            let newChild = child;

            if (ts.isIdentifier(child)) {
                // There should be two identifier, the first is ignored.
                const value = source.locals.get(child.escapedText);
                if (
                    value &&
                    value.valueDeclaration &&
                    ts.isVariableDeclaration(value.valueDeclaration) &&
                    value.valueDeclaration.initializer
                ) {
                    newChild = value.valueDeclaration.initializer;
                }
            }

            const {properties} = newChild;
            if (properties) {
                propValues = getDefaultPropsValues(properties);
            }
        });
        return propValues;
    };

    const getProps = (
        properties,
        propsObj,
        baseProps = [],
        defaultProps = {},
        flat = false
    ) => {
        const results = {};

        properties.forEach((prop) => {
            const name = prop.getName();
            const propType = checker.getTypeOfSymbolAtLocation(
                prop,
                propsObj.valueDeclaration
            );
            const baseProp = baseProps.find((p) => p.getName() === name);
            const defaultValue = defaultProps[name];

            const required =
                !isOptional(prop) &&
                (!baseProp || !isOptional(baseProp)) &&
                defaultValue === undefined;

            const description = getComment(prop);

            let result = {
                description,
                required,
                defaultValue,
            };
            const type = getAspectType(propType, propsObj);
            // root object is inserted as type,
            // otherwise it's flat in the value prop.
            if (!flat) {
                result.type = type;
            } else {
                result = {...result, ...type};
            }

            results[name] = result;
        });

        return results;
    };

    const getPropInfo = (propsObj, defaultProps) => {
        const propsType = checker.getTypeOfSymbolAtLocation(
            propsObj,
            propsObj.valueDeclaration
        );
        const baseProps = propsType.getApparentProperties();
        let propertiesOfProps = baseProps;

        // Not sure used.
        if (propsType.isUnionOrIntersection()) {
            propertiesOfProps = [
                ...checker.getAllPossiblePropertiesOfTypes(propsType.types),
                ...baseProps,
            ];

            if (!propertiesOfProps.length) {
                const subTypes = checker.getAllPossiblePropertiesOfTypes(
                    propsType.types.reduce(
                        (all, t) => [...all, ...(t.types || [])],
                        []
                    )
                );
                propertiesOfProps = [...subTypes, ...baseProps];
            }
        }

        return getProps(propertiesOfProps, propsObj, baseProps, defaultProps);
    };

    R.zip(filepaths, names).forEach(([f, name]) => {
        const source = program.getSourceFile(f);
        const moduleSymbol = checker.getSymbolAtLocation(source);
        const exports = checker.getExportsOfModule(moduleSymbol);

        exports.forEach((exp) => {
            // From react-docgen-typescript mostly here
            let rootExp = getComponentFromExp(exp);
            const declaration =
                rootExp.valueDeclaration || rootExp.declarations[0];
            const type = checker.getTypeOfSymbolAtLocation(
                rootExp,
                declaration
            );

            let commentSource = rootExp;
            const typeSymbol = type.symbol || type.aliasSymbol;
            const originalName = rootExp.getName();

            // Not sure we need this here; Maybe for class support.
            if (!rootExp.valueDeclaration) {
                if (
                    originalName === 'default' &&
                    !typeSymbol &&
                    (rootExp.flags & ts.SymbolFlags.Alias) !== 0
                ) {
                    commentSource = checker.getAliasedSymbol(commentSource);
                } else if (!typeSymbol) {
                    return null;
                } else {
                    rootExp = typeSymbol;
                    const expName = rootExp.getName();

                    const defaultComponentTypes = [
                        '__function',
                        'StatelessComponent',
                        'Stateless',
                        'StyledComponentClass',
                        'StyledComponent',
                        'FunctionComponent',
                        'ForwardRefExoticComponent',
                    ];

                    const supportedComponentTypes = [...defaultComponentTypes];

                    if (R.includes(expName, supportedComponentTypes)) {
                        commentSource = checker.getAliasedSymbol(commentSource);
                    } else {
                        commentSource = rootExp;
                    }
                }
            } else if (
                type.symbol &&
                (ts.isPropertyAccessExpression(declaration) ||
                    ts.isPropertyDeclaration(declaration))
            ) {
                commentSource = type.symbol;
            } else {
            }

            let defaultProps = getDefaultProps(typeSymbol, source);
            let propsType = getPropsForFunctionalComponent(type);
            let props;

            if (propsType) {
                props = getPropInfo(propsType, defaultProps);
            } else {
                defaultProps = getDefaultPropsForClassComponent(type, source);
                props = getPropsForClassComponent(
                    typeSymbol,
                    source,
                    defaultProps
                );
            }

            components[name] = {
                displayName: name,
                description: getComment(commentSource),
                props,
            };
        });
    });

    return components;
}

process.stdout.write(JSON.stringify(walk(src), null, 2));
