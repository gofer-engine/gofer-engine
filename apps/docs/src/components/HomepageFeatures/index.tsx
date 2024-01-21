import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Intuitive Deployment',
    description: (
      <>
        Experience the power of Gofer Engine, meticulously crafted for
        simplicity and speed. Elevate your interoperability journey with an
        engine designed from the ground up to make complexity disappear.
        Launch your interface channels swiftly, turning what used to take days
        into a matter of minutes. Gofer Engine isn't just easy to use; it's a
        breeze to learn. Dive into the world of seamless connectivity in just 5
        minutes with our beginner-friendly <a href="/docs/intro">tutorial</a>.
        Your journey to smooth healthcare interoperability starts here, with a
        toolkit that prioritizes simplicity and rapid deployment.
      </>
    ),
  },
  {
    title: 'Type-Safe Development',
    description: (
      <>
        Gofer Engine is powered by TypeScript, bringing a robust and strongly-
        typed foundation to your development experience. When crafting filters
        and transformer steps, embrace the confidence that comes with robust
        type checking and code completion. Whether you're shaping a simple
        filter or intricately designing a complex transformer, Gofer Engine
        acts as your vigilant ally, ensuring errors are caught and resolved
        before they even have a chance to reach production. With strong typing
        at the core, code with assurance and elevate your development workflow.
      </>
    ),
  },
  {
    title: 'Versatile Integration Options',
    description: (
      <>
        Unlock the versatility of Gofer Engine, offering the flexibility to
        serve as a standalone interoperability engine or seamlessly integrate
        as a library into your application. In standalone mode, Gofer Engine
        excels at processing messages between diverse sources and destinations.
        As a library, it empowers you to seamlessly embed interoperability
        directly into your application, making it an integral part of your
        software ecosystem. Whether you're orchestrating interoperability
        independently or integrating within your app, Gofer Engine adapts to
        your needs with ease and efficiency.
      </>
    ),
  },
];

function Feature({ title, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      {/* <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div> */}
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
