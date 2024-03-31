import Giscus from "@giscus/react";
import { useColorMode } from '@docusaurus/theme-common';

export default function GiscusComponent() {
  // const { colorMode } = useColorMode();

  return (
    <Giscus    
      repo="gofer-engine/gofer-engine"
      repoId="R_kgDOJv75IA"
      category="Announcements"
      categoryId="DIC_kwDOJv75IM4CaLOO"  // E.g. id of "General"
      mapping="url"                        // Important! To map comments to URL
      term="Welcome to @giscus/react component!"
      strict="0"
      reactionsEnabled="1"
      emitMetadata="1"
      inputPosition="top"
      // theme={colorMode}
      lang="en"
      loading="lazy"
    />
  );
}