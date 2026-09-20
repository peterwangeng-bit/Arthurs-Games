(function (global) {
  var COLORS = [0x5599ff, 0xff66aa, 0x44ffaa, 0xffaa44, 0xcc88ff, 0x66ffcc, 0xff8844, 0x88ddff];
  var PEER_OPTS = { host: '0.peerjs.com', secure: true, port: 443, path: '/' };
  var RELAY_ID = 'arthur-depth-strike-lobby-v2';

  function sanitizeName(name) {
    return (
      String(name || 'Guest')
        .replace(/[^\w\s\-'.]/gi, '')
        .trim()
        .slice(0, 14) || 'Guest'
    );
  }

  function makeId() {
    return Math.random().toString(36).slice(2, 10);
  }

  function makePlayer(id, name, colorIdx) {
    return {
      id: id,
      name: sanitizeName(name),
      color: COLORS[colorIdx % COLORS.length],
      x: 0,
      z: 0,
      y: 1.65,
      yaw: 0,
      mode: 'lobby',
    };
  }

  function DepthStrikeLocalNet(handlers) {
    this.handlers = handlers || {};
    this.id = null;
    this.connected = false;
    this.channel = null;
    this.players = {};
  }

  DepthStrikeLocalNet.prototype.setStatus = function (status, detail) {
    if (this.handlers.onStatus) this.handlers.onStatus(status, detail);
  };

  DepthStrikeLocalNet.prototype.playerCount = function () {
    var n = 0;
    for (var k in this.players) {
      if (this.players.hasOwnProperty(k)) n++;
    }
    return n;
  };

  DepthStrikeLocalNet.prototype.playerList = function () {
    var list = [];
    for (var id in this.players) {
      if (this.players.hasOwnProperty(id)) list.push(this.players[id]);
    }
    return list;
  };

  DepthStrikeLocalNet.prototype.post = function (msg) {
    if (this.channel) this.channel.postMessage(msg);
  };

  DepthStrikeLocalNet.prototype.onMessage = function (msg) {
    if (!msg || !msg.type) return;
    if (msg.type === 'hello' && msg.player && msg.player.id !== this.id) {
      this.players[msg.player.id] = msg.player;
      this.post({ type: 'welcome', player: this.players[this.id] });
      if (this.handlers.onPlayerJoin) this.handlers.onPlayerJoin(msg.player);
      this.setStatus('online', this.playerCount());
      if (this.handlers.onCount) this.handlers.onCount(this.playerCount());
    } else if (msg.type === 'welcome' && msg.player && msg.player.id !== this.id) {
      if (!this.players[msg.player.id]) {
        this.players[msg.player.id] = msg.player;
        if (this.handlers.onPlayerJoin) this.handlers.onPlayerJoin(msg.player);
        this.setStatus('online', this.playerCount());
        if (this.handlers.onCount) this.handlers.onCount(this.playerCount());
      }
    } else if (msg.type === 'bye' && msg.id && msg.id !== this.id) {
      if (this.players[msg.id]) {
        delete this.players[msg.id];
        if (this.handlers.onPlayerLeave) this.handlers.onPlayerLeave(msg.id);
        this.setStatus('online', this.playerCount());
        if (this.handlers.onCount) this.handlers.onCount(this.playerCount());
      }
    } else if (msg.type === 'state' && msg.id && msg.id !== this.id && this.players[msg.id]) {
      var p = this.players[msg.id];
      if (typeof msg.x === 'number') p.x = msg.x;
      if (typeof msg.z === 'number') p.z = msg.z;
      if (typeof msg.y === 'number') p.y = msg.y;
      if (typeof msg.yaw === 'number') p.yaw = msg.yaw;
      if (msg.mode === 'lobby' || msg.mode === 'arena') p.mode = msg.mode;
      if (this.handlers.onPlayerState) this.handlers.onPlayerState(msg.id, msg);
    }
  };

  DepthStrikeLocalNet.prototype.connect = function (url, name) {
    var self = this;
    this.disconnect(false);
    if (typeof BroadcastChannel === 'undefined') {
      this.setStatus('error', 'Could not join lobby');
      return;
    }
    this.id = 'L' + makeId();
    this.channel = new BroadcastChannel('depthStrikeSharedLobby');
    this.channel.onmessage = function (ev) {
      self.onMessage(ev.data);
    };
    this.connected = true;
    this.players[this.id] = makePlayer(this.id, name, this.playerCount());
    this.post({ type: 'hello', player: this.players[this.id] });
    this.setStatus('online', this.playerCount());
    if (this.handlers.onSnapshot) {
      this.handlers.onSnapshot(this.playerList(), this.id);
    }
  };

  DepthStrikeLocalNet.prototype.sendState = function (state) {
    if (!this.connected || !this.id) return;
    var p = this.players[this.id];
    if (!p) return;
    if (typeof state.x === 'number') p.x = state.x;
    if (typeof state.z === 'number') p.z = state.z;
    if (typeof state.y === 'number') p.y = state.y;
    if (typeof state.yaw === 'number') p.yaw = state.yaw;
    if (state.mode === 'lobby' || state.mode === 'arena') p.mode = state.mode;
    this.post({
      type: 'state',
      id: this.id,
      x: p.x,
      z: p.z,
      y: p.y,
      yaw: p.yaw,
      mode: p.mode,
    });
  };

  DepthStrikeLocalNet.prototype.disconnect = function (notify) {
    if (this.id) this.post({ type: 'bye', id: this.id });
    if (this.channel) {
      try {
        this.channel.close();
      } catch (e) {}
      this.channel = null;
    }
    this.connected = false;
    this.id = null;
    this.players = {};
    if (notify !== false) this.setStatus('offline');
    if (this.handlers.onDisconnect) this.handlers.onDisconnect();
  };

  function DepthStrikePeerNet(handlers) {
    this.handlers = handlers || {};
    this.id = null;
    this.connected = false;
    this.mode = null;
    this.peer = null;
    this.relayConn = null;
    this.clients = {};
    this.pendingName = 'Guest';
    this.fallbackFn = null;
    this.connectTimer = null;
    this.retried = false;
  }

  DepthStrikePeerNet.prototype.setStatus = function (status, detail) {
    if (this.handlers.onStatus) this.handlers.onStatus(status, detail);
  };

  DepthStrikePeerNet.prototype.clearTimer = function () {
    if (this.connectTimer) {
      clearTimeout(this.connectTimer);
      this.connectTimer = null;
    }
  };

  DepthStrikePeerNet.prototype.cleanupPeer = function () {
    this.clearTimer();
    if (this.relayConn) {
      try {
        this.relayConn.close();
      } catch (e) {}
      this.relayConn = null;
    }
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch (e2) {}
      this.peer = null;
    }
    this.clients = {};
    this.mode = null;
  };

  DepthStrikePeerNet.prototype.playerList = function () {
    var list = [];
    for (var id in this.clients) {
      if (this.clients.hasOwnProperty(id)) list.push(this.clients[id].data);
    }
    return list;
  };

  DepthStrikePeerNet.prototype.playerCount = function () {
    var n = 0;
    for (var k in this.clients) {
      if (this.clients.hasOwnProperty(k)) n++;
    }
    return n;
  };

  DepthStrikePeerNet.prototype.broadcast = function (json, exceptId) {
    for (var id in this.clients) {
      if (!this.clients.hasOwnProperty(id)) continue;
      if (id === exceptId) continue;
      var c = this.clients[id].conn;
      if (c && c.open) c.send(json);
    }
  };

  DepthStrikePeerNet.prototype.handleClientMsg = function (msg) {
    if (!msg || !msg.type) return;
    if (msg.type === 'welcome') {
      this.id = msg.id;
      this.connected = true;
      this.setStatus('online', msg.count);
      if (this.handlers.onSnapshot) this.handlers.onSnapshot(msg.players || [], this.id);
    } else if (msg.type === 'player_join') {
      if (this.handlers.onPlayerJoin) this.handlers.onPlayerJoin(msg.player);
      if (this.handlers.onCount) this.handlers.onCount(msg.count);
      this.setStatus('online', msg.count);
    } else if (msg.type === 'player_leave') {
      if (this.handlers.onPlayerLeave) this.handlers.onPlayerLeave(msg.id);
      if (this.handlers.onCount) this.handlers.onCount(msg.count);
      this.setStatus('online', msg.count);
    } else if (msg.type === 'player_state') {
      if (this.handlers.onPlayerState) this.handlers.onPlayerState(msg.id, msg);
    } else if (msg.type === 'lobby_count') {
      this.setStatus('online', msg.count);
      if (this.handlers.onCount) this.handlers.onCount(msg.count);
    }
  };

  DepthStrikePeerNet.prototype.wireClientConn = function (conn) {
    var self = this;
    conn.on('data', function (data) {
      self.handleClientMsg(data);
    });
    conn.on('close', function () {
      if (self.connected) {
        self.connected = false;
        self.id = null;
        self.cleanupPeer();
        self.setStatus('offline');
        if (self.handlers.onDisconnect) self.handlers.onDisconnect();
        self.scheduleReconnect();
      }
    });
  };

  DepthStrikePeerNet.prototype.wireRelayConn = function (conn) {
    var self = this;
    var playerId = null;
    conn.on('data', function (data) {
      if (!data || !data.type) return;
      if (data.type === 'join' && !playerId) {
        playerId = makeId();
        var player = makePlayer(playerId, data.name, self.playerCount());
        self.clients[playerId] = { conn: conn, data: player };
        conn.send({
          type: 'welcome',
          id: playerId,
          players: self.playerList(),
          count: self.playerCount(),
        });
        self.broadcast(
          { type: 'player_join', player: player, count: self.playerCount() },
          playerId
        );
        self.broadcast({ type: 'lobby_count', count: self.playerCount() }, playerId);
      } else if (data.type === 'state' && playerId && self.clients[playerId]) {
        var c = self.clients[playerId].data;
        if (typeof data.x === 'number') c.x = data.x;
        if (typeof data.z === 'number') c.z = data.z;
        if (typeof data.y === 'number') c.y = data.y;
        if (typeof data.yaw === 'number') c.yaw = data.yaw;
        if (data.mode === 'lobby' || data.mode === 'arena') c.mode = data.mode;
        if (c.mode === 'lobby') {
          self.broadcast(
            {
              type: 'player_state',
              id: playerId,
              x: c.x,
              z: c.z,
              y: c.y,
              yaw: c.yaw,
              mode: c.mode,
            },
            playerId
          );
        } else {
          self.broadcast({ type: 'player_state', id: playerId, mode: 'arena' }, playerId);
        }
      }
    });
    conn.on('close', function () {
      if (!playerId) return;
      delete self.clients[playerId];
      self.broadcast({ type: 'player_leave', id: playerId });
      self.broadcast({ type: 'lobby_count', count: self.playerCount() });
      if (self.mode === 'relay' && self.id === playerId) {
        self.connected = false;
        self.id = null;
        self.setStatus('offline');
      }
    });
  };

  DepthStrikePeerNet.prototype.startRelayHost = function () {
    var self = this;
    this.mode = 'relay';
    this.peer = new Peer(RELAY_ID, PEER_OPTS);
    this.peer.on('error', function (err) {
      self.cleanupPeer();
      if (!self.retried && (err.type === 'unavailable-id' || err.type === 'network')) {
        self.retried = true;
        setTimeout(function () {
          self.tryAsClient();
        }, 1200);
      } else {
        self.useFallback();
      }
    });
    this.peer.on('open', function () {
      self.id = makeId();
      self.connected = true;
      self.clients[self.id] = {
        conn: null,
        data: makePlayer(self.id, self.pendingName, 0),
      };
      self.peer.on('connection', function (conn) {
        self.wireRelayConn(conn);
      });
      self.setStatus('online', self.playerCount());
      if (self.handlers.onSnapshot) {
        self.handlers.onSnapshot(self.playerList(), self.id);
      }
    });
  };

  DepthStrikePeerNet.prototype.tryAsClient = function () {
    var self = this;
    if (typeof Peer === 'undefined') {
      this.useFallback();
      return;
    }
    this.cleanupPeer();
    this.mode = 'client';
    this.peer = new Peer(undefined, PEER_OPTS);
    this.peer.on('error', function () {
      self.cleanupPeer();
      self.startRelayHost();
    });
    this.peer.on('open', function () {
      var conn = self.peer.connect(RELAY_ID, { reliable: true, serialization: 'json' });
      var opened = false;
      self.connectTimer = setTimeout(function () {
        if (!opened) {
          try {
            conn.close();
          } catch (e) {}
          self.cleanupPeer();
          self.startRelayHost();
        }
      }, 2800);
      conn.on('open', function () {
        opened = true;
        self.clearTimer();
        self.relayConn = conn;
        conn.send({ type: 'join', name: self.pendingName });
        self.wireClientConn(conn);
      });
      conn.on('error', function () {
        if (!opened) {
          self.clearTimer();
          self.cleanupPeer();
          self.startRelayHost();
        }
      });
    });
  };

  DepthStrikePeerNet.prototype.useFallback = function () {
    this.cleanupPeer();
    this.connected = false;
    this.id = null;
    if (this.fallbackFn) {
      this.fallbackFn();
    } else {
      this.setStatus('error', 'Could not join lobby');
    }
  };

  DepthStrikePeerNet.prototype.scheduleReconnect = function () {
    var self = this;
    setTimeout(function () {
      if (!self.connected) self.connect('', self.pendingName, self.fallbackFn);
    }, 3000);
  };

  DepthStrikePeerNet.prototype.connect = function (url, name, fallbackFn) {
    this.disconnect(false);
    this.pendingName = name || 'Guest';
    this.fallbackFn = fallbackFn || null;
    this.retried = false;
    this.setStatus('connecting');
    this.tryAsClient();
  };

  DepthStrikePeerNet.prototype.sendState = function (state) {
    if (!this.connected || !this.id) return;
    if (this.mode === 'client' && this.relayConn && this.relayConn.open) {
      this.relayConn.send({
        type: 'state',
        x: state.x,
        z: state.z,
        y: state.y,
        yaw: state.yaw,
        mode: state.mode,
      });
      return;
    }
    if (this.mode === 'relay' && this.clients[this.id]) {
      var c = this.clients[this.id].data;
      if (typeof state.x === 'number') c.x = state.x;
      if (typeof state.z === 'number') c.z = state.z;
      if (typeof state.y === 'number') c.y = state.y;
      if (typeof state.yaw === 'number') c.yaw = state.yaw;
      if (state.mode === 'lobby' || state.mode === 'arena') c.mode = state.mode;
      if (c.mode === 'lobby') {
        this.broadcast(
          {
            type: 'player_state',
            id: this.id,
            x: c.x,
            z: c.z,
            y: c.y,
            yaw: c.yaw,
            mode: c.mode,
          },
          this.id
        );
      } else {
        this.broadcast({ type: 'player_state', id: this.id, mode: 'arena' }, this.id);
      }
    }
  };

  DepthStrikePeerNet.prototype.disconnect = function (notify) {
    this.cleanupPeer();
    this.connected = false;
    this.id = null;
    if (notify !== false) this.setStatus('offline');
    if (this.handlers.onDisconnect) this.handlers.onDisconnect();
  };

  global.DepthStrikeLocalNet = DepthStrikeLocalNet;
  global.DepthStrikePeerNet = DepthStrikePeerNet;
})(window);
