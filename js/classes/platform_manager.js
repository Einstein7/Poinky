//Assumes the whole game is set around the world center (0,0,0)
function PlatformManager(sceneWidth, sceneDepth, world, PhysicsMaterial, scene, renderMaterial){
    var that = this;

    //Config
    this.sceneWidth = sceneWidth;
    this.sceneDepth = sceneDepth;

    this.world = world;
    this.scene = scene;

    this.platformsMaterial = PhysicsMaterial || new CANNON.Material("platformMaterial");
    this.renderMaterial = renderMaterial;

    //Globals
    this.scrollSpeed = 0.9;
    this.sidewaySpeed = 30;
    this.platformsGap = 30;
    this.xstep = 0;
    //Platforms array
    this.platforms = [];

    //Set the next platform to the one beneath poinky
    var nextPlatformIndex = 0;

    function createPlatform() {
        //calculate position from gap
        var zPos = that.platforms.length == 0 ? 0 : that.platforms[that.platforms.length - 1].z - that.platformsGap;
		that.xstep+= 10;

		//var xPos = that.platforms.length == 0 ? 0 : Math.sin ( Math.random() *that.xstep )* that.platforms[that.platforms.length-1].x  +  (that.sceneWidth) - that.sceneWidth / 2;
		if (that.platforms.length == 0)
		{
		   xPos = 0;
		}
		else
		{
		  xPos = Math.sin ( Math.random() *that.xstep )* that.platforms[that.platforms.length-1].x  +  (that.sceneWidth) - that.sceneWidth / 2;
		  if(Math.abs(xPos - that.platforms[that.platforms.length-1].x) > 110)
		    xPos = that.platforms[that.platforms.length-1].x - 50;
		}
		

        that.platforms.push(new Platform(xPos, -13.5, zPos, 12, 4, 6.5, world, platformsMaterial, scene, that.renderMaterial));
    }

    function shouldCreate() {
        return that.platforms.length == 0 || that.platforms[that.platforms.length - 1].z > (-sceneDepth / 2 + that.platformsGap);
    }

    function shouldDestory() {
        return that.platforms[0].z > sceneDepth / 2;
    }
    this.reset = function () {
        for (var i = 0; i < this.platforms.length; i++) {
            this.platforms[i].remove();
        }
        this.platforms = [];
        createPlatform();
    }
    function destoryPlatform() {
        //Optimize by moving the cube back instead of deleting it and creating a new one
        that.platforms[0].remove();
        that.platforms.splice(0, 1);
        --nextPlatformIndex;
    }

    function updatePlatforms() {
        //if no platforms or gap is achieved create a platform
        if (shouldCreate())
            createPlatform();

        while(shouldDestory())
            destoryPlatform();
    }

    var translationStart = Date.now();
    var targetTranslation = 0;
    var currentTranslation = 0;
    var startingTranslation = 0;

    function EaseInOutCubic(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t * t + b;
        t -= 2;
        return c / 2 * (t * t * t + 2) + b;
    };

    this.update = function () {
        updatePlatforms();

        //Scroll until next platform reaches poinky
        if(this.platforms[nextPlatformIndex].z < 0)
            for (var i = 0; i < this.platforms.length; i++) {
                this.platforms[i].translate(0, 0, this.scrollSpeed);
                this.platforms[i].update();
            }

        //Apply player movement
        if(Math.abs(targetTranslation-currentTranslation) > 0.1)
        {
            var t = Date.now() - translationStart; //msec
            var easedTranslation = EaseInOutCubic(t*1.2, currentTranslation, targetTranslation - currentTranslation, 2000); //2 sec

            for (var i = 0; i < this.platforms.length; i++) {
                this.platforms[i].translate(-currentTranslation, 0, 0);
                this.platforms[i].update();
                this.platforms[i].translate(easedTranslation, 0, 0);
                this.platforms[i].update();
            }

            currentTranslation = easedTranslation;
        }
    }

    this.movePlatforms = function (x) {
        if (Date.now() - translationStart > 500)
            translationStart = Date.now() - 500;

        startingTranslation = currentTranslation;
        targetTranslation += x;
        //for (var i = 0; i < this.platforms.length; i++) {
        //    this.platforms[i].translate(x, 0, 0);
        //    this.platforms[i].update();
        //}
    }
    this.draw = function () {
        for (var i = 0; i < this.platforms.length; i++)
            this.platforms[i].draw();
    }

    this.scrollPlatforms = function () {
        nextPlatformIndex++;
    };

    //precreate blocks until they reach poinky
    var prevLen = 0;
    while(this.platforms.length != prevLen)
    {
        prevLen = this.platforms.length;
        updatePlatforms();
    }

}