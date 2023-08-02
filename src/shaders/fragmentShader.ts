export const mandelbrotFragmentShaderSource = `
precision highp float;
uniform vec2 u_resolution;
uniform vec2 u_center;
uniform float u_scale;
uniform float u_time;

const float PI = 3.14159265359;

float random(float x) {
    return fract(sin(x) * 43758.5453);
}

void main() {
    vec2 st = (gl_FragCoord.xy - u_resolution / 2.0) / u_resolution.y * 2.0;
    st.x *= u_resolution.x / u_resolution.y;
    vec2 c = u_center + st * u_scale;

    vec2 z = vec2(0.0);
    float n = 0.0;

    for (int i = 0; i < 1024; i++) {
        if (dot(z, z) > 4.0) break;
        z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
        n = float(i);
    }

    float mandelbrotColor = 0.5 + 0.5 * sin(u_time + n * 0.1);

    // Apply psychedelic effects to the pixels outside the Mandelbrot set
    float trippyEffect = 0.5 + 0.5 * sin(u_time + gl_FragCoord.x * 0.1 + gl_FragCoord.y * 0.2);
    float psychedelicEffect = 0.5 + 0.5 * sin(u_time + gl_FragCoord.x * 0.2 + gl_FragCoord.y * 0.1);

    // Apply psychedelic effects to the RGB components
    float r = mandelbrotColor * (trippyEffect + psychedelicEffect);
    float g = mandelbrotColor * (trippyEffect * psychedelicEffect);
    float b = mandelbrotColor * (trippyEffect - psychedelicEffect);

    // Add variation based on distance from the center
    vec2 centerOffset = (c - u_center) * 0.5;
    float distanceFromCenter = length(centerOffset);
    float variation = 0.2 * sin(u_time * 0.5 + distanceFromCenter * 2.0);
    r += variation;
    g += variation;
    b += variation;

    // Add trippy patterns based on screen coordinates
    float pattern4 = 0.5 + 0.5 * sin(u_time + gl_FragCoord.x * 0.01 + gl_FragCoord.y * 0.01);
    float pattern5 = 0.5 + 0.5 * sin(u_time + gl_FragCoord.x * 0.02 + gl_FragCoord.y * 0.02);
    float pattern6 = 0.5 + 0.5 * sin(u_time + gl_FragCoord.x * 0.03 + gl_FragCoord.y * 0.03);
    r *= pattern4;
    g *= pattern5;
    b *= pattern6;

    // Add vortex effect
    float vortexFactor = 1.0 - distanceFromCenter * 0.2;
    float vortexAngle = atan(c.y - gl_FragCoord.y, c.x - gl_FragCoord.x) * 10.0 * vortexFactor;
    vec2 vortexSt = vec2(cos(vortexAngle) * st.x - sin(vortexAngle) * st.y, sin(vortexAngle) * st.x + cos(vortexAngle) * st.y);
    st = mix(st, vortexSt, vortexFactor);

    // Add pulsating effect
    float pulsatingFactor = 0.5 + 0.5 * sin(u_time * 0.5 + distanceFromCenter * 2.0);
    st *= pulsatingFactor;

    // Calculate proximity to the Mandelbrot set
    float proximityToMandelbrot = 1.0 - smoothstep(0.0, 0.1, distanceFromCenter);

    // Add effects that change based on proximity to the Mandelbrot set
    float effect1 = 0.5 + 0.5 * sin(u_time * 0.5 + proximityToMandelbrot * 2.0);
    float effect2 = 0.5 + 0.5 * cos(u_time * 0.8 + proximityToMandelbrot * 2.0);
    r *= mix(1.0, effect1, proximityToMandelbrot);
    g *= mix(1.0, effect2, proximityToMandelbrot);
    b *= mix(1.0, effect1 + effect2, proximityToMandelbrot);

    // Enhance the psychedelic colors
    r = pow(r, 0.8);
    g = pow(g, 0.8);
    b = pow(b, 0.8);

    // Make the Mandelbrot set stand out more
    float mandelbrotContrast = 1.5;
    float mandelbrotBrightness = 0.2;
    r = mix(r, r * mandelbrotContrast + mandelbrotBrightness, mandelbrotColor);
    g = mix(g, g * mandelbrotContrast + mandelbrotBrightness, mandelbrotColor);
    b = mix(b, b * mandelbrotContrast + mandelbrotBrightness, mandelbrotColor);

    gl_FragColor = vec4(r, g, b, 1.0);
}
`;