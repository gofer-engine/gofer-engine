export default function MDXPre(props: { children: JSX.Element }) {
  const snippet = props.children.props.metastring?.split(' ').includes('snippet')
  // With MDX 2, this element is only used for fenced code blocks
  // It always receives a MDXComponents/Code as children
  return <div className={snippet ? 'code-snippet' : ''}>{props.children}</div>;
}
