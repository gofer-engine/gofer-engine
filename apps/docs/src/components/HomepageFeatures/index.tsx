import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Easy to Use',
    // FIXME: replace with our own image
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Gofer Engine was designed from the ground up for simplicity and speed.
        Get your interoperability engine up and running quickly. Deploy
        interface channels in minutes instead of days. Gofer Engine is easy to
        use and easy to learn. Get started in 5 minutes with our{' '}
        <a href="/docs/intro">tutorial</a>.
      </>
    ),
  },
  {
    title: 'Strongly Typed',
    // FIXME: replace with our own image
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Gofer Engine is built on top of TypeScript. This means that you can
        write filters and transformer steps with confidence and code completion.
        Whether you are writing a simple filter or a complex transformer, Gofer
        Engine will help you catch errors before they make it to production.
      </>
    ),
  },
  {
    title: 'Engine or Library',
    // FIXME: replace with our own image
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Gofer Engine can be used as a standalone interoperability engine or as
        a library in your application. As a standalone engine, Gofer Engine can
        process messages between a variety of sources and destinations. As a
        library, Gofer Engine can be used to build interoperability directly
        into your app.
      </>
    ),
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
