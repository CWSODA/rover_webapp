const vs = `
    attribute vec4 a_pos;
    attribute vec4 a_color;
    uniform mat4 model;
    uniform mat4 projection;
    varying lowp vec4 v_color;
    void main() {
      gl_Position = projection * model * a_pos;
      v_color = a_color;
    }
    `;

const fs = `
    varying lowp vec4 v_color;
    void main(){
        gl_FragColor = v_color;
    }
    `;

// Initialize shaders
function initShaderProgram(gl, vs, fs) {
    const vert_shader = loadShader(gl, gl.VERTEX_SHADER, vs);
    const frag_shader = loadShader(gl, gl.FRAGMENT_SHADER, fs);

    // Create the shader program
    const shader_program = gl.createProgram();
    gl.attachShader(shader_program, vert_shader);
    gl.attachShader(shader_program, frag_shader);
    gl.linkProgram(shader_program);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shader_program, gl.LINK_STATUS)) {
        alert(
            `Unable to initialize the shader program: ${gl.getProgramInfoLog(
                shader_program,
            )}`,
        );
        return null;
    }

    return shader_program;
}

// creates a shader of the given type
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    // Send the source to the shader object
    gl.shaderSource(shader, source);

    // Compile the shader program
    gl.compileShader(shader);

    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(
            `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`,
        );
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function init_webgl() {
    const canvas = document.getElementById('rover-canvas');
    const gl = canvas.getContext("webgl");

    if (gl == null) {
        alert("Unable to initialize WebGL");
        return;
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const shader_program = initShaderProgram(gl, vs, fs);

    const program_info = {
        program: shader_program,
        attribs: {
            vertex_pos: gl.getAttribLocation(shader_program, "a_pos"),
            vertex_color: gl.getAttribLocation(shader_program, "a_color"),
        },
        uniforms: {
            projection: gl.getUniformLocation(shader_program, "projection"),
            model: gl.getUniformLocation(shader_program, "model"),
        },
    };

    const buffers = init_buffers(gl);

    // Draw the scene repeatedly
    function render() {
        draw_scene(gl, program_info, buffers, {
            pitch: pitch,
            yaw: yaw,
            roll: roll,
        });

        // Update readouts
        document.getElementById('att-pitch').textContent = pitch.toFixed(1) + '°';
        document.getElementById('att-roll').textContent = roll.toFixed(1) + '°';
        document.getElementById('att-yaw').textContent = (yaw % 360).toFixed(1) + '°';
        document.getElementById('att-pitch-bar').style.width = (50 + pitch / 45 * 50) + '%';
        document.getElementById('att-roll-bar').style.width = (50 + roll / 45 * 50) + '%';
        document.getElementById('att-yaw-bar').style.width = ((yaw % 360) / 360 * 100) + '%';

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

init_webgl();
