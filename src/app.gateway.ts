import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

type PaintProps = {
  x: number;
  y: number;
  mx: number;
  my: number;
};

@WebSocketGateway({ cors: true })
export class AppGateway {
  @WebSocketServer()
  server: Server;
  @SubscribeMessage('paint')
  async painting(
    @MessageBody() data: PaintProps,
    @ConnectedSocket() socket: Socket,
  ) {
    const sockets = await this.server.fetchSockets();
    sockets.forEach((soc) => {
      if (soc.id !== socket.id) {
        socket.broadcast.to('test').emit('repaint', data);
      }
    });
  }

  @SubscribeMessage('clear')
  async clear(@ConnectedSocket() socket: Socket) {
    const sockets = await this.server.fetchSockets();
    sockets.forEach((soc) => {
      if (soc.id !== socket.id) socket.broadcast.emit('clear_canvas');
    });
  }

  @SubscribeMessage('send_message')
  async sendMessage(
    @MessageBody() data: string,
    @ConnectedSocket() socket: Socket,
  ) {
    const sockets = await this.server.fetchSockets();
    sockets.forEach((soc) => {
      if (soc.id !== socket.id) {
        console.log(data);

        socket.broadcast.to('test').emit('receive_message', data);
      }
    });
  }

  handleConnection(socket: Socket) {
    socket.join('test');
    // console.log('CONNECTED', socket.id);
  }
}
