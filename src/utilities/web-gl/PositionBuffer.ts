export class PositionBuffer {
  static create(gl: WebGLRenderingContext, program: WebGLProgram, positions: number[], renderingContext: number = WebGLRenderingContext.STATIC_DRAW) {
    const buffer = gl.createBuffer();
    if (!buffer) {
      throw new Error("Failed to create position buffer.");
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), renderingContext);
    const attributeLocation = gl.getAttribLocation(program, "a_position");
    return { buffer, attributeLocation };
  }

  static enable(gl: WebGLRenderingContext, bufferInfo: { buffer: WebGLBuffer, attributeLocation: number }) {
    const { buffer, attributeLocation } = bufferInfo;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(attributeLocation);
    gl.vertexAttribPointer(attributeLocation, 2, gl.FLOAT, false, 0, 0);
  }
}
