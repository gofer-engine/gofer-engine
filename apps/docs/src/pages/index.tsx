import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';
import ExampleCode from '../components/ExampleCode';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <img src="/img/gofer-engine-title.png" alt="Gofer Engine" />
        {/* <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading> */}
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro"
          >
            Gofer Engine Tutorial - 5min ⏱️
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <section className={styles.codeExample}>
          <div className="container">
            <Heading as="h2">Now with OOP support!</Heading>
            <p>
              Introducing a new dimension to Gofer Engine, we've seamlessly
              integrated Object-Oriented Programming (OOP) style scripting
              capabilities. This enhancement empowers users to leverage the
              principles of OOP in crafting their interface channels. With
              this feature, you can organize and encapsulate your code in a
              more modular and structured manner, enhancing readability and
              maintainability. Dive into the world of OOP within Gofer Engine,
              bringing an added layer of flexibility and sophistication to your
              interoperability workflows.
            </p>
            <p>
              In this concise example, we establish a basic HL7v2 TCP forwarder
              channel. The channel actively listens on localhost's port
              <code>5000</code> and efficiently forwards all valid HL7v2
              messages to the remote URL <code>hl7.emr.example.com</code>,
              utilizing port <code>5000</code>.
              
            </p>
            <ExampleCode path="starter.ts" numbered />
          </div>
        </section>
        <section className={styles.story}>
          <div className="container">
            <div className="row">
              <div className='col col--6'>
                <h2>Gofer Engine Standalone</h2>
                <p>
                Gofer Engine transcends the ordinary, evolving beyond a simple
                pass-through engine into a comprehensive standalone interface
                powerhouse. Elevate your interoperability experience with
                built-in support for filtering, transforming, queuing, events,
                routing, logging, and much more. This robust feature set is a
                testament to our commitment to simplicity, ensuring that even
                as a standalone engine, Gofer Engine seamlessly integrates
                advanced functionalities. Whether you're navigating intricate
                data transformations or orchestrating events with precision,
                Gofer Engine stands tall, reflecting our values of versatility
                and reliability in every interaction.
                </p>
                {/* <ExampleCode path="sample-adt-channel.ts" start={3} /> */}
                <div className="row">
                  <div className='col col--6'>
                    <h4>Message Types Supported</h4>
                    <ul>
                      <li>HL7 v2</li>
                      <li>JSON</li>
                      <li>XML</li>
                      <li>Delimitted Text</li>
                    </ul>
                  </div>
                  <div className='col col--6'>
                    <h4>Supported Connectors</h4>
                    <ul>
                      <li>TCP (MLLP)</li>
                      <li>HTTP</li>
                      <li>HTTPS</li>
                      <li>SFTP</li>
                    </ul>
                  </div>
                </div>
                <h4>Storage Methods/Databases Supported</h4>
                <table>
                  <tbody>
                    <tr>
                      <th width='40%'>Database</th>
                      <th width='20%'>Support</th>
                      <th width='40%'>Notes</th>
                    </tr>
                    <tr>
                      <td style={{backgroundColor: 'white'}}><img src={require('@site/static/img/Postgres_Logo.png').default} alt='PostgreSQL' width='100%' /></td>
                      <td align='center'>✔️</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td style={{backgroundColor: 'white'}}><img src={require('@site/static/img/MongoDB_Logo.svg.png').default} alt='MongoDB' width='100%' /></td>
                      <td align='center'>✔️</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td style={{backgroundColor: 'white'}}><img src={require('@site/static/img/SurrealDB_Logo.png').default} alt='SurrealDB' width='100%' /></td>
                      <td align='center'>✔️</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td style={{backgroundColor: 'white'}}><img src={require('@site/static/img/Dgraph_Logo.png').default} alt='Dgraph' width='100%' /></td>
                      <td align='center'>✔️</td>
                      <td>Only supported for HL7 v2 type messages</td>
                    </tr>
                    <tr>
                      <td>File Systems</td>
                      <td align='center'>✔️</td>
                      <td>Supports Local and Network File Systems</td>
                    </tr>
                  </tbody>
                </table>
                <div className={`${styles.ctaButtons}`}>
                  <Link
                    className="button button--secondary button--lg"
                    to="/docs/intro"
                  >
                    Continue as Standalone Engine
                  </Link>
                </div>
                <div className={`${styles.ctaButtons}`}>
                  <Link
                    className="button button--secondary button--lg"
                    to="/docs/integration"
                  >
                    Continue as Integrated Library
                  </Link>
                </div>
              </div>
              <div className='col col--6'>
                <h2>Gofer Engine Integrated</h2>
                <p>
                  Are you in the process of crafting a Node.JS application,
                  leveraging frameworks such as Express or Next.JS? Perhaps
                  you're deep into developing a RestFUL API, GraphQL Server, or
                  FHIR Server in Node.JS/TypeScript. In your quest for a
                  versatile tool to seamlessly handle sending and receiving HL7,
                  JSON, XML, delimited file types or FHIR resources, look no
                  further. Gofer Engine, as an integrated library, becomes an
                  invaluable asset, effortlessly weaving into your Node.JS
                  environment. Whether you're navigating intricate healthcare
                  standards or managing diverse data formats, Gofer Engine stands
                  as your reliable companion in the world of seamless integration.
                </p>
                <h4>Messengers</h4>
                <p>
                  Embedding Gofer Engine directly into your application is a
                  seamless experience. With integrated messenger functions,
                  creating, sending, receiving, and parsing healthcare messages
                  becomes an effortless process. Gofer Engine empowers your
                  application with the capability to interact with healthcare
                  messages, streamlining the communication process and ensuring
                  a smooth and efficient integration within your software
                  ecosystem.
                </p>
                {/* <ExampleCode path="sample-messenger.ts" /> */}
                <p>
                  After creating a messenger service function, you can use it to
                  pass values into the message builder and send the message.
                </p>
                {/* <ExampleCode path="sample-send-message.ts" start={2} /> */}
                <h4>Receivers</h4>
                <p>
                  If your application operates as a server, Gofer Engine
                  provides a powerful solution to set up a dedicated listener
                  for messages. This listener seamlessly captures messages from
                  remote endpoints, allowing you to effortlessly integrate the
                  parsed data into your application. Gofer Engine empowers your
                  server-side functionality, ensuring smooth communication and
                  effective data integration to enhance the capabilities of
                  your application.
                </p>
                <h4>Message Classes</h4>
                <p>
                  Gofer Engine not only supports but also provides an array of
                  tools designed to streamline the creation of a healthcare
                  interoperability engine. From message parsing to validation
                  and transformation, these tools simplify the intricate
                  process. For instance, parsed messages offer robust
                  interfaces, allowing seamless access and manipulation of
                  message data. At the heart of these interfaces lies the
                  foundation—the <code>IMsg</code> interface—a core element
                  empowering developers to navigate and shape healthcare data
                  effortlessly.
                </p>
                <ExampleCode path="IMsg.ts" hide={[[12, 25]]} />
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
