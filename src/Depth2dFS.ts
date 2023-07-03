export let Depth2dFS = `
/*
	texture和fillrect使用的。
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