import {vec2, vec4, mat4, mat3} from 'gl-matrix';
import Drawable from './Drawable';
import {gl} from '../../globals';

var activeProgram: WebGLProgram = null;

export class Shader {
    shader: WebGLShader;
  
    constructor(type: number, source: string) {
        this.shader = gl.createShader(type);
        gl.shaderSource(this.shader, source);
        gl.compileShader(this.shader);
    
        if (!gl.getShaderParameter(this.shader, gl.COMPILE_STATUS)) {
            throw gl.getShaderInfoLog(this.shader);
        }
    }
};

class ShaderProgram {
    prog: WebGLProgram;
  
    attrPos: number;
    attrUV: number;
    attrOff: number;
  
    unifModel: WebGLUniformLocation;
    unifModelInvTr: WebGLUniformLocation;
    unifViewProj: WebGLUniformLocation;
    unifTime: WebGLUniformLocation;
    unifCam: WebGLUniformLocation;
    unifDimensions: WebGLUniformLocation;
  
    constructor(shaders: Array<Shader>) {
        this.prog = gl.createProgram();
    
        for (let shader of shaders) {
            gl.attachShader(this.prog, shader.shader);
        }
        gl.linkProgram(this.prog);
        if (!gl.getProgramParameter(this.prog, gl.LINK_STATUS)) {
           throw gl.getProgramInfoLog(this.prog);
        }
    
        this.attrPos = gl.getAttribLocation(this.prog, "vs_Pos");
        this.attrUV = gl.getAttribLocation(this.prog, "vs_UV");
        this.attrOff = gl.getAttribLocation(this.prog, "vs_Offset");
    
        this.unifModel      = gl.getUniformLocation(this.prog, "u_Model");
        this.unifModelInvTr = gl.getUniformLocation(this.prog, "u_ModelInvTr");
        this.unifViewProj   = gl.getUniformLocation(this.prog, "u_ViewProj");
        this.unifDimensions      = gl.getUniformLocation(this.prog, "u_Dimensions");
        this.unifTime      = gl.getUniformLocation(this.prog, "u_Time");
        this.unifCam   = gl.getUniformLocation(this.prog, "u_CameraPos");
    }
  
    use() {
        if (activeProgram !== this.prog) {
            gl.useProgram(this.prog);
            activeProgram = this.prog;
        }
    }
  
    setCameraPos(pos: vec2) {
        this.use();
        if(this.unifCam !== -1) {
            gl.uniform2f(this.unifCam, pos[0], pos[1]);
        }
    }
  
    setDimensions(width: number, height: number) {
        this.use();
        if(this.unifDimensions !== -1) {
            gl.uniform2f(this.unifDimensions, width, height);
        }
    }
  
    setModelMatrix(model: mat4) {
      this.use();
      if (this.unifModel !== -1) {
        gl.uniformMatrix4fv(this.unifModel, false, model);
      }
  
      if (this.unifModelInvTr !== -1) {
        let modelinvtr: mat4 = mat4.create();
        mat4.transpose(modelinvtr, model);
        mat4.invert(modelinvtr, modelinvtr);
        gl.uniformMatrix4fv(this.unifModelInvTr, false, modelinvtr);
      }
    }
  
    setViewProjMatrix(vp: mat4) {
        this.use();
        if (this.unifViewProj !== -1) {
            gl.uniformMatrix4fv(this.unifViewProj, false, vp);
        }
    }
  
    setTime(t: number) {
        this.use();
        if (this.unifTime !== -1) {
            gl.uniform1f(this.unifTime, t);
        }
    }
  
    draw(d: Drawable) {
        this.use();
    
        if (this.attrPos != -1 && d.bindPos()) {
            gl.enableVertexAttribArray(this.attrPos);
            gl.vertexAttribPointer(this.attrPos, 2, gl.FLOAT, false, 0, 0);
            gl.vertexAttribDivisor(this.attrPos, 0); // Advance 1 index in pos VBO for each vertex
        }
    
        if (this.attrUV != -1 && d.bindUV()) {
            gl.enableVertexAttribArray(this.attrUV);
            gl.vertexAttribPointer(this.attrUV, 2, gl.FLOAT, false, 0, 0);
            gl.vertexAttribDivisor(this.attrUV, 0); // Advance 1 index in pos VBO for each vertex
        }

        if (this.attrOff != -1 && d.bindOff()) {
            gl.enableVertexAttribArray(this.attrOff);
            gl.vertexAttribPointer(this.attrOff, 2, gl.FLOAT, false, 0, 0);
            gl.vertexAttribDivisor(this.attrOff, 0); // Advance 1 index in pos VBO for each vertex
        }
        
        d.bindIdx();
        gl.drawElementsInstanced(d.drawMode(), d.elemCount(), gl.UNSIGNED_INT, 0, d.numInstances);
    
        if (this.attrPos != -1) {
            gl.disableVertexAttribArray(this.attrPos);
        }
        if (this.attrUV != -1) {
            gl.disableVertexAttribArray(this.attrUV);
        }
        if (this.attrOff != -1) {
            gl.disableVertexAttribArray(this.attrOff);
        }
    }
};

export default ShaderProgram;
