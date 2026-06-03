const pptxgen = require('pptxgenjs');
const pptx = new pptxgen();
console.log('pptxgen keys:', Object.keys(pptxgen));
console.log('pptx keys:', Object.keys(pptx));
console.log('pptx.ShapeType:', pptx.ShapeType);
console.log('pptx.shapes:', pptx.shapes);

