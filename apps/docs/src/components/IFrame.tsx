interface IFrameProps {
  src: string;
  title: string;
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

export default function IFrame({ src, title }: IFrameProps) {
  return (
    <div style={containerStyle}>
      <a href={src} style={linkStyle}>{title}</a>
      <iframe src={src} style={iframeStyle} />
    </div>
  )

}