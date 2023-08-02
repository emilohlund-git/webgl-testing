import { Vector2D } from "../utilities/Vector2D";
import { Vector3D } from "../utilities/Vector3D";
import { ShaderUtils } from "../utilities/shaders/ShaderUtils";
import { WebGLUtils } from "../utilities/web-gl/WebGLUtils";
import { Particle } from "./Particle";

export class ParticleEmitter {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  particles: Particle[];
  positions: Float32Array; // Update this buffer when particles change
  positionBuffer: WebGLBuffer | null; // Declare positionBuffer as a class property

  constructor(gl: WebGLRenderingContext, vertexShaderSource: string, fragmentShaderSource: string) {
    this.gl = gl;
    const vertexShader = ShaderUtils.createShader(this.gl, this.gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = ShaderUtils.createShader(this.gl, this.gl.FRAGMENT_SHADER, fragmentShaderSource);
    this.program = ShaderUtils.createProgram(this.gl, vertexShader, fragmentShader);
    this.particles = [];
    this.positions = new Float32Array(0); // Initialize the buffer

    // Set up the position buffer
    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.DYNAMIC_DRAW); // Use particle positions data
  }

  spawnParticle(position: Vector2D, velocity: Vector2D, color: Vector3D, size: number, timeToLive: number) {
    const particle = new Particle(position, velocity, color, size, timeToLive);
    this.particles.push(particle);
  }

  update(deltaTime: number) {
    this.particles.forEach((particle) => {
      particle.update(deltaTime);
    });

    // Update the position buffer with particle positions
    const positionData: number[] = [];
    this.particles.forEach((particle) => {
      positionData.push(particle.position.x, particle.position.y);
    });
    this.positions = new Float32Array(positionData);

    // Bind the position buffer again after updating the data
    this.positionBuffer = WebGLUtils.createBuffer(this.gl, this.positions, this.gl.DYNAMIC_DRAW);
  }

  render() {
    if (!this.positionBuffer) return;

    // Bind the position buffer again before rendering
    const positionAttributeLocation = this.gl.getAttribLocation(this.program, "a_position");
    WebGLUtils.enableAttribute(this.gl, positionAttributeLocation, this.positionBuffer, 2, this.gl.FLOAT, 0, 0);

    // Render particles as points
    this.gl.drawArrays(this.gl.POINTS, 0, this.particles.length);
  }
}
