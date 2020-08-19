# Introduction

The API server handles the specific `/api/*` requests from the client.  All
requests outside of this namespace are handled by `nginx` a static file server.

This document describes how this server handles in coming request and routes
them to the correct routine for processing.

# Startup Phase

As the 
 
 
 aim to follow the processes I developed in my previous application.  During
system startup we have a little bit of code that scans a directory for `.js`
files and loads each one, using their name as the api name.

```javascript
  function loadServers(rootdir, relPath) {
    return includeAll({
      dirname: path.resolve(rootdir, relPath),
      filter: /(.+)\.js$/
    }) || {};
  }
```

I then create a set of routers - a base one for the backend web server to call for routing,
and api router for all the api routes, and then a set of separate routers (which will have 
different ways of being called)

```javascript

  const routerOpts = {mergeParams: true};
  const router = Router(routerOpts);  //create a router
  const api = Router(routerOpts);
  const conf = Router();
  const ses = Router(routerOpts);
  const prof = Router(routerOpts);
  const usr = Router(routerOpts);
  const approv = Router(routerOpts);
  const admin = Router(routerOpts);
  const gadm = Router(routerOpts);
  router.use('/api/', api);

```

As an example, my main config files will be called during app startup and will
just be plain get requests, much like the static files

```javascript

  api.use('/config/', conf);      
  const confs = loadServers(__dirname, 'config');
  for (const config in confs){
    conf.get(`/${config}`, async (req,res) => {
      try {
        const response = await confs[config]();
        res.end(JSON.stringify(response));
      } catch (e) {
        errored(req, res, `config/${config} failed with ${e}`);
      } 
    });
  }

```

So the directories I use are:-

<dl>
  <dt>config</dt>
  <dd>Configuration Variabls and Style CSS variables</dd>
  <dt>session</dt>
  <dd>Functions related to establishing a authorised user, including the sending of emails with links</dd>
  <dt>profile</dt>
  <dd>Functions User to allow user to edit his profile</dd>
  <dt>user</dt>
  <dd>Functions to allow the user to display data and make their picks</dd>
  <dt>approve</dt>
  <dd>Functions to allow an approver to approve new memberships</dd>
  <dt>admin</dt>
  <dd>Functions used by the competition administrator to manage the competition</dd>
  <dt>gadm</dt>
  <dd>Global Admin Function</dd>
</dl>

Various levels of middleware (no brackets) and apis (with [] brackets) are provided down the chain which goes as follows:-

```
[/api/delete_cookie]-->[/api/config/*(get only)]-->[/api/pin/:token]-->visitorCookieCheck-->
                                                                                            |
    <----------------------------------------------------------------------------------------
    |
    -->bodyparser -->[/api/session/*]-->fullCookieCheck-->[/api/profile/*]-->
                                                                           |
    <-----------------------------------------------------------------------
    |
    -->fullCookieAuthorisedCheck-->[/api/user/*]-->404
                                 |
                                 |-->[/api/approve]-->userHasMemberApproval-->[/api/approve/*]-->404
                                 |               
                                 |-->[/api/admin] -->userIsCompetitionAdmin-->[/api/admin/*]-->404
                                 |
                                 -->/[/api/gadm]-->userIsGlobalAdmin-->[/api/gadm/*]-->404
```

The middleware referenced above is
<dl>
  <dt>visitorCookieCheck</dt>
  <dd>Checks that the visitor has a visitor cookie set - which implies he has given consent for limited purposes.  It aslo includes
  a cid parameter which is added to the request to be passed through the other routers to the final</dd>
  <dt>Body parser</dt>
  <dd>A standard module which parses a stringifyed json set of parameters in the request body into a params object</dd>
  <dt>fullCookieCheck</dt>
  <dd>This checks for the presence of a full cookie holding user logon details</dd>
  <dt>fullCookieAuthorisedCheck</dt>
  <dd>This checks that the user is fully logged in, and therefore is fully authorised to be a user in the competitions.</dd>
  <dt>userHasMemberApproval</dt>
  <dd>Checks that this user is allowed to approve new members</dd>
  <dt>userIsCompetitionAdmin</dt>
  <dd>Checks that this user is the administrator of the competition in the "cid" cookie</dd>
  <dt>userIsGlobalAdmin</dt>
  <dd>User is a Global Admin</dd>
</dl>
