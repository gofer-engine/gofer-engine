interface IFrameProps {
  src: string;
  href?: string;
  title: string;
  video?: boolean;
}

const containerStyle: React.HTMLAttributes<HTMLDivElement>['style'] = {
  width: '90%',
  marginLeft: '5%',
  marginBottom: '1em',
};

const linkStyle: React.HTMLAttributes<HTMLAnchorElement>['style'] = {
  fontSize: '1.1em',
  paddingLeft: '0.5em',
};

const iframeStyle: React.HTMLAttributes<HTMLIFrameElement>['style'] = {
  width: '100%',
  borderColor: 'var(--ifm-color-primary)',
  borderWidth: 'thin',
  borderStyle: 'solid',
}


export default function IFrame({ src, href, title, video }: IFrameProps) {
  const extraProps = video ? {
    allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
    allowfullscreen: true,
    style: {
      ...iframeStyle,
      height: '25rem',
    }
  } : {}
  return (
    <div style={containerStyle}>
      <a href={href ?? src} target="_blank" style={linkStyle}>{title}</a>
      <iframe src={src} style={iframeStyle} {...extraProps} />
    </div>
  )

}