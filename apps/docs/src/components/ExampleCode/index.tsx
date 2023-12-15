// import fs from 'fs';
import CodeBlock from '@theme/CodeBlock';
import styles from './styles.module.css';

type ExampleCodeProps = {
  metastring?: string;
  path: string;
  preappendPath?: string;
  numbered?: boolean;
  start?: number;
  end?: number;
  hide?: [start: number, end: number, replace?: string][];
};

const toTxt = (d: unknown): string => {
  if (typeof d === 'string') {
    return d
  }
  if (Array.isArray(d)) {
    return `array: ${d.map((v) => toTxt(v)).join('\n')}`
  }
  if (d === null || d === undefined) return ''
  if (typeof d === 'object') {
    const keys = Object.keys(d)
    if ('props' in d) {
      return toTxt((d.props))
    }
    if ('children' in d) {
      return toTxt(d.children)
    }
    return `keys: ${keys.join(', ')}`
  }
  return typeof d
}

export default function ExampleCode({ path, preappendPath, numbered = true, start, end, hide, metastring }: ExampleCodeProps): JSX.Element {
  const fileParts = path.split('.')
  const ext = fileParts.pop()
  const Code = require(`@site/static/code/${path}.md`).default()
  console.log(start, end, toTxt(Code));
  if (start !== undefined) {
    start = start - 1;
  }
  const lines = toTxt(Code).split(`\n`).slice(start, end);
  if (hide) {
    hide.forEach(([s, e, r]) => {
      const rep = r ? [r] : []
      lines.splice(s - 1, e - s + 1, ...rep)
    })
  }
  const text = lines.join('\n')

  return (
    <>
      <div className={styles.codeBlock}>
        <CodeBlock language={ext} title={`${preappendPath ?? ''}${path}`} showLineNumbers={numbered} metastring={metastring}>{text}</CodeBlock>
      </div>
    </>
  );
}
