import THREE from 'threejs';
import mod from 'mod';
import * as frag from 'text!./shaders/particle.frag';
import * as vert from 'text!./shaders/vertex.vert';

var params = {
    spot_0_speed     : 0.5,
    spot_1_speed     : 1.0,
    spot_radius      : 100,
    spot_brightness  : 10,
    background_alpha : 0,
    overlay_color    : '#FFFFFF',
    storminess       : 0.5,
};

export default class spotlights extends mod {
    constructor(gfx) {
        super(gfx);
        gfx.set(this, '3d');

        this.author = 'Densaugeo & MC';
        this.title = 'Portal';

        gfx.conf.gui.add(params, 'spot_0_speed', 0.1, 10).step(0.1).name('Spot 0 Speed');
        gfx.conf.gui.add(params, 'spot_1_speed', 0.1, 10).step(0.1).name('Spot 1 Speed');
        gfx.conf.gui.add(params, 'spot_radius', 0, 200).step(1).name('Spot Radius');
        gfx.conf.gui.add(params, 'spot_brightness', 0, 10).step(0.1).name('Spot Bright'); // 'Spot Brightness' glitches in UI
        gfx.conf.gui.add(params, 'background_alpha', 0, 1).step(0.01).name('Back Alpha');

        this.add_effect('particles');
        gfx.gl.particles.material.vertexShader = vert;
        gfx.gl.particles.material.fragmentShader = frag;

        gfx.gl.particles.set_particle_size(8);

        gfx.gl.particles.material.uniforms.spot_radius = {type: 'f', value: params.spot_radius};
        gfx.gl.particles.material.uniforms.spot_brightness = {type: 'f', value: params.spot_brightness};
        gfx.gl.particles.material.uniforms.background_alpha = {type: 'f', value: params.background_alpha};
        gfx.gl.particles.material.uniforms.overlay_color = { type : 'c',  value : new THREE.Color( params.overlay_color ) };

        gfx.conf.gui.addColor(params, 'overlay_color').onChange(this.set_overlay_color.bind(this));

        gfx.gl.particles.material.uniforms.spot_0_x = {type: 'f', value: 0};
        gfx.gl.particles.material.uniforms.spot_0_y = {type: 'f', value: 0};

        gfx.gl.particles.material.uniforms.spot_1_x = {type: 'f', value: 0};
        gfx.gl.particles.material.uniforms.spot_1_y = {type: 'f', value: 0};

        // set custom colors
        gfx.gl.particles.set_near_color('#2679C3');
        gfx.gl.particles.set_mid_color('#DC9C26');
        gfx.gl.particles.set_far_color('#FFFFFF'); // Not used, idk how to remove this from UI so I set it to 0

        this.prev_depth = gfx.depth;
    }
    set_overlay_color(prop, ...c) {
        let new_color = new THREE.Color(...c);
        this.gfx.gl.particles.material.uniforms.overlay_color.value = new_color;
        params.overlay_color = '#' + new_color.getHexString();
    }
    update(gfx) {
        avg(gfx.depth, this.prev_depth, 1 - params.storminess);
        this.prev_depth = gfx.depth;

        gfx.gl.particles.material.uniforms.spot_radius.value = params.spot_radius;
        gfx.gl.particles.material.uniforms.spot_brightness.value = params.spot_brightness;
        gfx.gl.particles.material.uniforms.background_alpha.value = params.background_alpha;

        // Simple parametric formula to move the spots in circles
        gfx.gl.particles.material.uniforms.spot_0_x.value = 150*Math.sin(Date.now()/1000*params.spot_0_speed) + 100;
        gfx.gl.particles.material.uniforms.spot_0_y.value = 150*Math.cos(Date.now()/1000*params.spot_0_speed);

        gfx.gl.particles.material.uniforms.spot_1_x.value = 150*Math.sin(Date.now()/1000*params.spot_1_speed) - 100;
        gfx.gl.particles.material.uniforms.spot_1_y.value = 150*Math.cos(Date.now()/1000*params.spot_1_speed);

        super.update(gfx);
    }
}

/**
 * Average together two arrays with an optional scale value that weighs one
 * array more highly than the other.
 */
function avg(tar1, tar2, scale=0.5) {
    for (let i = 0; i < tar1.length; i += 1) {
        tar1[i] = scale * tar1[i] + (1 - scale) * tar2[i];
    }
}
