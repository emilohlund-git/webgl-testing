"use strict";
(() => {
  // src/utilities/shaders/ShaderUtils.ts
  var ShaderUtils = class {
    static createShader(gl, type, source) {
      const shader = gl.createShader(type);
      if (!shader)
        throw new Error("Failed to create GL shader.");
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
      if (!success) {
        console.error("Error compiling shader:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        throw new Error("Failure to compile shader.");
      }
      return shader;
    }
    static createProgram(gl, vertexShader, fragmentShader) {
      const program = gl.createProgram();
      if (!program)
        throw new Error("Failed to initialize GL program.");
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      const success = gl.getProgramParameter(program, gl.LINK_STATUS);
      if (!success) {
        console.error("Error linking program:", gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        throw new Error("Error to link program.");
      }
      return program;
    }
  };

  // src/utilities/web-gl/PositionBuffer.ts
  var PositionBuffer = class {
    static create(gl, program, positions, renderingContext = WebGLRenderingContext.STATIC_DRAW) {
      const buffer = gl.createBuffer();
      if (!buffer) {
        throw new Error("Failed to create position buffer.");
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), renderingContext);
      const attributeLocation = gl.getAttribLocation(program, "a_position");
      return { buffer, attributeLocation };
    }
    static enable(gl, bufferInfo) {
      const { buffer, attributeLocation } = bufferInfo;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(attributeLocation);
      gl.vertexAttribPointer(attributeLocation, 2, gl.FLOAT, false, 0, 0);
    }
  };

  // src/utilities/web-gl/WebGLUtils.ts
  var WebGLUtils = class {
    static enableAttribute(gl, attributeLocation, buffer, size, type, stride, offset) {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(attributeLocation);
      gl.vertexAttribPointer(attributeLocation, size, type, false, stride, offset);
    }
    static setViewport(gl, width, height) {
      gl.viewport(0, 0, width, height);
    }
    static clearCanvas(gl) {
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    static useProgram(gl, program) {
      gl.useProgram(program);
    }
    static createBuffer(gl, data, renderingContext = WebGLRenderingContext.STATIC_DRAW) {
      const buffer = gl.createBuffer();
      if (!buffer) {
        throw new Error("Failed to create buffer.");
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, renderingContext);
      return buffer;
    }
  };

  // src/WebGLRenderer.ts
  var WebGLRenderer = class {
    constructor(gl, vertexShaderSource2, fragmentShaderSource) {
      this.gl = gl;
      this.initializeShaders(vertexShaderSource2, fragmentShaderSource);
      const vertexShader = ShaderUtils.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource2);
      const fragmentShader = ShaderUtils.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
      this.program = ShaderUtils.createProgram(gl, vertexShader, fragmentShader);
      const positionBuffer = PositionBuffer.create(gl, this.program, [
        -1,
        -1,
        1,
        -1,
        -1,
        1,
        -1,
        1,
        1,
        -1,
        1,
        1
      ]);
      WebGLUtils.setViewport(gl, gl.canvas.width, gl.canvas.height);
      WebGLUtils.clearCanvas(gl);
      WebGLUtils.useProgram(gl, this.program);
      PositionBuffer.enable(gl, positionBuffer);
      this.initializeVariables();
    }
    initializeVariables() {
    }
    initializeShaders(vertexShaderSource2, fragmentShaderSource) {
      const vertexShader = ShaderUtils.createShader(this.gl, this.gl.VERTEX_SHADER, vertexShaderSource2);
      const fragmentShader = ShaderUtils.createShader(this.gl, this.gl.FRAGMENT_SHADER, fragmentShaderSource);
      this.program = ShaderUtils.createProgram(this.gl, vertexShader, fragmentShader);
    }
  };

  // src/shaders/fragmentShader.ts
  var mandelbrotFragmentShaderSource = `
precision highp float;
uniform vec2 u_resolution;
uniform vec2 u_center;
uniform float u_scale;
uniform float u_time;

const float PI = 3.14159265359;

float random(float x) {
    return fract(sin(x) * 43758.5453);
}

void main() {
    vec2 st = (gl_FragCoord.xy - u_resolution / 2.0) / u_resolution.y * 2.0;
    st.x *= u_resolution.x / u_resolution.y;
    vec2 c = u_center + st * u_scale;

    vec2 z = vec2(0.0);
    float n = 0.0;

    for (int i = 0; i < 1024; i++) {
        if (dot(z, z) > 4.0) break;
        z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
        n = float(i);
    }

    float mandelbrotColor = 0.5 + 0.5 * sin(u_time + n * 0.1);

    // Apply psychedelic effects to the pixels outside the Mandelbrot set
    float trippyEffect = 0.5 + 0.5 * sin(u_time + gl_FragCoord.x * 0.1 + gl_FragCoord.y * 0.2);
    float psychedelicEffect = 0.5 + 0.5 * sin(u_time + gl_FragCoord.x * 0.2 + gl_FragCoord.y * 0.1);

    // Apply psychedelic effects to the RGB components
    float r = mandelbrotColor * (trippyEffect + psychedelicEffect);
    float g = mandelbrotColor * (trippyEffect * psychedelicEffect);
    float b = mandelbrotColor * (trippyEffect - psychedelicEffect);

    // Add variation based on distance from the center
    vec2 centerOffset = (c - u_center) * 0.5;
    float distanceFromCenter = length(centerOffset);
    float variation = 0.2 * sin(u_time * 0.5 + distanceFromCenter * 2.0);
    r += variation;
    g += variation;
    b += variation;

    // Add trippy patterns based on screen coordinates
    float pattern4 = 0.5 + 0.5 * sin(u_time + gl_FragCoord.x * 0.01 + gl_FragCoord.y * 0.01);
    float pattern5 = 0.5 + 0.5 * sin(u_time + gl_FragCoord.x * 0.02 + gl_FragCoord.y * 0.02);
    float pattern6 = 0.5 + 0.5 * sin(u_time + gl_FragCoord.x * 0.03 + gl_FragCoord.y * 0.03);
    r *= pattern4;
    g *= pattern5;
    b *= pattern6;

    // Add vortex effect
    float vortexFactor = 1.0 - distanceFromCenter * 0.2;
    float vortexAngle = atan(c.y - gl_FragCoord.y, c.x - gl_FragCoord.x) * 10.0 * vortexFactor;
    vec2 vortexSt = vec2(cos(vortexAngle) * st.x - sin(vortexAngle) * st.y, sin(vortexAngle) * st.x + cos(vortexAngle) * st.y);
    st = mix(st, vortexSt, vortexFactor);

    // Add pulsating effect
    float pulsatingFactor = 0.5 + 0.5 * sin(u_time * 0.5 + distanceFromCenter * 2.0);
    st *= pulsatingFactor;

    // Calculate proximity to the Mandelbrot set
    float proximityToMandelbrot = 1.0 - smoothstep(0.0, 0.1, distanceFromCenter);

    // Add effects that change based on proximity to the Mandelbrot set
    float effect1 = 0.5 + 0.5 * sin(u_time * 0.5 + proximityToMandelbrot * 2.0);
    float effect2 = 0.5 + 0.5 * cos(u_time * 0.8 + proximityToMandelbrot * 2.0);
    r *= mix(1.0, effect1, proximityToMandelbrot);
    g *= mix(1.0, effect2, proximityToMandelbrot);
    b *= mix(1.0, effect1 + effect2, proximityToMandelbrot);

    // Enhance the psychedelic colors
    r = pow(r, 0.8);
    g = pow(g, 0.8);
    b = pow(b, 0.8);

    // Make the Mandelbrot set stand out more
    float mandelbrotContrast = 1.5;
    float mandelbrotBrightness = 0.2;
    r = mix(r, r * mandelbrotContrast + mandelbrotBrightness, mandelbrotColor);
    g = mix(g, g * mandelbrotContrast + mandelbrotBrightness, mandelbrotColor);
    b = mix(b, b * mandelbrotContrast + mandelbrotBrightness, mandelbrotColor);

    gl_FragColor = vec4(r, g, b, 1.0);
}
`;

  // src/shaders/vertexShader.ts
  var vertexShaderSource = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

  // src/utilities/WebGLCanvasManager.ts
  var WebGLCanvasManager = class _WebGLCanvasManager {
    static {
      this.BACKGROUND_COLOR = "black";
    }
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.gl = this.initWebGLContext();
      this.setupCanvas();
      window.addEventListener("resize", this.handleCanvasResize.bind(this));
    }
    initWebGLContext() {
      const gl = this.canvas.getContext("webgl");
      if (!gl) {
        throw new Error("WebGL is not supported in this browser.");
      }
      return gl;
    }
    setupCanvas() {
      document.body.style.backgroundColor = _WebGLCanvasManager.BACKGROUND_COLOR;
      this.canvas.style.width = "100vw";
      this.canvas.style.height = "100vh";
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
    handleCanvasResize() {
      this.setupCanvas();
    }
    getCanvas() {
      return this.canvas;
    }
    getGLContext() {
      return this.gl;
    }
  };

  // src/mandelbrot/MandelbrotRenderer.ts
  var MandelbrotRenderer = class extends WebGLRenderer {
    constructor(canvasId) {
      const canvasManager = new WebGLCanvasManager(canvasId);
      const gl = canvasManager.getGLContext();
      if (!gl) {
        throw new Error("WebGL is not supported in this browser.");
      }
      super(gl, vertexShaderSource, mandelbrotFragmentShaderSource);
      this.canvasManager = canvasManager;
      if (!this.program)
        throw new Error("");
      this.resolutionUniformLocation = this.gl.getUniformLocation(this.program, "u_resolution");
      this.centerUniformLocation = this.gl.getUniformLocation(this.program, "u_center");
      this.timeUniformLocation = this.gl.getUniformLocation(this.program, "u_time");
      this.scaleUniformLocation = this.gl.getUniformLocation(this.program, "u_scale");
      this.center = { x: -0.3, y: 0 };
      this.scale = 1;
      this.time = 0;
      this.gl.uniform2f(this.resolutionUniformLocation, this.gl.canvas.width, this.gl.canvas.height);
      this.gl.uniform2f(this.centerUniformLocation, this.center.x, this.center.y);
      this.gl.uniform1f(this.scaleUniformLocation, this.scale);
      this.addEventListeners();
      this.updateAndRender();
    }
    renderMandelbrotSet() {
      this.gl.uniform2f(this.centerUniformLocation, this.center.x, this.center.y);
      this.gl.uniform1f(this.timeUniformLocation, this.time);
      this.gl.uniform1f(this.scaleUniformLocation, this.scale);
      this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
      this.gl.enable(this.gl.BLEND);
      this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
      this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
      this.gl.disable(this.gl.BLEND);
    }
    updateAndRender() {
      this.time += 0.02;
      this.renderMandelbrotSet();
      requestAnimationFrame(this.updateAndRender.bind(this));
    }
    addEventListeners() {
      this.canvasManager.getCanvas().addEventListener("wheel", (event) => {
        const wheelDelta = event.deltaY;
        const zoomFactor = 0.08;
        if (wheelDelta > 0) {
          this.scale *= 1 + zoomFactor;
        } else {
          this.scale *= 1 - zoomFactor;
        }
        this.gl.uniform2f(this.centerUniformLocation, this.center.x, this.center.y);
        this.gl.uniform1f(this.scaleUniformLocation, this.scale);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        event.preventDefault();
      });
      let isPanning = false;
      let lastMouseX = 0;
      let lastMouseY = 0;
      this.canvasManager.getCanvas().addEventListener("mousedown", (event) => {
        isPanning = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
      });
      this.canvasManager.getCanvas().addEventListener("mouseup", () => {
        isPanning = false;
      });
      this.canvasManager.getCanvas().addEventListener("mousemove", (event) => {
        if (isPanning) {
          const deltaX = event.clientX - lastMouseX;
          const deltaY = event.clientY - lastMouseY;
          const panningSpeed = 5e-3;
          const newCenterX = this.center.x - deltaX * panningSpeed * this.scale;
          const newCenterY = this.center.y + deltaY * panningSpeed * this.scale;
          this.center.x = newCenterX;
          this.center.y = newCenterY;
          this.gl.uniform2f(this.centerUniformLocation, this.center.x, this.center.y);
          this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
          lastMouseX = event.clientX;
          lastMouseY = event.clientY;
        }
      });
    }
  };

  // src/main.ts
  document.addEventListener("DOMContentLoaded", () => {
    const _ = new MandelbrotRenderer("canvas");
  });
})();
