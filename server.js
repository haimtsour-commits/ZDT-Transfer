const http = require('http');
const { Server } = require('socket.io');

// 1. יצירת שרת HTTP בסיסי שיודע לענות גם לבקשות רגילות (Health Check)
const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('ZDT Signaling Server is Online and Healthy.\n');
    }
});

// 2. הלבשת שרת ה-WebSockets על גבי שרת ה-HTTP
const io = new Server(server, {
    cors: {
        origin: "*", // בשלב הייצור (Production) נשנה את זה רק לדומיין של דף הנחיתה שלך
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('🔗 Client connected:', socket.id);

    // ניהול חדרים
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`📁 User ${socket.id} joined room: ${roomId}`);
        socket.to(roomId).emit('user-connected', socket.id);
    });

    // ניתוב אותות (Signaling) בצורה עיוורת לחלוטין
    socket.on('signal', (data) => {
        socket.to(data.roomId).emit('signal', {
            signal: data.signal,
            sender: socket.id
        });
    });

    socket.on('disconnect', () => {
        console.log('❌ Client disconnected:', socket.id);
    });
});

// 3. האזנה לפורט דינאמי של הענן או 3000 כמקדם ביטחון
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🛡️ ZDT Server locked and loaded on port ${PORT}...`);
});
