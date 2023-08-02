import { ShaderUtils } from "./utilities/shaders/ShaderUtils";
import { PositionBuffer } from "./utilities/web-gl/PositionBuffer";
import { WebGLUtils } from "./utilities/web-gl/WebGLUtils";

export class WebGLRenderer {
  public gl: WebGLRenderingContext;
  public program!: WebGLProgram;

  constructor(gl: WebGLRenderingContext, vertexShaderSource: string, fragmentShaderSource: string) {
    this.gl = gl;
    this.initializeShaders(vertexShaderSource, fragmentShaderSource);

    // Initialize shaders and program
    const vertexShader = ShaderUtils.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = ShaderUtils.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    this.program = ShaderUtils.createProgram(gl, vertexShader, fragmentShader);

    // Set up the position buffer
    const positionBuffer = PositionBuffer.create(gl, this.program, [
      -1, -1,
      1, -1,
      -1, 1,
      -1, 1,
      1, -1,
      1, 1,
    ]);

    WebGLUtils.setViewport(gl, gl.canvas.width, gl.canvas.height);
    WebGLUtils.clearCanvas(gl);
    WebGLUtils.useProgram(gl, this.program);

    PositionBuffer.enable(gl, positionBuffer);

    // Initialize other variables
    this.initializeVariables();
  }

  private initializeVariables() { /* */ }

  private initializeShaders(vertexShaderSource: string, fragmentShaderSource: string) {
    const vertexShader = ShaderUtils.createShader(this.gl, this.gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = ShaderUtils.createShader(this.gl, this.gl.FRAGMENT_SHADER, fragmentShaderSource);
    this.program = ShaderUtils.createProgram(this.gl, vertexShader, fragmentShader);
  }
}