const mat4 = glMatrix.mat4;
const vec3 = glMatrix.vec3;

function draw_scene(gl, program_info, buffers, rotation) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // generate projection matrix
    const projection = mat4.create();
    const fov = (45 * Math.PI) / 180; // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    mat4.perspective(projection, fov, aspect, zNear, zFar);

    // generate model matrix
    // x is pitch
    // y is yaw
    // z is roll
    const model = mat4.create();
    mat4.translate(model, model, [0.0, 0.0, -6.0]);
    mat4.rotateX(model, model, rotation.pitch * 3.14 / 180);
    mat4.rotateY(model, model, rotation.yaw * 3.14 / 180);
    mat4.rotateZ(model, model, rotation.roll * 3.14 / 180);

    set_pos_attrib(gl, buffers, program_info);
    set_color_attrib(gl, buffers, program_info);

    gl.useProgram(program_info.program);

    // set uniforms
    gl.uniformMatrix4fv(
        program_info.uniforms.projection,
        false,
        projection,
    );
    gl.uniformMatrix4fv(
        program_info.uniforms.model,
        false,
        model,
    );

    // draw
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
    const n = 36;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, n, type, offset);
}

// Tell WebGL how to pull out the positions from the position
// buffer into the vertexPosition attribute.
function set_pos_attrib(gl, buffers, program_info) {
    const n = 3;
    const type = gl.FLOAT; // the data in the buffer is 32bit floats
    const normalize = false; // don't normalize
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.pos);
    gl.vertexAttribPointer(
        program_info.attribs.vertex_pos,
        n,
        type,
        normalize,
        stride,
        offset,
    );
    gl.enableVertexAttribArray(program_info.attribs.vertex_pos);
}

function set_color_attrib(gl, buffers, program_info) {
    const n = 4;
    const type = gl.FLOAT; // the data in the buffer is 32bit floats
    const normalize = false; // don't normalize
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
        program_info.attribs.vertex_color,
        n,
        type,
        normalize,
        stride,
        offset,
    );
    gl.enableVertexAttribArray(program_info.attribs.vertex_color);
}