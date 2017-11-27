/* eslint-disable no-param-reassign */
const fs = require('fs');
const path = require('path');
const util = require('util');
const FileHound = require('filehound');
const thriftParser = require('node-thrift-parser');
const camelCase = require('lodash.camelcase');

function compileThriftToAst(basePath) {
  return getThriftAstMap(basePath).then((ast) => {
    let newAst = formatASTMap(basePath, ast);
    newAst = mergeAstByNamespace(newAst);
    replaceEnumAndTypedef(newAst);
    return newAst;
  });
}
module.exports = compileThriftToAst;
/**
 * get thrift AST
 *
 * @param {string} thriftPath
 * @returns {Map<string,Object>}
 */
function getThriftAstMap(thriftPath) {
  return FileHound.create().paths(thriftPath).ext('thrift').find()
    .then(filePaths =>
      Promise.all(filePaths
        .map(filePath => util.promisify(fs.readFile)(filePath, 'utf8')
          .then((file) => {
            let ast;
            try {
              ast = thriftParser(file);
            } catch (error) {
              error.message = `compile file fail: ${filePath}, ${error.message}`;
              throw error;
            }
            return [filePath, ast];
          })))
        .then(ASTs => new Map(ASTs)));
}
/**
 *
 * @param {Map<string,Object>} asts
 */
function formatASTMap(thriftRootPath, asts) {
  const astMap = new Map();
  asts.forEach((ast, filePath) => {
    const namespace = getNamespace(ast.headers, filePath, thriftRootPath);

    const dependencies = ast.headers.filter(header => header.type === 'include').map((include) => {
      const includeRelativePath = include.path.replace(/"/g, '').replace(/'/g, '');
      const includePath = path.resolve(path.dirname(filePath), includeRelativePath);
      if (asts.has(includePath)) {
        const dependentNamespace = getNamespace(asts.get(includePath).headers, includePath, thriftRootPath);
        const name = path.basename(includeRelativePath, path.extname(includeRelativePath));
        let relativePath = path.relative(path.dirname(namespace.replace('.', '/')), dependentNamespace.replace('.', '/'));
        if (!relativePath.startsWith('.')) {
          relativePath = `./${relativePath}`;
        }
        return {
          name,
          namespace: dependentNamespace,
          relativePath
        };
      }
      throw new Error(`Invalid include ${include.path} in file ${filePath}`);
    });
    const consts = new Map();
    const enums = new Map();
    const structs = new Map();
    const exceptions = new Map();
    const unions = new Map();
    const typedefs = new Map();
    const services = new Map();
    ast.definitions.forEach((definition) => {
      switch (definition.type) {
        case 'enum':
          enums.set(definition.identifier, definition);
          break;
        case 'exception':
          exceptions.set(definition.identifier, definition);
          break;
        case 'struct':
          structs.set(definition.identifier, definition);
          break;
        case 'union':
          unions.set(definition.identifier, definition);
          break;
        case 'typedf':
          typedefs.set(definition.identifier, definition);
          break;
        case 'const':
          consts.set(definition.identifier, definition);
          break;
        case 'service':
          services.set(definition.identifier, definition);
          break;
        default:
      }
    });
    astMap.set(filePath, {
      filePath,
      namespace,
      dependencies,
      consts,
      enums,
      structs,
      unions,
      exceptions,
      typedefs,
      services
    });
  });
  return astMap;
}

function mergeAstByNamespace(asts) {
  const astMap = new Map();
  asts.forEach((ast) => {
    if (astMap.has(ast.namespace)) {
      const targetAst = astMap.get(ast.namespace);
      targetAst.dependencies.push(...ast.dependencies);
      try {
        mergeMap(targetAst.consts, ast.consts);
        mergeMap(targetAst.enums, ast.enums);
        mergeMap(targetAst.structs, ast.structs);
        mergeMap(targetAst.unions, ast.unions);
        mergeMap(targetAst.exceptions, ast.exceptions);
        mergeMap(targetAst.typedefs, ast.typedefs);
        mergeMap(targetAst.services, ast.services);
      } catch (e) {
        e.message = `${e.message} in namespace:'${ast.namespace}'`;
        throw e;
      }
    } else {
      astMap.set(ast.namespace, ast);
    }
  });
  return astMap;
}

function replaceEnumAndTypedef(asts) {
  asts.forEach((ast) => {
    const typedefMap = new Map(ast.typedefs);
    const enumMap = new Map(ast.enums);
    ast.dependencies.forEach((dependency) => {
      const dependencyAst = asts.get(dependency.namespace);
      dependencyAst.typedefs.forEach((typedef, name) => {
        typedefMap.set(`${dependency.name}.${name}`, {
          identifier: `${dependency.name}.${name}`,
          definitionType: typedef.definitionType,
          type: 'typedef'
        });
      });
      dependencyAst.enums.forEach((enumeration, name) => {
        enumMap.set(`${dependency.name}.${name}`, {
          identifier: `${dependency.name}.${name}`,
          type: 'enum',
          enumFields: enumeration.enumFields
        });
      });
    });

    if (enumMap.size > 0) {
      typedefMap.forEach((typedef) => {
        if (typeof typedef.definitionType === 'string' && enumMap.has(typedef.definitionType)) {
          typedef.definitionType = 'i32';
        } else if (typeof typedef.definitionType === 'object') {
          replaceEnumType(typedef.definitionType, enumMap);
        }
      });
    }
    (new Map([...ast.structs, ...ast.exceptions, ...ast.unions])).forEach((struct) => {
      struct.fields.forEach((field) => {
        if (enumMap.size > 0) {
          if (typeof field.fieldType === 'string' && enumMap.has(field.fieldType)) {
            field.fieldType = 'i32';
          } else if (typeof field.fieldType === 'object') {
            replaceEnumType(field.fieldType, enumMap);
          }
        }
        if (typedefMap.size > 0) {
          if (typeof field.fieldType === 'string' && typedefMap.has(field.fieldType)) {
            field.fieldType = typedefMap.get(field.fieldType).definitionType;
          } else if (typeof field.fieldType === 'object') {
            replaceTypedefType(field.fieldType, typedefMap);
          }
        }
      });
    });
    ast.services.forEach((service) => {
      service.functions.forEach((func) => {
        [...func.throws, ...func.args].forEach((field) => {
          if (enumMap.size > 0) {
            if (typeof field.fieldType === 'string' && enumMap.has(field.fieldType)) {
              field.fieldType = 'i32';
            } else if (typeof field.fieldType === 'object') {
              replaceEnumType(field.fieldType, enumMap);
            }
          }
          if (typedefMap.size > 0) {
            if (typeof field.fieldType === 'string' && typedefMap.has(field.fieldType)) {
              field.fieldType = typedefMap.get(field.fieldType).definitionType;
            } else if (typeof field.fieldType === 'object') {
              replaceTypedefType(field.fieldType, enumMap);
            }
          }
        });
        if (enumMap.size > 0) {
          if (typeof func.functionType === 'string' && enumMap.has(func.functionType)) {
            func.functionType = 'i32';
          } else if (typeof func.functionType === 'object') {
            replaceEnumType(func.functionType, enumMap);
          }
        }
        if (typedefMap.size > 0) {
          if (typeof func.functionType === 'string' && typedefMap.has(func.functionType)) {
            func.functionType = typedefMap.get(func.functionType).definitionType;
          } else if (typeof func.functionType === 'object') {
            replaceTypedefType(func.functionType, enumMap);
          }
        }
      });
    });
    ast.consts.forEach((constant) => {
      if (enumMap.size > 0) {
        if (typeof constant.fieldType === 'string' && enumMap.has(constant.fieldType)) {
          constant.fieldType = 'i32';
        } else if (typeof constant.fieldType === 'object') {
          replaceEnumType(constant.fieldType, enumMap);
        }
      }
      if (typedefMap.size > 0) {
        if (typeof constant.fieldType === 'string' && typedefMap.has(constant.fieldType)) {
          constant.fieldType = typedefMap.get(constant.fieldType).definitionType;
        } else if (typeof constant.fieldType === 'object') {
          replaceTypedefType(constant.fieldType, typedefMap);
        }
      }
    });
  });
}

function getNamespace(headers, filePath, basePath) {
  const namespaceHeader = headers.find(header => header.type === 'namespace' && header.namespaceScope === 'js');
  if (namespaceHeader) {
    return `${namespaceHeader.identifier}.${camelCase(path.basename(filePath, '.thrift'))}`;
  }
  return path.relative(basePath, filePath)
    .replace(/\.thrift$/, '')
    .split(path.sep)
    .map(x => camelCase(x))
    .join('.');
}

function mergeMap(targetMap, map) {
  map.forEach((val, key) => {
    if (targetMap.has(key)) {
      throw new Error(`${key} is existed`);
    } else {
      targetMap.set(key, val);
    }
  });
}

function replaceEnumType(target, enums) {
  const { type } = target;
  if (typeof type === 'string') {
    if (type === 'map') {
      if (typeof target.keyFieldType === 'string' && enums.has(target.keyFieldType)) {
        target.keyFieldType = 'i32';
      } else if (typeof target.keyFieldType === 'object') {
        replaceEnumType(target.keyFieldType, enums);
      }
      if (typeof target.valueFieldType === 'string' && enums.has(target.keyFieldType)) {
        target.valueFieldType = 'i32';
      } else if (typeof target.valueFieldType === 'object') {
        replaceEnumType(target.valueFieldType, enums);
      }
    } else if (type === 'list' || type === 'set') {
      if (typeof target.fieldType === 'string' && enums.has(target.keyFieldType)) {
        target.fieldType = 'i32';
      } else if (typeof target.fieldType === 'object') {
        replaceEnumType(target.fieldType, enums);
      }
    }
  } else if (typeof type === 'object') {
    replaceEnumType(target.type, enums);
  }
}

function replaceTypedefType(target, typedefs) {
  const { type } = target;
  if (typeof type === 'string') {
    if (type === 'map') {
      if (typeof target.keyFieldType === 'string' && typedefs.has(target.keyFieldType)) {
        target.keyFieldType = typedefs.get(target.keyFieldType).definitionType;
      } else if (typeof target.keyFieldType === 'object') {
        replaceEnumType(target.keyFieldType, typedefs);
      }
      if (typeof target.valueFieldType === 'string' && typedefs.has(target.keyFieldType)) {
        target.valueFieldType = typedefs.get(target.keyFieldType).definitionType;
      } else if (typeof target.valueFieldType === 'object') {
        replaceEnumType(target.valueFieldType, typedefs);
      }
    } else if (type === 'list' || type === 'set') {
      if (typeof target.fieldType === 'string' && typedefs.has(target.keyFieldType)) {
        target.fieldType = typedefs.get(target.keyFieldType).definitionType;
      } else if (typeof target.fieldType === 'object') {
        replaceEnumType(target.fieldType, typedefs);
      }
    }
  } else if (typeof type === 'object') {
    replaceEnumType(target.type, typedefs);
  }
}
