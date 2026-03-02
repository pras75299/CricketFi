import { Server as NetServer } from 'http';
import { NextApiRequest } from 'next';
import { Server as ServerIO } from 'socket.io';
import { NextApiResponse } from 'next';

export type NextApiResponseServerIO = NextApiResponse & {
    socket: {
        server: NetServer & {
            io: ServerIO;
        };
    };
};

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function ioHandler(
    req: NextApiRequest,
    res: NextApiResponseServerIO
) {
    if (!res.socket.server.io) {
        const path = '/api/socket/io';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const httpServer: NetServer = res.socket.server as any;
        const io = new ServerIO(httpServer, {
            path: path,
            addTrailingSlash: false,
        });

        io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);

            socket.on('subscribe', (data) => {
                const { match_id } = data;
                if (match_id) {
                    socket.join(`match_${match_id}`);
                    console.log(`Socket ${socket.id} subscribed to match_${match_id}`);
                }
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });

        res.socket.server.io = io;
    }
    res.end();
}
