// Trigger reload to load updated prisma schema for MentorshipMessage
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import path from 'path';
import authRoutes from './backend/routes/authRoutes';
import testRoutes from './backend/routes/testRoutes';
import studentRoutes from './backend/routes/studentRoutes';
import teacherRoutes from './backend/routes/teacherRoutes';
import mlRoutes from './backend/routes/mlRoutes';
import interventionRoutes from './backend/routes/interventionRoutes';
import adminRoutes from './backend/routes/adminRoutes';
import assignmentRoutes from './backend/routes/assignmentRoutes';

// Add BigInt serialization support for Prisma queryRaw results
BigInt.prototype.toJSON = function () {
    return this.toString();
};

async function startServer() {
    const app = express();
    const httpServer = createServer(app);
    const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

    const io = new Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    app.set('io', io);

    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }
        jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
            if (err) return next(new Error('Authentication error'));
            socket.data.user = decoded;
            next();
        });
    });

    io.on('connection', (socket) => {
        socket.on('join_chat', (student_id) => {
            socket.join(`mentorship_${student_id}`);
        });
    });

    app.use(cors());
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));
    app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));


    // 1. Mount Backend APIs (hot-reloaded for Prisma update)
    app.use('/api/auth', authRoutes);
    app.use('/api/test', testRoutes);
    app.use('/api/student', studentRoutes);
    app.use('/api/teacher', teacherRoutes);
    app.use('/api/ml', mlRoutes);
    app.use('/api/interventions', interventionRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/assignments', assignmentRoutes);

    // 2. Mount Static files (only in production)
    if (process.env.NODE_ENV === 'production') {
        const distPath = path.resolve('dist');
        app.use(express.static(distPath));
        app.use((req, res) => {
            res.sendFile(path.join(distPath, 'index.html'));
        });
    }

    httpServer.listen(PORT, '0.0.0.0', () => {
        console.log(`MUSE Server running at http://localhost:${PORT}`);
    });
}

startServer();
