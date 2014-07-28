
(function(){
  var PolymerTests = {};
  //I am not sure if we can just do this once, or for every test.  I am hoping just once
  var script = document.createElement("script");
  script.src = "/base/components/platform/platform.js";
  document.getElementsByTagName("head")[0].appendChild(script);

  var POLYMER_READY = false;
  var container;  //Used to hold fixture
  PolymerTests.loadFixture = function(fixture,done) {
    window.addEventListener('polymer-ready', function(){
      POLYMER_READY = true;
     done();
    });
    container = document.createElement("div");
    container.innerHTML = window.__html__[fixture];
    document.body.appendChild(container);
    if (POLYMER_READY) done();
  };
  //After every test, we remove the fixture
  afterEach(function(){
    document.body.removeChild(container);
  });

  window.PolymerTests = PolymerTests;

})();

