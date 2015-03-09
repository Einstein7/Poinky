function Splash(x, y, z, scene) {
    var that = this;
    //Config
    this.x = x;
    this.y = y;
    this.z = z;
    this.opacity = 0.6;

    this.scene = scene;


    //Init emitter

    //Particles group
    var group = new THREE.Object3D();
    this.scene.add(group);

    var h = 0;
    var k = 0.7;


    var callback = function () {
        var material = new THREE.ParticleCanvasMaterial({ program: SPARKS.CanvasShadersUtils.circles, blending: THREE.AdditiveBlending, transparent: true, opacity: that.opacity });
        material.map = null;
        material.color.setRGB(h, 0.1, 0.6); //0.7
        h += 0.001;
        if (h > 1) h -= 1;

        particle = new THREE.Particle(material);

        particle.scale.x = particle.scale.y = (1 + Math.random() * 3)/5;
        group.add(particle);
        return particle;
    };

    var sparksEmitter = new SPARKS.Emitter(new SPARKS.ShotCounter(50));
    console.log(this.x, this.y, this.z);
    //group.position.set(this.x, this.y, this.z);
    sparksEmitter.addInitializer(new SPARKS.Position(new SPARKS.PointZone(new THREE.Vector3(this.x, this.y, this.z))));
    sparksEmitter.addInitializer(new SPARKS.Lifetime(0, 3));
    sparksEmitter.addInitializer(new SPARKS.Target(null, callback));
    sparksEmitter.addInitializer(new SPARKS.Velocity(new SPARKS.PointZone(new THREE.Vector3(0, 35, 0))));


    sparksEmitter.addAction(new SPARKS.Age());
    sparksEmitter.addAction(new SPARKS.Move());
    sparksEmitter.addAction(new SPARKS.RandomDrift(2 * 200, 200, 2 * 200));
    sparksEmitter.addAction(new SPARKS.Accelerate(0, -140, 0));


    sparksEmitter.addCallback("created", function (particle) {
        particle.target.position = particle.position;
    });

    sparksEmitter.addCallback("dead", function (particle) {
        particle.target.visible = false; // is this a work around?
        group.remove(particle.target);
    });


    this.start = function () {
        sparksEmitter.start();
        setTimeout(function () {
            that.destroy();
        }, 3000);
    };

    this.destroy = function () {
        this.scene.remove(group);
    };

}