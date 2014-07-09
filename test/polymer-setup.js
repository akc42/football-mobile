
(function(){
  var PolymerTests = {};

  //I am not sure if we can just do this once, or for every test.  I am hoping just once
  var script = document.createElement("script");
  script.src = "/base/components/platform/platform.js";
  document.getElementsByTagName("head")[0].appendChild(script);

  beforeEach(function(done){
    var l = document.createElement('link');
    l.rel = 'import';
    l.href = '/base/components/polymer/polymer.html';
    document.head.appendChild(l);

    window.addEventListener('polymer-ready', done);
  });


  PolymerTests.loadComponents = function(els) {
    els.forEach(function(el){
      var link = document.CreateElement("link");
      link.rel = "import";
      link.href = "client/app/" + el;
      document.getElementsByTagName("head")[0].appendChild(link);
    });
  };
  //After every test, we seach through head looking for imported content links and remove them
  afterEach(function(){
    var h = getElementsByTagName("head")[0]
    var links = h.childNodes
    for( i = 0 , j = links.length; i < j ; i++ ){
      if( links[ i ].tagName == "link" ){
          if(links[i].rel == 'import'){
            h.removeChild(links[i]);
          }
      }
    }

  });

  window.PolymerTests = PolymerTests;

})();

