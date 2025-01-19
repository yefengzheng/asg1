class Pacman {
  constructor() {
    this.type = 'pacman';
    this.verticesColors = new Float32Array([
      // Pac-Man body (yellow)
      0.0, 0.0, 1.0, 1.0, 0.0, 1.0,
      0.8, 0.4, 1.0, 1.0, 0.0, 1.0,
      0.4, 0.8, 1.0, 1.0, 0.0, 1.0,
      0.0, 0.8, 1.0, 1.0, 0.0, 1.0,
      -0.4, 0.8, 1.0, 1.0, 0.0, 1.0,
      -0.8, 0.4, 1.0, 1.0, 0.0, 1.0,
      -0.8, 0.0, 1.0, 1.0, 0.0, 1.0,
      -0.8, -0.4, 1.0, 1.0, 0.0, 1.0,
      -0.4, -0.8, 1.0, 1.0, 0.0, 1.0,
      0.0, -0.8, 1.0, 1.0, 0.0, 1.0,
      0.4, -0.8, 1.0, 1.0, 0.0, 1.0,
      0.8, -0.4, 1.0, 1.0, 0.0, 1.0,

      // Teeth (red triangles)
      0.6, -0.3, 1.0, 0.0, 0.0, 1.0,
      0.4, -0.2, 1.0, 0.0, 0.0, 1.0,
      0.6, 0.0, 1.0, 0.0, 0.0, 1.0,
      0.6, 0.3, 1.0, 0.0, 0.0, 1.0,
      0.4, 0.2, 1.0, 0.0, 0.0, 1.0,
      0.6, 0.0, 1.0, 0.0, 0.0, 1.0,

      // Eye (green triangle)
      0.3, 0.3,  0.0, 1.0, 0.0, 1.0,
      0.1, 0.5,  0.0, 1.0, 0.0, 1.0,
      0.3, 0.7,  0.0, 1.0, 0.0, 1.0,

      0.4, 0.6,  0.0, 1.0, 0.0, 1.0,
      0.3, 0.5,  0.0, 1.0, 0.0, 1.0,
      0.3, 0.7,  0.0, 1.0, 0.0, 1.0,

      0.4, 0.4,  0.0, 1.0, 0.0, 1.0,
      0.3, 0.3,  0.0, 1.0, 0.0, 1.0,
      0.3, 0.5,  0.0, 1.0, 0.0, 1.0,
    ]);
  }

  render() {
    const FSIZE = this.verticesColors.BYTES_PER_ELEMENT;

    // Create buffer and transfer data
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.verticesColors, gl.STATIC_DRAW);

    // Set position attribute
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 6, 0);
    gl.enableVertexAttribArray(a_Position);

    // Set color attribute
    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, FSIZE * 6, FSIZE * 2);
    gl.enableVertexAttribArray(a_Color);

    // Use vertex colors
    gl.uniform1i(u_UseVertexColor, true);

    // Draw Pac-Man parts
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 12); // Body
    gl.drawArrays(gl.TRIANGLES, 12, 6);    // Teeth
    gl.drawArrays(gl.TRIANGLES, 18, 9);    // Eye
  }
}
