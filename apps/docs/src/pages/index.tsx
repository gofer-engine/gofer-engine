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
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
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
              In this minimal example, we create a simple HL7v2 tcp forwarder
              channel.
              <br />
              The channel listens on port <code>5000</code> of the <code>localhost</code> and forwards all
              valid HL7v2 messages to port <code>5000</code> of the remote url{' '}
              <code>hl7.emr.example.com</code>.
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
                  Gofer Engine is much more capable than just a simple
                  pass-through engine. It also supports filtering, transforming,
                  queuing, events, routing, logging, and much more.
                </p>
                {/* <ExampleCode path="sample-adt-channel.ts" start={3} /> */}
                <h4>Message Types Supported</h4>
                <ul>
                  <li>HL7 v2</li>
                  <li>JSON</li>
                  <li>XML</li>
                  <li>Delimitted Text</li>
                </ul>
                <h4>Supported Connectors</h4>
                <ul>
                  <li>TCP (MLLP)</li>
                  <li>HTTP</li>
                  <li>HTTPS</li>
                  <li>SFTP</li>
                </ul>
              </div>
              <div className='col col--6'>
                <h2>Gofer Engine Integrated</h2>
                <p>
                  Are you building a Node.JS application possibly using frameworks
                  like Express or Next.JS? Or are you developing a RestFUL API or
                  GraphQL Server in Node.JS/TypeScript? Are you looking for a tool
                  to help you send/receive HL7, JSON, FHIR, XML, or other delimited
                  file types?
                </p>
                <h4>Messengers</h4>
                <p>
                  Gofer Engine can be embedded into your application directly.
                  Gofer Engine includes messenger functions to make creating and
                  sending, or receiving and parsing healthcare messages a breeze.
                </p>
                {/* <ExampleCode path="sample-messenger.ts" /> */}
                <p>
                  After creating a messenger service function, you can use it to
                  pass values into the message builder and send the message.
                </p>
                {/* <ExampleCode path="sample-send-message.ts" start={2} /> */}
                <h4>Receivers</h4>
                <p>
                  If your application is a server, you can use Gofer Engine
                  to setup a listener for messages. This listener can
                  receive messages from remote endpoints and integrate
                  the parsed data into your application.
                </p>
              </div>
              {/* TODO: put some kind of CTA here? */}
              <div className='col col--6'>
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
              </div>
              <div className='col col--6'>
                <h4>Message Classes</h4>
                <p>
                  Gofer Engine supports provides a variety of tools to simplify
                  the process of building a healthcare interoperability engine
                  such as message parsing, validation, and transformation. For
                  example, parsed messages provide rich interfaces to access
                  and manipulate message data. The base of all these interfaces
                  is the <code>IMsg</code> interface.
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
