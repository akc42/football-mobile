/**
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

describe("<smf-auth>",function(){
  var listener = function(done){
    done();
  };
  beforeEach(function(done){
    jasmine.Ajax.install();
    PolymerTests.loadFixture("client/elements/smf-auth/smf-auth-fixture.html",function(){
      window.addEventListener('auth-done',listener(done)); //If it fires, then this test will complete, otherwise it will time out.
    });
  });
  afterEach(function(){
    jasmine.Ajax.uninstall();
    window.removeEventListener('auth-done',listener);
  });
  it("should emit auth-done when complete",function(){
    //If auth-done never happened, we would fail this test in the before each
  });
  it("should make a request on the url given in its url parameter",function(done){
    var req = jasmine.Ajax.requests;
    setTimeout(function(){
      expect(req.mostRecent().url).toBe('/football/auth_json.php'); //Url declared in our fixture
      done();
    },5000);
  });
});
