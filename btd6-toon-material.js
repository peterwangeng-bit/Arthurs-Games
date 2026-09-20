/**
 * BTD6 Toon / Cell Shader Material
 *
 * Compact cel style for Monkeys, Bloons, and Maps:
 *   - Strict 3-band shading: Shadow 0.2 / Midtone 0.6 / Highlight 1.0
 *   - Screen-space silhouette outline (thickness 0.02)
 *   - Vibrancy multiply (default color * 1.45)
 *   - Optional rubbery specular for Bloons
 *
 * Requires: three.js → exposes window.BTD6Toon
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(typeof THREE !== 'undefined' ? THREE : require('three'));
  } else {
    root.BTD6Toon = factory(root.THREE);
  }
})(typeof self !== 'undefined' ? self : this, function (THREE) {
  'use strict';

  if (!THREE) {
    throw new Error('btd6-toon-material.js requires THREE (three.js) to be loaded first');
  }

  var BAND_SHADOW = 0.28;
  var BAND_MID = 0.7;
  var BAND_HIGH = 1.05;
  var THRESH_LO = 0.33;
  var THRESH_HI = 0.66;
  var DEFAULT_VIBRANCY = 1.55;
  var DEFAULT_OUTLINE = 0.038;

  var TOON_VERTEX = /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  var TOON_FRAGMENT = /* glsl */ `
    uniform vec3 color;
    uniform sampler2D map;
    uniform bool useMap;
    uniform float emissiveVibrancy;
    uniform vec3 lightDirection;
    uniform vec3 ambientColor;
    uniform float bandHighlight;
    uniform float bandMidtone;
    uniform float bandShadow;
    uniform float thresholdHi;
    uniform float thresholdLo;
    uniform float glossStrength;
    uniform float glossPower;

    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;

    void main() {
      vec3 N = normalize(vNormal);
      vec3 L = normalize(lightDirection);
      vec3 V = normalize(vViewPosition);

      /* Strict 3-band cel: Shadow 0.2 / Midtone 0.6 / Highlight 1.0 */
      float ndl = max(dot(N, L), 0.0);
      float shade;
      if (ndl > thresholdHi) {
        shade = bandHighlight;
      } else if (ndl > thresholdLo) {
        shade = bandMidtone;
      } else {
        shade = bandShadow;
      }

      vec3 texColor = color;
      if (useMap) {
        vec4 texel = texture2D(map, vUv);
        texColor *= texel.rgb;
      }

      /* Ultra-high saturation: color * vibrancy (default 1.45) */
      vec3 lit = texColor * emissiveVibrancy * shade;
      lit += ambientColor * texColor * 0.48;

      /* Optional rubbery gloss (bloons): low-roughness specular punch */
      if (glossStrength > 0.001) {
        vec3 H = normalize(L + V);
        float spec = pow(max(dot(N, H), 0.0), glossPower);
        lit += vec3(1.0) * spec * glossStrength;
      }

      gl_FragColor = vec4(lit, 1.0);
    }
  `;

  var OUTLINE_VERTEX = /* glsl */ `
    uniform float outlineThickness;

    void main() {
      vec4 clipPos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      vec3 clipNormal = normalize((projectionMatrix * modelViewMatrix * vec4(normal, 0.0)).xyz);
      clipPos.xy += clipNormal.xy * outlineThickness * clipPos.w;
      gl_Position = clipPos;
    }
  `;

  var OUTLINE_FRAGMENT = /* glsl */ `
    uniform vec3 outlineColor;

    void main() {
      gl_FragColor = vec4(outlineColor, 1.0);
    }
  `;

  function toColor(c) {
    if (c && c.isColor) return c.clone();
    return new THREE.Color(c != null ? c : 0xffffff);
  }

  /**
   * @param {object} [opts]
   * @param {number} [opts.emissiveVibrancy=1.45]
   * @param {number} [opts.bandShadow=0.2]
   * @param {number} [opts.bandMidtone=0.6]
   * @param {number} [opts.bandHighlight=1.0]
   * @param {number} [opts.glossStrength=0]  >0 for shiny bloons
   * @param {number} [opts.glossPower=48]    high = tight arcade highlight
   */
  function createBTD6ToonMaterial(opts) {
    opts = opts || {};
    var map = opts.map || null;
    var lightDir = opts.lightDirection
      ? opts.lightDirection.clone().normalize()
      : new THREE.Vector3(0.45, 0.9, 0.35).normalize();

    var mat = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: toColor(opts.color) },
        map: { value: map },
        useMap: { value: !!map },
        emissiveVibrancy: {
          value: opts.emissiveVibrancy != null ? opts.emissiveVibrancy : DEFAULT_VIBRANCY,
        },
        lightDirection: { value: lightDir },
        ambientColor: {
          value: toColor(opts.ambientColor != null ? opts.ambientColor : 0x3a5060),
        },
        bandHighlight: {
          value: opts.bandHighlight != null ? opts.bandHighlight : BAND_HIGH,
        },
        bandMidtone: {
          value: opts.bandMidtone != null ? opts.bandMidtone : BAND_MID,
        },
        bandShadow: {
          value: opts.bandShadow != null ? opts.bandShadow : BAND_SHADOW,
        },
        thresholdHi: {
          value: opts.thresholdHi != null ? opts.thresholdHi : THRESH_HI,
        },
        thresholdLo: {
          value: opts.thresholdLo != null ? opts.thresholdLo : THRESH_LO,
        },
        glossStrength: {
          value: opts.glossStrength != null ? opts.glossStrength : 0,
        },
        glossPower: {
          value: opts.glossPower != null ? opts.glossPower : 48,
        },
      },
      vertexShader: TOON_VERTEX,
      fragmentShader: TOON_FRAGMENT,
      lights: false,
    });

    mat.userData.btd6Toon = true;
    return mat;
  }

  /** Shiny bloon material: toon bands + heavy rubber gloss (metalness-like). */
  function createBTD6BloonMaterial(opts) {
    opts = opts || {};
    return createBTD6ToonMaterial({
      color: opts.color,
      map: opts.map || null,
      emissiveVibrancy: opts.emissiveVibrancy != null ? opts.emissiveVibrancy : 1.55,
      glossStrength: opts.glossStrength != null ? opts.glossStrength : 0.85,
      glossPower: opts.glossPower != null ? opts.glossPower : 64,
      bandShadow: BAND_SHADOW,
      bandMidtone: BAND_MID,
      bandHighlight: BAND_HIGH,
    });
  }

  function createBTD6OutlineMaterial(opts) {
    opts = opts || {};
    var mat = new THREE.ShaderMaterial({
      uniforms: {
        outlineThickness: {
          value: opts.thickness != null ? opts.thickness : DEFAULT_OUTLINE,
        },
        outlineColor: {
          value: toColor(opts.color != null ? opts.color : 0x000000),
        },
      },
      vertexShader: OUTLINE_VERTEX,
      fragmentShader: OUTLINE_FRAGMENT,
      side: THREE.BackSide,
      depthWrite: true,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });
    mat.userData.btd6Outline = true;
    return mat;
  }

  function attachBTD6Outline(mesh, opts) {
    if (!mesh || !mesh.geometry) {
      throw new Error('attachBTD6Outline expects a THREE.Mesh with geometry');
    }
    opts = opts || {};
    var outlineMat = createBTD6OutlineMaterial(opts);
    var outline = new THREE.Mesh(mesh.geometry, outlineMat);
    outline.name = (mesh.name || 'mesh') + '_btd6Outline';
    outline.userData.btd6OutlineMesh = true;
    outline.renderOrder = (mesh.renderOrder || 0) - 1;
    outline.position.set(0, 0, 0);
    outline.rotation.set(0, 0, 0);
    outline.scale.set(1, 1, 1);
    mesh.add(outline);
    return outline;
  }

  function styleMesh(mesh, opts) {
    opts = opts || {};
    mesh.material = opts.bloon
      ? createBTD6BloonMaterial(opts)
      : createBTD6ToonMaterial(opts);
    attachBTD6Outline(mesh, {
      thickness: opts.outlineThickness != null ? opts.outlineThickness : DEFAULT_OUTLINE,
      color: opts.outlineColor != null ? opts.outlineColor : 0x000000,
    });
    return mesh;
  }

  function createBTD6StyledMesh(geometry, opts) {
    opts = opts || {};
    var group = new THREE.Group();
    group.name = 'btd6Styled';
    var mesh = new THREE.Mesh(geometry);
    mesh.name = 'btd6Body';
    styleMesh(mesh, opts);
    group.add(mesh);
    return group;
  }

  function syncBTD6Light(root, lightOrDir) {
    var dir = new THREE.Vector3(0.45, 0.9, 0.35);
    if (lightOrDir && lightOrDir.isDirectionalLight) {
      dir.copy(lightOrDir.position).normalize();
    } else if (lightOrDir && lightOrDir.isVector3) {
      dir.copy(lightOrDir).normalize();
    }
    root.traverse(function (obj) {
      var m = obj.material;
      if (!m) return;
      var list = Array.isArray(m) ? m : [m];
      list.forEach(function (mat) {
        if (mat.userData && mat.userData.btd6Toon && mat.uniforms && mat.uniforms.lightDirection) {
          mat.uniforms.lightDirection.value.copy(dir);
        }
      });
    });
  }

  function setEmissiveVibrancy(material, value) {
    if (material && material.uniforms && material.uniforms.emissiveVibrancy) {
      material.uniforms.emissiveVibrancy.value = value;
    }
  }

  function setOutlineThickness(outlineMaterial, value) {
    if (outlineMaterial && outlineMaterial.uniforms && outlineMaterial.uniforms.outlineThickness) {
      outlineMaterial.uniforms.outlineThickness.value = value;
    }
  }

  return {
    createBTD6ToonMaterial: createBTD6ToonMaterial,
    createBTD6BloonMaterial: createBTD6BloonMaterial,
    createBTD6OutlineMaterial: createBTD6OutlineMaterial,
    attachBTD6Outline: attachBTD6Outline,
    styleMesh: styleMesh,
    createBTD6StyledMesh: createBTD6StyledMesh,
    syncBTD6Light: syncBTD6Light,
    setEmissiveVibrancy: setEmissiveVibrancy,
    setOutlineThickness: setOutlineThickness,
    BAND_SHADOW: BAND_SHADOW,
    BAND_MID: BAND_MID,
    BAND_HIGH: BAND_HIGH,
    DEFAULT_VIBRANCY: DEFAULT_VIBRANCY,
    DEFAULT_OUTLINE: DEFAULT_OUTLINE,
    TOON_VERTEX: TOON_VERTEX,
    TOON_FRAGMENT: TOON_FRAGMENT,
    OUTLINE_VERTEX: OUTLINE_VERTEX,
    OUTLINE_FRAGMENT: OUTLINE_FRAGMENT,
  };
});
