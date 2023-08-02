export class WebGLCanvasManager {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;

  private static readonly BACKGROUND_COLOR = 'black';

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.gl = this.initWebGLContext();
    this.setupCanvas();

    window.addEventListener('resize', this.handleCanvasResize.bind(this));
  }

  private initWebGLContext(): WebGLRenderingContext {
    const gl = this.canvas.getContext("webgl");
    if (!gl) {
      throw new Error("WebGL is not supported in this browser.");
    }
    return gl;
  }

  private setupCanvas() {
    document.body.style.backgroundColor = WebGLCanvasManager.BACKGROUND_COLOR;

    this.canvas.style.width = "100vw";
    this.canvas.style.height = "100vh";

    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  private handleCanvasResize() {
    this.setupCanvas();
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  getGLContext(): WebGLRenderingContext {
    return this.gl;
  }
}