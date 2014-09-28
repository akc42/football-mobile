/*
 * Copyright (c) 2014 Alan Chandler. All rights reserved
 * This file is part of MBBall, an American Football Results Picking
 * Competition Management software suite.
 *
 * MBBall is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * MBBall is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with MBBall (file LICENCE).  If not, see <http://www.gnu.org/licenses/>.
 *
 */

describe('<football-app> fails to authenticate',function(){
  beforeEach(function(done){
    jasmine.Ajax.install();
    jasmine.clock().install();
    PolymerTests.loadFixture('client/football-app/football-app-fixture.html',done);
  });
  afterEach(function(){
    jasmine.clock().uninstall();
    jasmine.Ajax.uninstall();
  });
  it("should display an initial start up screen",function(){

  });
  it("failure to authenticate should display dialog informing user to login or register",function(){

  });
  it("clicking on register should take user to forum register url",function(){

  });
  it("clicking on login should take user to forum register url",function(){

  });
});

describe('<football-app> with authentication',function(){


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




