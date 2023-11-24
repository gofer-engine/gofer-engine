import JSONMsg from "@gofer-engine/json";
import { getSFTPMessages } from "./getSFTPMessages";

test('SFTP.getSFTPMessages', (done) => {
  getSFTPMessages(
    {
      host: '127.0.0.1',
      port: 2222,
      username: 'foo',
      password: 'pass',
    },
    'JSON',
    (_t, msg) => new JSONMsg(msg),
    '/upload/',
    {
      filename: 'test.json'
    }
  ).then((msgs) => {
    expect(msgs).toBeDefined();
    expect(msgs.length).toBe(1);
    const msg = msgs[0];
    expect(msg).toBeDefined();
    expect(msg.json()).toBe("true"),
    done()
  })
})