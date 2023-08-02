export class WebGLUtils {
  static enableAttribute(gl: WebGLRenderingContext, attributeLocation: number, buffer: WebGLBuffer, size: number, type: number, stride: number, offset: number) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(attributeLocation);
    gl.vertexAttribPointer(attributeLocation, size, type, false, stride, offset);
  }

  static setViewport(gl: WebGLRenderingContext, width: number, height: number) {
    gl.viewport(0, 0, width, height);
  }

  static clearCanvas(gl: WebGLRenderingContext) {
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  static useProgram(gl: WebGLRenderingContext, program: WebGLProgram) {
    gl.useProgram(program);
  }

  static createBuffer(gl: WebGLRenderingContext, data: Float32Array, renderingContext: number = WebGLRenderingContext.STATIC_DRAW) {
    const buffer = gl.createBuffer();
    if (!buffer) {
      throw new Error("Failed to create buffer.");
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, renderingContext);
    return buffer;
  }
}