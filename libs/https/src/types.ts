import { IHTTPConfig } from "@gofer-engine/http";
import { AllowFuncProp } from "@gofer-engine/message-type";

export interface IHTTPSConfig<Functional extends boolean = false>
  extends IHTTPConfig<Functional> {
  // props for cert/ssl support from tls.connect
  ca?: AllowFuncProp<Functional, string | string[] | Buffer | Buffer[]>;
  cert?: AllowFuncProp<Functional, string | string[] | Buffer | Buffer[]>;
  ciphers?: AllowFuncProp<Functional, string>;
  clientCertEngine?: AllowFuncProp<Functional, string>;
  crl?: AllowFuncProp<Functional, string | string[] | Buffer | Buffer[]>;
  dhparam?: AllowFuncProp<Functional, string | Buffer>;
  ecdhCurve?: AllowFuncProp<Functional, string>;
  honorCipherOrder?: AllowFuncProp<Functional, boolean>;
  key?: AllowFuncProp<Functional, string | string[] | Buffer | Buffer[]>;
  passphrase?: AllowFuncProp<Functional, string>;
  pfx?: AllowFuncProp<
    Functional,
    | string
    | string[]
    | Buffer
    | Buffer[]
    | { buf: string | Buffer; passphrase?: string }[]
  >;
  secureOptions?: AllowFuncProp<Functional, number>;
  secureProtocol?: AllowFuncProp<Functional, string>;
  sessionIdContext?: AllowFuncProp<Functional, string>;
  rejectUnauthorized?: AllowFuncProp<Functional, boolean>;
  severname?: AllowFuncProp<Functional, string>;
}

export type HTTPSConfig<T extends 'I' | 'O' = 'I'> = T extends 'I'
  ? IHTTPSConfig
  : IHTTPSConfig<true> & {
      responseTimeout?: number | false;
    };
