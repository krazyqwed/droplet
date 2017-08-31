class Filter {
  constructor() {
    this._action = false;
    this._shaders = {
      snow: {
        shader: this._snowShader(),
        active: false
      }
    };
  }

  handleAction(action) {
    this._action = action;

    if (!this._action.event) {
      this._action.event = 'show';
    }

    switch(this._action.event) {
      case 'on': this._on(); break;
      case 'off': this._off(); break;
    }
  }

  tick() {
    if (!D.Stage._filters) {
      return;
    }

    D.Stage._filters.forEach((activeFilter) => {
      Object.keys(this._shaders).forEach((filter) => {
        if (activeFilter === this._shaders[filter].shader && this._shaders[filter].active) {
          activeFilter.uniforms.time += 0.01;
        }
      });
    });
  }

  _snowShader() {
    const fragmentSrc = `
      precision mediump float;
      
      varying vec2 vTextureCoord;
      uniform sampler2D uSampler;
      uniform vec3 resolution;
      uniform float time;

      float snow(vec2 uv, float scale) {
        float w = smoothstep(9., 0., -uv.y * (scale / 10.));
        if (w < .1) {
          return 0.;
        }
        uv += time / scale;
        uv.y += time * 2. / scale;
        uv.x += sin(uv.y + time * .5) / scale;
        uv *= scale;
        vec2 s = floor(uv);
        vec2 f = fract(uv);
        float k = 3.;
        vec2 p;
        p = .5 + .35 * sin(11. * fract(sin((s + p + scale) * mat2(7, 3, 6, 5)) * 5.)) - f;
        float d = length(p);
        k = min(d,k);
        k = smoothstep(0., k, sin(f.x + f.y) * .01);
        return k * w;
      }

      void main(void) {
        vec2 uv = (gl_FragCoord.xy * 2. - resolution.xy) / min(resolution.x, resolution.y); 
        vec3 finalColor = vec3(.1);
        float c = 0.;
        c += snow(uv, 5.5);
        c += snow(uv, 3.5);
        c += snow(uv, 2.5);
        c += snow(uv, 1.5);
        finalColor = vec3(c) + texture2D(uSampler, vTextureCoord.xy).xyz;
        gl_FragColor = vec4(finalColor,1);
      }`;

    return new PIXI.Filter(null, fragmentSrc, {
      resolution: { type: 'v2', value: [1920, 1080] },
      time: { type: 'float', value: 0 }
    });
  }

  _on() {
    D.Stage.filters = [this._shaders[this._action.filter].shader];
    this._shaders[this._action.filter].active = true;
  }

  _off() {
    D.Stage.filters = D.Stage.filters.filter((filter) => {
      if (filter !== this._shaders[this._action.filter].shader) {
        return filter;
      }
    });
    this._shaders[this._action.filter].active = false;
  }
}

export default new Filter();
