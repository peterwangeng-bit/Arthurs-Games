/**
 * BlockSpawner — places permanent grid blocks on left-click in build mode.
 * Prevents duplicates at the same snapped cell; registers colliders via callbacks.
 */
(function (global) {
  'use strict';

  function BlockSpawner(options) {
    options = options || {};
    this.gridController = options.gridController;
    this.gridSize = options.gridSize || (global.BuildGridController && global.BuildGridController.GRID_SIZE) || 3;
    this.isBuildMode = options.isBuildMode || function () { return false; };
    this.canPlace = options.canPlace || function () { return true; };
    this.isOccupied = options.isOccupied || null;
    this.onSpawn = options.onSpawn || null;
    this.onRejected = options.onRejected || null;
    this.cooldownSec = options.cooldownSec || 0.32;
    this._cooldown = 0;
    this._occupied = options.occupiedSet || new Set();
  }

  BlockSpawner.prototype.cellKey = function (x, y, z) {
    if (global.BuildGridController && global.BuildGridController.cellKey) {
      return global.BuildGridController.cellKey(x, y, z, this.gridSize);
    }
    var g = this.gridSize;
    var s = function (v) { return Math.round(v / g) * g; };
    return s(x) + ',' + s(y) + ',' + s(z);
  };

  BlockSpawner.prototype.markOccupied = function (x, y, z) {
    this._occupied.add(this.cellKey(x, y, z));
  };

  BlockSpawner.prototype.clearOccupied = function (x, y, z) {
    this._occupied.delete(this.cellKey(x, y, z));
  };

  BlockSpawner.prototype.clearAllOccupied = function () {
    this._occupied.clear();
  };

  BlockSpawner.prototype.hasBlockAt = function (x, y, z) {
    var key = this.cellKey(x, y, z);
    if (this._occupied.has(key)) return true;
    if (this.isOccupied) return this.isOccupied(x, y, z, key);
    return false;
  };

  BlockSpawner.prototype.tick = function (dt) {
    if (this._cooldown > 0) this._cooldown -= dt;
  };

  /**
   * Try to spawn at the ghost's current snapped position.
   * @returns {*} spawn result from onSpawn, or null
   */
  BlockSpawner.prototype.trySpawn = function () {
    if (!this.isBuildMode()) return null;
    if (this._cooldown > 0) return null;
    if (!this.gridController || !this.gridController.valid) return null;
    if (!this.canPlace()) return null;

    var s = this.gridController.snapped;
    if (this.hasBlockAt(s.x, s.y, s.z)) {
      if (this.onRejected) this.onRejected('occupied', s);
      return null;
    }

    if (!this.onSpawn) return null;
    var result = this.onSpawn(s, this.gridController.lastHit);
    if (result) {
      this._cooldown = this.cooldownSec;
    }
    return result;
  };

  /** Wire to canvas mousedown (button 0 = left click). */
  BlockSpawner.prototype.handlePointerDown = function (event) {
    if (!event || event.button !== 0) return null;
    return this.trySpawn();
  };

  BlockSpawner.prototype.bindCanvas = function (canvas) {
    var self = this;
    if (!canvas) return;
    if (this._boundCanvas === canvas) return;
    this.unbindCanvas();
    this._boundCanvas = canvas;
    this._onDown = function (e) {
      if (self.isBuildMode()) self.handlePointerDown(e);
    };
    canvas.addEventListener('mousedown', this._onDown);
  };

  BlockSpawner.prototype.unbindCanvas = function () {
    if (this._boundCanvas && this._onDown) {
      this._boundCanvas.removeEventListener('mousedown', this._onDown);
    }
    this._boundCanvas = null;
    this._onDown = null;
  };

  global.BlockSpawner = BlockSpawner;
})(typeof window !== 'undefined' ? window : this);
