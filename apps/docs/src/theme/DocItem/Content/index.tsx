import Content from '@theme-original/DocItem/Content';
import GiscusComponent from '@site/src/components/GiscusComponent';

export default function ContentWrapper(props) {
  return (
    <>
      <Content {...props} />
      <GiscusComponent />
    </>
  );
}
