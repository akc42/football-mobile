describe('<smf-auth>',function(){
  beforeEach(function(done){
    jasmine.Ajax.install();
    PolymerTests.loadFixture('client/smf-auth/smf-auth-fixture.html',done);
  });
  afterEach(function(){
    jasmine.Ajax.uninstall();
  });
  describe("The element establishes itself",function(){
    var el;
    beforeEach(function(){
      el = document.querySelector('smf-auth');
    });
    it("Should display the splash image provided",function(){
      var img = el.shadowRoot.querySelector('img');
      expect(img.src).toMatch('football.png');
    });
    it("Should provide an Empty User object before authentication",function(){
      expect(el.user).toEqual({});
    });
    it("Should not display content before authentication",function(){
      var content = el.shadowRoot.querySelector('p');
      expect(content).toBe(null);
    });
  });
  describe("The element authenticates",function(){
    it("Should Make an Ajax Request to the url given in the login Attribute",function(){
      var req = jasmine.Ajax.requests;
      expect(req.mostRecent().url).toBe('/football/auth_json.php'); //Url declared in our fixture
    });

  })



});
