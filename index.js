const StyleDictionary = require('style-dictionary');
const StyleDictionaryConfig = require('./style-config.json');
const del = require('del');
const path = require('path');
const tinycolor = require('tinycolor2');
const fs = require('fs-extra');
// Android SVG to XML Converter
const svgsus = require('svgsus');

// iOS SVG to PDF Converters
const PDFDocument = require('pdfkit');
const SVGtoPDF = require('svg-to-pdfkit');


// Custom SCSS transform
StyleDictionary.registerTransformGroup({
  name: 'custom-scss',
  transforms: [
    'attribute/cti',
    'name/cti/kebab',
    'time/seconds',
    'content/icon',
    'size/rem',
    'color/rgb',
  ],
});

// Custom Transformer for swift colors
StyleDictionary.registerTransform({
  name: 'color/SwiftColor',
  type: 'value',
  matcher(prop) {
    return prop.attributes.category === 'color';
  },
  transformer(prop) {
    const color = tinycolor(prop.original.value).toHex8();
    return `0x${color}`;
  },
});

StyleDictionary.registerTransformGroup({
  name: 'ios-swift',
  transforms: [
    'attribute/cti',
    'name/cti/pascal',
    'color/SwiftColor',
    'size/remToPt',
  ],
});


StyleDictionary.registerTemplate({
  name: 'ios/color-swift',
  template: path.join(__dirname, '/templates/swift/color.template'),
});


StyleDictionary.registerTemplate({
  name: 'android/custom-colors',
  template: path.join(__dirname, '/templates/android/color.template'),
});

StyleDictionary.registerTemplate({
  name: 'android/custom-fontDimens',
  template: path.join(__dirname, '/templates/android/fontDimens.template'),
});


StyleDictionary.registerAction({
  name: 'copy_fonts',
  do(dictionary, config) {
    console.log('Copying fonts directory');
    fs.copySync('assets/fonts', config.buildPath);
  },
  undo(dictionary, config) {
    console.log(`Removing fonts directory from ${config.buildPath} assets`);
    fs.removeSync(config.buildPath);
  },
});

StyleDictionary.registerAction({
  name: 'copy_icons_android',
  do(dictionary, config) {
    console.log('Copying icons directory');
    const assetsPath = path.join(__dirname, 'assets/icons');
    const assetPathArr = fs.readdirSync(assetsPath).map((file) => {
      const assetPath = path.join(assetsPath, file);
      const parsedPath = path.parse(assetPath);
      return {
        name: parsedPath.name,
        path: assetPath,
      };
    });
    const svgConverterOptions = { compressed: true, codeIndent: '  '};
    assetPathArr.forEach((asset) => {
      const svg = fs.readFileSync(asset.path, 'utf8');
      svgsus.vectordrawable
        .convert(svg, svgConverterOptions)
        .then(cleanedSvg => fs.outputFileSync(path.join(__dirname, config.buildPath, `${asset.name}.xml`), cleanedSvg))
        .catch(err => console.log(err));
    });
  },
  undo(dictionary, config) {
    console.log(`Removing icons directory from ${config.buildPath} assets`);
    fs.removeSync(config.buildPath);
  },
});

StyleDictionary.registerAction({
  name: 'copy_icons_ios',
  do(dictionary, config) {
    console.log('Copying icons directory');
    const assetsPath = path.join(__dirname, 'assets/icons');
    const assetPathArr = fs.readdirSync(assetsPath).map((file) => {
      const assetPath = path.join(assetsPath, file);
      const parsedPath = path.parse(assetPath);
      return {
        name: parsedPath.name,
        path: assetPath,
      };
    });
    assetPathArr.forEach((asset) => {
      const svg = fs.readFileSync(asset.path, 'utf8');
      const buildPath = path.join(__dirname, config.buildPath);
      fs.ensureDirSync(buildPath);
      const doc = new PDFDocument({ size: [22.5, 22.5] });
      const stream = fs.createWriteStream(path.join(buildPath, `${asset.name}.pdf`));
      SVGtoPDF(doc, svg, 0, 0);
      doc.pipe(stream);
      doc.end();
    });
  },
  undo(dictionary, config) {
    console.log(`Removing icons directory from ${config.buildPath} assets`);
    fs.removeSync(config.buildPath);
  },
});

const Dictionary = StyleDictionary.extend(StyleDictionaryConfig);

del(path.join(__dirname, './build'))
  .then(() => {
    Dictionary.buildAllPlatforms();
  });
