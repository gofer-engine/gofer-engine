```ts title="/src/xmlExample.ts"
import XMLMsg, { XMLJson, parseXMLPath } from '@gofer-engine/xml';
// import fs from 'fs';
import { js2xml } from 'xml-js';


const getData = (xml: XMLJson, path: (string | number)[]) => {
  console.log({ path, xml })
  if (path.length === 0) {
    if (Array.isArray(xml)) {
      return { elements: xml }
    }
    return xml;
  }
  let picked: any;
  if (Array.isArray(xml)) {
    if (!xml.length) {
      return xml;
    }
    if (typeof path[0] === 'number') {
      picked = xml?.[path.shift() as number];
    } else if (path[0] === '*') {
      path.shift();
      return { elements: xml.map((e) => getData(e, path)) };
    }
    return getData(picked, path);
  }
  const [first, ...rest] = path;
  if (typeof first === 'number') {
    picked = xml.elements?.[first];
  } else if (typeof first === 'string') {
    picked = xml.elements?.filter(e => e.name === first);
  }
  if (picked.length === 1) {
    picked = picked[0];
  }
  return getData(picked, rest);
};

// const XML_String = fs.readFileSync('./samples/sample.xml', 'utf8');
const XML_String = `<msg>
  <DG1>
    <DG1.1><DG1.1.1>1</DG1.1.1></DG1.1>
    <DG1.2><DG1.2.1>I10</DG1.2.1></DG1.2>
    <DG1.3><DG1.3.1>R10.9</DG1.3.1></DG1.3>
    <DG1.4><DG1.4.1>UNSPECIFIED ABDOMINAL PAIN</DG1.4.1></DG1.4>
    <DG1.5/>
    <DG1.6><DG1.6.1>A</DG1.6.1></DG1.6>
    <DG1.7/>
    <DG1.8><DG1.8.1>391</DG1.8.1></DG1.8>
    <DG1.9/>
    <DG1.10/>
    <DG1.11><DG1.11.1>4252.21</DG1.11.1></DG1.11>
    <DG1.12/>
    <DG1.13/>
    <DG1.14/>
    <DG1.15/>
    <DG1.16/>
    <DG1.17/>
    <DG1.18><DG1.18.1>N</DG1.18.1></DG1.18>
  </DG1>
  <DG1>
    <DG1.1><DG1.1.1>2</DG1.1.1></DG1.1>
    <DG1.2><DG1.2.1>I10</DG1.2.1></DG1.2>
    <DG1.3><DG1.3.1>R10.9</DG1.3.1></DG1.3>
    <DG1.4><DG1.4.1>UNSPECIFIED ABDOMINAL PAIN</DG1.4.1></DG1.4>
    <DG1.5/>
    <DG1.6><DG1.6.1>A</DG1.6.1></DG1.6>
    <DG1.7/>
    <DG1.8><DG1.8.1>391</DG1.8.1></DG1.8>
    <DG1.9/>
    <DG1.10/>
    <DG1.11><DG1.11.1>4252.21</DG1.11.1></DG1.11>
    <DG1.12/>
    <DG1.13/>
    <DG1.14/>
    <DG1.15/>
    <DG1.16/>
    <DG1.17/>
    <DG1.18><DG1.18.1>N</DG1.18.1></DG1.18>
  </DG1>
</msg>`

const msg = new XMLMsg(XML_String);

const path = 'msg.DG1[5]';
const pathParsed = parseXMLPath(path);
console.log({ pathParsed })
const jsonData = msg.json(true);
console.log({ jsonData })
const data = getData(jsonData, pathParsed);
console.log({ data })
const xml = js2xml(data ?? {});
console.log({ xml })
```
