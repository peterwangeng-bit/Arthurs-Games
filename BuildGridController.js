/**
 * BuildGridController — Fortnite-style grid snapping from crosshair raycast.
 * Raycasts from screen center, snaps to a fixed grid, drives a blue ghost preview.
 */
(function (global) {
  'use strict';

  var DEFAULT_GRID_SIZE = 3;
  var GHOST_COLOR = 0x4488ff;
  var GHOST_OPACITY = 0.42;

  function snapGrid(v, gridSize) {
    return Math.round(v / gridSize) * gridSize;
  }

  function BuildGridController(options) {
    options = options || {};
    this.scene = options.scene;
    this.camera = options.camera;
    this.parentGroup = options.parentGroup || options.buildGroup || null;
    this.gridSize = options.gridSize || DEFAULT_GRID_SIZE;
    this.maxRayDistance = options.maxRayDistance || 140;
    this.getRaycastMeshes = options.getRaycastMeshes || function () { return []; };
    this.resolveSnapY = options.resolveSnapY || null;
    this.getGhostLayout = options.getGhostLayout || function () {
      return { w: this.gridSize, h: this.gridSize * 0.75, d: this.gridSize, offY: this.gridSize * 0.375, rotY: 0, rotX: 0 };
    };

    this.raycaster = new global.THREE.Raycaster();
    this.raycaster.far = this.maxRayDistance;
    this._ndc = new global.THREE.Vector2(0, 0);
    this._hitPoint = new global.THREE.Vector3();

    this.snapped = { x: 0, y: 0, z: 0 };
    this.lastHit = null;
    this.valid = false;
    this.visible = false;

    this._ghostRoot = new global.THREE.Group();
    this._ghostMesh = null;
    this._ghostMat = new global.THREE.MeshStandardMaterial({
      color: GHOST_COLOR,
      transparent: true,
      opacity: GHOST_OPACITY,
      depthWrite: false,
      roughness: 0.55,
      metalness: 0.05,
    });
    if (this.parentGroup) this.parentGroup.add(this._ghostRoot);
    this._rebuildGhostMesh();
  }

  BuildGridController.prototype.snap = function (v) {
    return snapGrid(v, this.gridSize);
  };

  BuildGridController.prototype.snapPoint = function (x, y, z) {
    return {
      x: this.snap(x),
      y: this.snap(y),
      z: this.snap(z),
    };
  };

  BuildGridController.prototype._rebuildGhostMesh = function () {
    if (this._ghostMesh) {
      this._ghostRoot.remove(this._ghostMesh);
      this._ghostMesh.geometry.dispose();
    }
    var layout = this.getGhostLayout.call(this);
    var geo = new global.THREE.BoxGeometry(layout.w, layout.h, layout.d);
    this._ghostMesh = new global.THREE.Mesh(geo, this._ghostMat);
    this._ghostMesh.position.y = layout.offY || 0;
    this._ghostMesh.rotation.y = layout.rotY || 0;
    this._ghostMesh.rotation.x = layout.rotX || 0;
    this._ghostRoot.add(this._ghostMesh);
    this._layout = layout;
  };

  BuildGridController.prototype.setGhostLayoutProvider = function (fn) {
    this.getGhostLayout = fn;
    this._rebuildGhostMesh();
  };

  /** Continuous raycast from crosshair (screen center). */
  BuildGridController.prototype.raycastFromCrosshair = function () {
    this.raycaster.setFromCamera(this._ndc, this.camera);
    var targets = this.getRaycastMeshes() || [];
    var hits = this.raycaster.intersectObjects(targets, false);
    if (!hits.length) {
      this.lastHit = null;
      return null;
    }
    this.lastHit = hits[0];
    this._hitPoint.copy(hits[0].point);
    return hits[0];
  };

  BuildGridController.prototype.update = function () {
    if (!this.visible) {
      this._ghostRoot.visible = false;
      this.valid = false;
      return this.snapped;
    }

    var hit = this.raycastFromCrosshair();
    if (!hit) {
      this.valid = false;
      this._ghostRoot.visible = false;
      return this.snapped;
    }

    var sx = this.snap(hit.point.x);
    var sz = this.snap(hit.point.z);
    var sy = this.snap(hit.point.y);
    if (this.resolveSnapY) {
      var resolved = this.resolveSnapY(hit, sx, sz, sy, this);
      if (resolved && typeof resolved === 'object') {
        if (resolved.x !== undefined) sx = resolved.x;
        if (resolved.y !== undefined) sy = resolved.y;
        if (resolved.z !== undefined) sz = resolved.z;
      } else if (typeof resolved === 'number') {
        sy = resolved;
      }
    }

    this.snapped.x = sx;
    this.snapped.y = sy;
    this.snapped.z = sz;
    this.valid = true;

    this._ghostRoot.visible = true;
    this._ghostRoot.position.set(sx, sy, sz);
    if (this._ghostMesh && this.getGhostLayout) {
      var layout = this.getGhostLayout.call(this);
      this._ghostMesh.position.y = layout.offY || 0;
      this._ghostMesh.rotation.y = layout.rotY || 0;
      this._ghostMesh.rotation.x = layout.rotX || 0;
    }
    return this.snapped;
  };

  BuildGridController.prototype.show = function () {
    this.visible = true;
    this._rebuildGhostMesh();
    this.update();
  };

  BuildGridController.prototype.hide = function () {
    this.visible = false;
    this.valid = false;
    this._ghostRoot.visible = false;
  };

  BuildGridController.prototype.dispose = function () {
    this.hide();
    if (this._ghostMesh) this._ghostMesh.geometry.dispose();
    this._ghostMat.dispose();
    if (this.parentGroup) this.parentGroup.remove(this._ghostRoot);
  };

  BuildGridController.GRID_SIZE = DEFAULT_GRID_SIZE;
  BuildGridController.snapGrid = snapGrid;
  BuildGridController.cellKey = function (x, y, z, gridSize) {
    gridSize = gridSize || DEFAULT_GRID_SIZE;
    return snapGrid(x, gridSize) + ',' + snapGrid(y, gridSize) + ',' + snapGrid(z, gridSize);
  };

  global.BuildGridController = BuildGridController;
})(typeof window !== 'undefined' ? window : this);
