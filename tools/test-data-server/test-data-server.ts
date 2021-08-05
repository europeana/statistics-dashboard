import { createServer, IncomingMessage, ServerResponse } from 'http';

export abstract class TestDataServer {
  abstract serverName: string;

  constructor(port = 3000) {
    createServer((request: IncomingMessage, response: ServerResponse): void => {
      this.headerAccess(response);
      this.handleRequest(request, response);
    }).listen(port, () => {
      console.log(`test server "${this.serverName}" is listening on ${port}`);
    });
  }

  get404(): string {
    return '<h2>404</h2>';
  }

  headerAccess(response: ServerResponse): void {
    response.setHeader('Access-Control-Allow-Origin', '*');
  }

  headerJSON(response: ServerResponse): void {
    response.setHeader('Content-Type', 'application/json;charset=UTF-8');
  }

  headerText(response: ServerResponse): void {
    response.setHeader('Content-Type', 'text/html;charset=UTF-8');
  }

  handleOptions(response: ServerResponse){
    response.setHeader(
      'Access-Control-Allow-Headers',
      'authorization,X-Requested-With,content-type'
    );
    response.setHeader(
      'Access-Control-Allow-Methods',
      'GET,HEAD,POST,PUT,DELETE,OPTIONS'
    );
    response.setHeader('Access-Control-Max-Age', '1800');
    response.setHeader(
      'Allow',
      'GET, HEAD, POST, PUT, DELETE, TRACE, OPTIONS, PATCH'
    );
    response.setHeader('Connection', 'Keep-Alive');
    response.end();
  }

  abstract handleRequest(request: IncomingMessage, response: ServerResponse): void;
}
