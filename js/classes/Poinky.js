function Poinky(x, y, effect, world, jumpfx) {
    var that = this;
    this.initialPosition = new THREE.Vector2(x, y);
    //Config
    this.effect = effect;
    this.world = world;
    this.score = 0;
    this.onJump = null;
    this.onDeath = null;
    this.jumpfx= jumpfx;
    //changing those values change the shape of Poinky
    this.baseBallStrength = .8;
    this.midBallStrength = .5;
    this.topBallStrength = 0.3;
    this.jumping = false;
    this.firstIteration = false;
    //Create physics
    this.material = new CANNON.Material("poinkyMaterial");

    this.baseBall = new CANNON.Body({ mass: 10, material: this.material });
    this.baseBall.addShape(new CANNON.Sphere(3));
    this.baseBall.position.set(x, y + 5, 0);
    this.baseBall.fixedRotation = true;
    this.world.add(this.baseBall);


    this.midMaterial = new CANNON.Material("midMaterial");
    this.midBall = new CANNON.Body({ mass: 0.1, material: this.midMaterial });
    this.midBall.addShape(new CANNON.Sphere(3));
    this.midBall.position.set(x, y + 15, 0);
    this.midBall.fixedRotation = true;
    //this.midBall.collisionFilterMask = 0;    //Prevent poinky from contacting himself
    this.world.add(this.midBall);

    this.spring = new CANNON.Spring(this.baseBall, this.midBall, {
        localAnchorA: new CANNON.Vec3(0, 3, 0),
        localAnchorB: new CANNON.Vec3(0, 0, 0),
        restLength: 3,
        stiffness: 120,
        damping: 0.75,
    });

    this.world.addEventListener("postStep", function (event) {
        that.spring.applyForce();
    });


    var flipper = -2100; // :D

    this.jump = function () {
        if (!this.jumping) {
            this.score++;
            this.baseBall.velocity.y = 0;
            this.baseBall.velocity.x = 0;
            this.baseBall.velocity.z = 0;
            this.jumpfx.play();
            this.baseBall.applyImpulse(new CANNON.Vec3(flipper = -flipper, 800, 0), this.baseBall.position);
            this.jumping = true;

            if (this.onJump) {
                if (!this.firstIteration)
                    this.onJump();
                else
                    this.firstIteration = false;
            }
                        }
    }
    this.reset = function () {
        this.baseBall.position.set(this.initialPosition.x, this.initialPosition.y + 5, 0);
        this.midBall.position.set(this.initialPosition.x,this.initialPosition.y + 15, 0);
        this.score = 0; 
        this.firstIteration= true;
        this.update();
    }
    //setTimeout(function () {
    //    setInterval(jump, 2000);
    //}, 2000);

    //this.hinge = new CANNON.HingeConstraint(this.baseBall, this.midBall, {
    //    pivotA: new CANNON.Vec3(0, 5, 0),
    //    pivotB: new CANNON.Vec3(0, 0, 0),
    //    axisA: new CANNON.Vec3(1, 0, 0)
    //});
    //this.world.addConstraint(this.hinge);
    var baseBallPosition, midBallPosition, topBallPosition;
    this.update = function () {

        //Clamp z axis
        this.baseBall.velocity.z = 0;
        this.baseBall.position.z = 0;

        //Clamp overall velocity
        if (this.baseBall.velocity.norm() > 130) {
            this.baseBall.velocity.normalize();
            this.baseBall.velocity = this.baseBall.velocity.scale(130, this.baseBall.velocity);
        }


        //Physics
        this.midBall.applyForce(new CANNON.Vec3(2, 150, 0), this.midBall.position);

        this.baseBall.addEventListener("collide", function (event) {
            if (event.body.material.name == "platformMaterial"){
                that.jump();
            }
            else if (event.body.material.name == "groundMaterial")
                that.onDeath();
        });


        this.baseBall.updateMassProperties();
        this.midBall.updateMassProperties();

        //Marching Balls
        baseBallPosition = new three.Vector3(this.baseBall.position.x, this.baseBall.position.y, this.baseBall.position.z);
        this.effect.worldToLocal(baseBallPosition);
        baseBallPosition.x = (baseBallPosition.x + 1) / 2;
        baseBallPosition.y = (baseBallPosition.y + 1) / 2;
        baseBallPosition.z = (baseBallPosition.z + 1) / 2;

        midBallPosition = new three.Vector3(this.midBall.position.x, (this.midBall.position.y -2)/2, this.midBall.position.z);
        this.effect.worldToLocal(midBallPosition);
        midBallPosition.x = (midBallPosition.x + 1) / 2;
        midBallPosition.y = (midBallPosition.y + 1) / 2;
        midBallPosition.z = (midBallPosition.z + 1) / 2;

        topBallPosition = new three.Vector3(this.midBall.position.x, (this.midBall.position.y + 6)/2, this.midBall.position.z);
        this.effect.worldToLocal(topBallPosition);
        topBallPosition.x = (topBallPosition.x + 1) / 2;
        topBallPosition.y = (topBallPosition.y + 1) / 2;
        topBallPosition.z = (topBallPosition.z + 1) / 2;

        x = this.baseBall.x;
        y = this.baseBall.y + 3;
        z = this.baseBall.z;
        if (this.baseBall.velocity.y < .05) this.jumping = false;
    }

    this.draw = function () {

        this.effect.position.x = this.baseBall.position.x;
        this.effect.position.z = this.baseBall.position.z;

        this.effect.addBall(
            topBallPosition.x,
            topBallPosition.y,
            topBallPosition.z,
            this.topBallStrength, 12
            );
        this.effect.addBall(
            midBallPosition.x,
            midBallPosition.y,
            midBallPosition.z,
            this.midBallStrength, 12
            );
        this.effect.addBall(
            baseBallPosition.x,
            baseBallPosition.y,
            baseBallPosition.z,
            this.baseBallStrength, 12
            );
    }
    this.update();
}