function Platform(x, y, z, width, height, depth, world, physicsMaterial, scene, renderMaterial) {
    var that = this;
    //Config
    this.x = x;
    this.y = y;
    this.z = z;

    this.width = width;
    this.height = height;
    this.depth = depth;

    this.world = world;
    this.scene = scene;

    //Create physics
    this.physicsMaterial = physicsMaterial || new CANNON.Material("platformMaterial");
    this.renderMaterial = renderMaterial || new THREE.MeshLambertMaterial({ color: 0xff0000 });
    this.body = new CANNON.Body({ mass: 0, material: this.physicsMaterial });
    this.body.addShape(new CANNON.Box(new CANNON.Vec3(this.width, this.height, this.depth)));
    this.body.position.set(this.x, this.y, this.z);
    this.body.fixedRotation = true;
    this.world.add(this.body);

    //Create display
    this.material = this.renderMaterial;
    this.geometry = new THREE.IcosahedronGeometry(.6, 3);
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.scale.set(this.width * 2, this.height * 2, this.depth * 2);
    this.mesh.scale.set(this.width * 2, this.height * 2, this.depth * 2);
    this.scene.add(this.mesh);

    this.translate = function(x, y, z) {
        this.body.position.set(this.x + x, this.y + y, this.z + z);
    };

    this.update = function () {
        //this.body.applyForce(new CANNON.Vec3(0, 0, -20), this.body.position);
        //this.body.position.set(this.x, this.y, this.z - 0.1);

        //Update the object's coordinates from the body
        this.x = this.body.position.x;
        this.y = this.body.position.y;
        this.z = this.body.position.z;

        this.body.updateMassProperties();
    };

    this.draw = function () {
        this.mesh.position.copy(this.body.position);
    };

    this.remove = function () {
        this.world.remove(this.body);
        this.scene.remove(this.mesh);
    };
}