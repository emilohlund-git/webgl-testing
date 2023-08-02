import { WebGLRenderer } from "../WebGLRenderer";
import { mandelbrotFragmentShaderSource } from "../shaders/fragmentShader";
import { vertexShaderSource } from "../shaders/vertexShader";
import { WebGLCanvasManager } from "../utilities/WebGLCanvasManager";

export class MandelbrotRenderer extends WebGLRenderer {
  private canvasManager: WebGLCanvasManager;
  private resolutionUniformLocation: WebGLUniformLocation | null;
  private centerUniformLocation: WebGLUniformLocation | null;
  private scaleUniformLocation: WebGLUniformLocation | null;
  private timeUniformLocation: WebGLUniformLocation | null;
  private center: { x: number, y: number };
  private scale: number;
  private time: number;

  constructor(canvasId: string) {
    const canvasManager = new WebGLCanvasManager(canvasId);
    const gl = canvasManager.getGLContext();
    if (!gl) {
      throw new Error("WebGL is not supported in this browser.");
    }

    super(gl, vertexShaderSource, mandelbrotFragmentShaderSource);

    this.canvasManager = canvasManager;
    if (!this.program) throw new Error("");

    // Get the attribute and uniform locations
    this.resolutionUniformLocation = this.gl.getUniformLocation(this.program, "u_resolution");
    this.centerUniformLocation = this.gl.getUniformLocation(this.program, "u_center");
    this.timeUniformLocation = this.gl.getUniformLocation(this.program, "u_time");
    this.scaleUniformLocation = this.gl.getUniformLocation(this.program, "u_scale");

    // Initialize other variables
    this.center = { x: -0.3, y: 0 };
    this.scale = 1;
    this.time = 0;

    this.gl.uniform2f(this.resolutionUniformLocation, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.uniform2f(this.centerUniformLocation, this.center.x, this.center.y);
    this.gl.uniform1f(this.scaleUniformLocation, this.scale);

    // Add event listeners for user interaction
    this.addEventListeners();

    // Start the animation loop
    this.updateAndRender();
  }

  renderMandelbrotSet() {
    this.gl.uniform2f(this.centerUniformLocation, this.center.x, this.center.y);
    this.gl.uniform1f(this.timeUniformLocation, this.time);
    this.gl.uniform1f(this.scaleUniformLocation, this.scale);

    // Render to a temporary texture
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

    // Use blending to combine the previous texture with the current one
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    this.gl.disable(this.gl.BLEND);
  }

  updateAndRender() {
    this.time += 0.02; // Adjust this value to control the speed of the animation

    // Render the scene using progressive rendering
    this.renderMandelbrotSet();

    // Continue updating and rendering
    requestAnimationFrame(this.updateAndRender.bind(this));
  }

  addEventListeners() {
    this.canvasManager.getCanvas().addEventListener("wheel", (event) => {
      // Change the scale based on the direction of the mouse wheel scroll
      const wheelDelta = event.deltaY;
      const zoomFactor = 0.08; // Adjust this value to control the zoom speed
      if (wheelDelta > 0) {
        this.scale *= 1.0 + zoomFactor; // Zoom out by increasing the scale slightly
      } else {
        this.scale *= 1.0 - zoomFactor; // Zoom in by reducing the scale slightly
      }

      this.gl.uniform2f(this.centerUniformLocation, this.center.x, this.center.y);
      this.gl.uniform1f(this.scaleUniformLocation, this.scale);
      this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

      event.preventDefault(); // Prevent the default behavior of scrolling the page
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

        const panningSpeed = 0.005; // Adjust this value to control the panning speed
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
}