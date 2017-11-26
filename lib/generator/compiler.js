const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const helpers = require('handlebars-helpers');

const { isBaseType } = require('./helpers');

handlebars.registerHelper(helpers());
handlebars.registerHelper('isBaseType', isBaseType);

const serverTemplate = fs.readFileSync(path.resolve(__dirname, './template/service/server.hbs'), 'utf8');
const clientTemplate = fs.readFileSync(path.resolve(__dirname, './template/service/client.hbs'), 'utf8');
const structTemplate = fs.readFileSync(path.resolve(__dirname, './template/struct.hbs'), 'utf8');
const enumTemplate = fs.readFileSync(path.resolve(__dirname, './template/enum.hbs'), 'utf8');
const unionTemplate = fs.readFileSync(path.resolve(__dirname, './template/union.hbs'), 'utf8');
const constTemplate = fs.readFileSync(path.resolve(__dirname, './template/const.hbs'), 'utf8');

const serviceServerCompiler = handlebars.compile(serverTemplate);
exports.serviceServerCompiler = serviceServerCompiler;

const serviceClientCompiler = handlebars.compile(clientTemplate);
exports.serviceClientCompiler = serviceClientCompiler;

const structCompiler = handlebars.compile(structTemplate);
exports.structCompiler = structCompiler;

const enumCompiler = handlebars.compile(enumTemplate);
exports.enumCompiler = enumCompiler;

const unionCompiler = handlebars.compile(unionTemplate);
exports.unionCompiler = unionCompiler;

const constCompiler = handlebars.compile(constTemplate);
exports.constCompiler = constCompiler;
