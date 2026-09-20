/**
 * Depth Strike — shared lobby + game host
 * Run: npm start
 * Open the printed URL on every PC — everyone auto-joins the same lobby.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const HTTP_PORT = parseInt(process.env.HTTP_PORT || '8080', 10);
const WS_PORT = parseInt(process.env.PORT || '8787', 10);
const ROOT = __dirname;
const COLORS = [0x5599ff, 0xff66aa, 0x44ffaa, 0xffaa44, 0xcc88ff, 0x66ffcc, 0xff8844, 0x88ddff];
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const clients = new Map();

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function sanitizeName(name) {
  return (
    String(name || 'Guest')
      .replace(/[^\w\s\-'.]/gi, '')
      .trim()
      .slice(0, 14) || 'Guest'
  );
}

function playerList() {
  const list = [];
  clients.forEach(function (c, id) {
    list.push({
      id: id,
      name: c.name,
      color: c.color,
      x: c.x,
      z: c.z,
      y: c.y,
      yaw: c.yaw,
      mode: c.mode,
    });
  });
  return list;
}

function broadcast(json, exceptId) {
  const data = JSON.stringify(json);
  clients.forEach(function (c, id) {
    if (id !== exceptId && c.ws.readyState === WebSocket.OPEN) {
      c.ws.send(data);
    }
  });
}

function broadcastCount() {
  broadcast({ type: 'lobby_count', count: clients.size });
}

function safeFilePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  let rel = path.normalize(decoded).replace(/^(\.\.[/\\])+/, '');
  if (rel.startsWith('/') || rel.startsWith('\\')) rel = rel.slice(1);
  if (!rel || rel === '.') rel = 'index.html';
  const filePath = path.join(ROOT, rel);
  if (!filePath.startsWith(ROOT)) return null;
  return filePath;
}

function serveStatic(req, res) {
  let urlPath = req.url || '/';
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = safeFilePath(urlPath);
  if (!filePath) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  fs.stat(filePath, function (err, stat) {
    if (err || !stat.isFile()) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });
}

http.createServer(serveStatic).listen(HTTP_PORT, '0.0.0.0');

const wss = new WebSocket.Server({ port: WS_PORT, host: '0.0.0.0' });

wss.on('connection', function (ws) {
  let id = null;

  ws.on('message', function (raw) {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch (e) {
      return;
    }

    if (msg.type === 'join' && !id) {
      id = makeId();
      const color = COLORS[clients.size % COLORS.length];
      clients.set(id, {
        ws: ws,
        name: sanitizeName(msg.name),
        color: color,
        x: 0,
        z: 0,
        y: 1.65,
        yaw: 0,
        mode: 'lobby',
      });
      ws.send(
        JSON.stringify({
          type: 'welcome',
          id: id,
          players: playerList(),
          count: clients.size,
        })
      );
      broadcast(
        {
          type: 'player_join',
          player: {
            id: id,
            name: clients.get(id).name,
            color: color,
            x: 0,
            z: 0,
            y: 1.65,
            yaw: 0,
            mode: 'lobby',
          },
        },
        id
      );
      broadcastCount();
      return;
    }

    if (msg.type === 'state' && id) {
      const c = clients.get(id);
      if (!c) return;
      if (typeof msg.x === 'number') c.x = msg.x;
      if (typeof msg.z === 'number') c.z = msg.z;
      if (typeof msg.y === 'number') c.y = msg.y;
      if (typeof msg.yaw === 'number') c.yaw = msg.yaw;
      if (msg.mode === 'lobby' || msg.mode === 'arena') c.mode = msg.mode;
      if (c.mode === 'lobby') {
        broadcast(
          {
            type: 'player_state',
            id: id,
            x: c.x,
            z: c.z,
            y: c.y,
            yaw: c.yaw,
            mode: c.mode,
          },
          id
        );
      } else {
        broadcast({ type: 'player_state', id: id, mode: 'arena' }, id);
      }
    }
  });

  ws.on('close', function () {
    if (!id) return;
    clients.delete(id);
    broadcast({ type: 'player_leave', id: id });
    broadcastCount();
  });
});

console.log('');
console.log('Depth Strike — shared lobby');
console.log('  This PC:  http://localhost:' + HTTP_PORT);
console.log('  Friends:  http://<this-computer-ip>:' + HTTP_PORT);
console.log('Everyone who opens that link joins the same lobby automatically.');
console.log('');
