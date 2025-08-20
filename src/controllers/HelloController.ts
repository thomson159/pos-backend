import { Route, Controller, Get } from 'tsoa';

@Route('hello')
export class HelloController extends Controller {
  @Get('/')
  public async getHello(): Promise<{ message: string }> {
    return { message: 'Hello from TSOA!' };
  }
}
