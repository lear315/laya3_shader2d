(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
  var __decorateClass = (decorators, target, key, kind) => {
    var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
    for (var i = decorators.length - 1, decorator; i >= 0; i--)
      if (decorator = decorators[i])
        result = (kind ? decorator(target, key, result) : decorator(result)) || result;
    if (kind && result)
      __defProp(target, key, result);
    return result;
  };

  // src/AniDepthValue2d.ts
  var AniDepthValue2d = class {
    constructor(texture_id) {
      this._texture_depth = null;
      this._texture_host_depth = null;
      this._dimensions = [0, 0, 0, 0];
      this._mapDimensions = [1, 5112];
      this._scale = 0.0215;
      this._offset = [0.1, 0.1, 0.1];
      this._focus = 0.5;
      this._enlarge = 1.06;
      this.animateType = 1;
      this.animateDuration = 3;
      this.easeFactor = 0.2;
      this.animateScale = {
        x: 1,
        y: 0.95,
        z: 0.95,
        px: 0.9,
        py: 0.925,
        pz: 0.925
      };
      this.pointZ = {
        x: 0,
        y: 0
      };
      this.pointB = {
        x: 0,
        y: 0
      };
      Laya.Shader2X["value2dMap"][texture_id] = this;
      Laya.timer.frameLoop(1, this, this.update);
    }
    update() {
      if (this.animateType == 0) {
        return;
      }
      if (this.animateType == 1) {
        let time = Date.now() / 1e3 / this.animateDuration;
        let s = this.animateScale.px;
        let l = this.animateScale.py;
        let u = this.animateScale.pz;
        this.offset = [
          Math.sin(2 * Math.PI * (time + s)) * this.animateScale.x,
          Math.sin(2 * Math.PI * (time + l)) * this.animateScale.y,
          0.5 * (1 + Math.sin(2 * Math.PI * (time + u))) * this.animateScale.z
        ];
      }
    }
    get texture_depth() {
      return this._texture_depth;
    }
    set texture_host_depth(texture) {
      this._texture_depth = texture["_getSource"]();
      this._texture_host_depth = texture;
    }
    get dimensions() {
      return this._dimensions;
    }
    set dimensions(value) {
      this._dimensions = value;
    }
    get mapDimensions() {
      return this._mapDimensions;
    }
    set mapDimensions(value) {
      this._mapDimensions = value;
    }
    get scale() {
      return this._scale;
    }
    set scale(value) {
      this._scale = value;
    }
    get offset() {
      return this._offset;
    }
    set offset(value) {
      this._offset = value;
    }
    get focus() {
      return this._focus;
    }
    set focus(value) {
      this._focus = value;
    }
    get enlarge() {
      return this._enlarge;
    }
    destroy() {
      Laya.timer.clear(this, this.update);
      this._texture_depth = null;
      if (this._texture_host_depth) {
        this._texture_host_depth.disposeBitmap();
      }
      this._texture_host_depth = null;
    }
  };
  __name(AniDepthValue2d, "AniDepthValue2d");

  // src/CustomValue2d.ts
  var CustomValue2d = class extends Laya.TextureSV {
    constructor(subID = 0) {
      super(subID);
      this.strength = 0;
      this.blurInfo = null;
      this.colorMat = null;
      this.colorAlpha = null;
      this.value2dProxy = null;
      this._textureHost = null;
      this._attribLocation = ["posuv", 0, "attribColor", 1, "attribFlags", 2];
      Object.defineProperty(this, "textureHost", {
        get() {
          return this._textureHost;
        },
        set(newValue) {
          this._textureHost = newValue;
          this.value2dProxy = Laya.Shader2X["value2dMap"][this._textureHost.id];
        },
        enumerable: true,
        configurable: true
      });
    }
    static applyCustomId() {
      let currentId = this.CustomId;
      Laya.Shader2X["customDefines2D"].push(currentId);
      this.CustomId++;
      return currentId;
    }
    clear() {
      super.clear();
    }
    setValue(value) {
      super.setValue(value);
    }
    upload() {
      super.upload();
    }
    /**
     * 代理参数传递
     */
    get texture_depth() {
      return this.value2dProxy.texture_depth;
    }
    get dimensions() {
      return this.value2dProxy.dimensions;
    }
    get mapDimensions() {
      return this.value2dProxy.mapDimensions;
    }
    get scale() {
      return this.value2dProxy.scale;
    }
    get offset() {
      return this.value2dProxy.offset;
    }
    get focus() {
      return this.value2dProxy.focus;
    }
    get enlarge() {
      return this.value2dProxy.enlarge;
    }
  };
  __name(CustomValue2d, "CustomValue2d");
  // 自定义的ShaderDefines2D
  CustomValue2d.CustomId = 16384;

  // src/Depth2dFS.ts
  var Depth2dFS = `
/*
	texture\u548Cfillrect\u4F7F\u7528\u7684\u3002
*/
#if defined(GL_FRAGMENT_PRECISION_HIGH) 
precision highp float;
#else
precision mediump float;
#endif
vec3 linearToGamma(in vec3 value)
{
    return vec3(mix(pow(value.rgb, vec3(0.41666)) * 1.055 - vec3(0.055), value.rgb * 12.92, vec3(lessThanEqual(value.rgb, vec3(0.0031308)))));
    
    
}
vec4 linearToGamma(in vec4 value)
{
    return vec4(linearToGamma(value.rgb), value.a);
}
vec3 gammaToLinear(in vec3 value)
{
    
    return pow(value, vec3(2.2));
}
vec4 gammaToLinear(in vec4 value)
{
    return vec4(gammaToLinear(value.rgb), value.a);
}
varying vec4 v_texcoordAlpha;
varying vec4 v_color;
varying float v_useTex;
uniform sampler2D texture;
uniform sampler2D texture_depth;
varying vec2 cliped;

uniform vec4 dimensions;
uniform vec2 mapDimensions;
uniform float scale;
uniform vec3 offset;
uniform float focus;
uniform float enlarge;
float aspect = dimensions.x / dimensions.y;

vec4 sampleTexture(sampler2D texture, vec2 uv)
{
    vec4 color = texture2D(texture, uv);
    return color;
}

// mono version of perspective shader
vec3 perspective(
sampler2D texture,
sampler2D texture_depth,
vec2 uv,
float horizontal_parallax, // 0 - no parallax
float vertical_parallax,   // same
float perspective_factor,  // 0 - no perspective
float h_convergence,       // 0.0 - near, 0.5 - center, 1.0 - far
float v_convergence        // same
) {
    const float sensitivity = 15.0; // aligns animation with the previous version where it was multiplied by 15
    horizontal_parallax *= sensitivity;
    vertical_parallax *= sensitivity;

    vec3 ray_origin = vec3(uv.x - 0.5, uv.y - 0.5, +1.0);
    vec3 ray_direction = vec3(uv.x - 0.5, uv.y - 0.5, -1.0);

    ray_direction.xy *= perspective_factor;
    ray_origin.xy /= 1.0 + perspective_factor;
    ray_direction.x += horizontal_parallax;
    ray_direction.y += vertical_parallax;

    ray_origin.x -= h_convergence * horizontal_parallax;
    ray_origin.y -= v_convergence * vertical_parallax;

    const int step_count = 45; // affects quality and processing time
    const float hit_threshold = 0.01;
    ray_direction /= float(step_count);

    for (int i = 0; i < step_count; i++) {
        ray_origin += ray_direction;
        vec2 vFlipUV = (ray_origin.xy + 0.5);
        float scene_z = texture2D(texture_depth, vFlipUV).x;
        if (ray_origin.z < scene_z) {
            if (scene_z - ray_origin.z < hit_threshold) {
                return texture2D(texture, ray_origin.xy + 0.5).rgb;
            }
            ray_origin -= ray_direction; // step back
            ray_direction /= 2.0; // decrease ray step to approach surface with greater precision
        }
    }
    return texture2D(texture, ray_origin.xy + 0.5).rgb;
}


vec3 displacement(
    sampler2D texture,
    sampler2D texture_depth,
    vec2 uv
) {
    vec2 scale2 = vec2(scale * min(1.0, 1.0 / aspect), scale * min(1.0, aspect)) * vec2(1, -1) * vec2(1);
    vec2 mapCords = uv;
    // mapCords.y *= -1.0;
    // mapCords.y += 1.0;
    float map = 1.0 - texture2D(texture_depth, mapCords).r;
    map = map * -1.0 + focus;
    vec2 disCords = uv;
    disCords += offset.xy * map * scale2;
    return texture2D(texture, disCords).rgb;
}


void main()
{
    if (cliped.x < 0.)
	discard;
    if (cliped.x > 1.)
	discard;
    if (cliped.y < 0.)
	discard;
    if (cliped.y > 1.)
	discard;
    // vec4 color = sampleTexture(texture, v_texcoordAlpha.xy);


    float gain = scale * 0.075;
	float persp_factor = scale * 3.0 * offset.z;
    vec4 color = vec4(perspective(texture, texture_depth, v_texcoordAlpha.xy, -gain * offset.x, gain * offset.y * aspect, persp_factor, 1.0 - focus, 1.0 - focus), 1.0);
    color.xyz = linearToGamma(color.xyz);

    // vec4 color = vec4(displacement(texture, texture_depth, v_texcoordAlpha.xy), 1.0);

    // if (v_useTex <= 0.)
    //     color = vec4(1., 1., 1., 1.);
    // color.a *= v_color.w;
    
    // vec4 transColor = v_color;
    // transColor = gammaToLinear(v_color);
    // color.rgb *= transColor.rgb;
    gl_FragColor = color;
}
`;

  // src/Depth2dVS.ts
  var Depth2dVS = `
/*
	texture\u548Cfillrect\u4F7F\u7528\u7684\u3002
*/
attribute vec4 posuv;
attribute vec4 attribColor;
attribute vec4 attribFlags;
uniform vec4 clipMatDir;
uniform vec2 clipMatPos;		
varying vec2 cliped;
uniform vec2 size;
uniform vec2 clipOff;			
varying vec4 v_texcoordAlpha;
varying vec4 v_color;
varying float v_useTex;
void main() {
	vec4 pos = vec4(posuv.xy,0.,1.);
	vec4 pos1  =vec4((pos.x/size.x-0.5)*2.0,(0.5-pos.y/size.y)*2.0,0.,1.0);
	gl_Position=pos1;
	v_texcoordAlpha.xy = posuv.zw;
	
	v_color = attribColor/255.0;
	v_color.xyz*=v_color.w;
	v_useTex = attribFlags.r/255.0;
	float clipw = length(clipMatDir.xy);
	float cliph = length(clipMatDir.zw);
	
	vec2 clpos = clipMatPos.xy;
	vec2 clippos = pos.xy - clpos;	
	if(clipw>20000. && cliph>20000.)
		cliped = vec2(0.5,0.5);
	else {
		
		cliped=vec2( dot(clippos,clipMatDir.xy)/clipw/clipw, dot(clippos,clipMatDir.zw)/cliph/cliph);
	}
}
`;

  // src/Main.ts
  var { regClass, property } = Laya;
  var Main = class extends Laya.Script {
    onStart() {
      Laya.Shader2X["customDefines2D"] = [];
      Laya.Shader2X["value2dMap"] = {};
      Laya.loader.load(["bg/anibg2.jpg", "bg/anibgdepth2.jpg"], Laya.Handler.create(this, this.use2dShader));
    }
    use2dShader() {
      let shaderImage = new Laya.Image();
      let texture = Laya.loader.getRes("bg/anibg2.jpg");
      let texture_depth = Laya.loader.getRes("bg/anibgdepth2.jpg");
      let id = CustomValue2d.applyCustomId();
      texture.bitmap["_id"] = id;
      shaderImage.source = texture;
      shaderImage.zOrder = 999;
      shaderImage.width = Laya.stage.width;
      shaderImage.height = Laya.stage.height;
      let aniDepthValue2d = new AniDepthValue2d(texture.id);
      aniDepthValue2d.texture_host_depth = texture_depth;
      aniDepthValue2d.dimensions = [texture.width, texture.height, texture_depth.width, texture_depth.height];
      aniDepthValue2d.mapDimensions = [texture.width, texture.height];
      Laya.Value2D._initone(Laya.ShaderDefines2D.TEXTURE2D | id, CustomValue2d);
      let attribLocation = ["posuv", 0, "attribColor", 1, "attribFlags", 2];
      let shader = new Laya.Shader2X(Depth2dVS, Depth2dFS, Laya.ShaderDefines2D.TEXTURE2D | Laya.ShaderDefines2D.GAMMASPACE | id, null, attribLocation);
      Laya.stage.addChild(shaderImage);
    }
  };
  __name(Main, "Main");
  Main = __decorateClass([
    regClass("7bad1742-6eed-4d8d-81c0-501dc5bf03d6", "../src/Main.ts")
  ], Main);
})();
//# sourceMappingURL=bundle.js.map
