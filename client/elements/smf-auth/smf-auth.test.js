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
  beforeEach(function(done){
    jasmine.Ajax.install();
    jasmine.clock().install();
    PolymerTests.loadFixture("client/elements/smf-auth/smf-auth-fixture.html",done);
  });
  afterEach(function(){
    jasmine.clock().uninstall();
    jasmine.Ajax.uninstall();
  });
  it("should make a request on the url given in its url parameter",function(){
    var req = jasmine.Ajax.requests;
    expect(req.mostRecent().url).toBe('/football/auth_json.php'); //Url declared in our fixture
  });
  describe("handling no response timeout", function(){
    beforeEach(function(){
      this.auth = document.querySelector('smf-auth');
      this.listener = jasmine.createSpy("authListener");
      this.auth.addEventListener('auth-done',this.listener);
    });
    afterEach(function(){
      this.auth.removeEventListener('auth-done',this.listener);
    });
    it("should emit auth-done on no response timeout", function(){
      jasmine.clock().tick(950);
      expect(this.listener).not.toHaveBeenCalled();
      jasmine.clock().tick(100);
      expect(this.listener).toHaveBeenCalled();
    });
    it("should provide an empty token if request times out",function(){
      jasmine.clock().tick(1050); //ensure we get past the timeout
      expect(this.auth.token).toEqual('');
    });

  });

  it("should provide returned token if response received",function(done){
    function listener(){
      var auth = document.querySelector('smf-auth');
      expect(auth.token).toBe('This is my token');
      window.removeEventListener('auth-done',listener);
      done();
    };
    window.addEventListener('auth-done',listener);
    jasmine.Ajax.requests.mostRecent().response({
      "status":200,
      "contentType": "application/json",
      "responseText":{"token":"This is my token"}
    })

  });

});
