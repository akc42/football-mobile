-- @licence
--  Copyright (c) 2020 Alan Chandler, all rights reserved

--  This file is part of Football Mobile.

--  Football Mobile is free software: you can redistribute it and/or modify
--  it under the terms of the GNU General Public License as published by
--  the Free Software Foundation, either version 3 of the License, or
--  (at your option) any later version.

--  Football Mobile is distributed in the hope that it will be useful,
--  but WITHOUT ANY WARRANTY; without even the implied warranty of
--  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
--  GNU General Public License for more details.

--  You should have received a copy of the GNU General Public License
--  along with Football Mobile.  If not, see <http://www.gnu.org/licenses/>.

--
-- Database version 14 (See copy of data to default_competition below) using sqlite
--

--
--  NOTE: There are a number of settings in the Settings table that are just example values.  There is a list at the end of this file that
--        you MUST change, but the recommendation is to review off of them, and the settings in the style table to check they meet your needs.


BEGIN EXCLUSIVE;

CREATE TABLE competition (
    cid integer PRIMARY KEY ASC, --Competition ID - 
    name character varying,--This is the name that appears in the header for the competition
    administrator integer  NOT NULL DEFAULT 0, --The uid of the administrator
    open boolean NOT NULL DEFAULT 0 , --Says whether a user may see the competition
    closed boolean NOT NULL DEFAULT 0, --Says where a user may  still register
    expected_date bigint NOT NULL DEFAULT 0, --expected open date (0 if we don't know) only valid if not open
    condition text DEFAULT NULL,	--This is the text that a user has to agree to in order to register himself for the competition
    pp_deadline bigint DEFAULT 0 NOT NULL, --Playoff Selection Deadline 0 if no selection
    gap integer DEFAULT 300 NOT NULL, --Seconds to go before match to make pick deadline
    update_date bigint NOT NULL DEFAULT (strftime('%s','now')), --Date Competition Created or data other than results_cache updated
    pointsmap text NOT NULL DEFAULT '[1,2,4,6,8,12,16]', -- map of slider position to output result (JSON stringified value)
    underdogmap text NOT NULL DEFAULT '[0,1,2,4,6,8]', --map of absolute slider positions to underdog points
    playoffmap text NOT NULL DEFAULT '[1,2,4,6,8]',  --map of playoff points slider position to points allocated
    bonusmap text NOT NULL DEFAULT '[1,2,4,6,8,12,16]', --map of bonus question points slider position to points allocated
    defaultbonus integer NOT NULL DEFAULT 2, --default value of question bonus (bvalue) when new round created
    results_cache text DEFAULT NULL, -- JSON String cache of latest state of competition.
    cache_store_date bigint DEFAULT (strftime('%s','now'))
);


CREATE TABLE conference (
    confid character(3) PRIMARY KEY, --Conference 3 letter acronym
    name character varying(30)
);

-- User Pick of each division winner
CREATE TABLE div_winner_pick (
    cid integer NOT NULL, -- Competition ID
    uid integer NOT NULL, --User ID
    confid character(3) NOT NULL REFERENCES conference(confid) ON UPDATE CASCADE ON DELETE CASCADE, --Conference ID
    divid character(1) NOT NULL REFERENCES division(divid) ON UPDATE CASCADE ON DELETE CASCADE, --Division ID
    tid varchar(3) NOT NULL, --Team who will win division
    submit_time bigint DEFAULT (strftime('%s','now')) NOT NULL, --Time of submission
    admin_made boolean DEFAULT 0 NOT NULL, --set if admin made pick on behalf of user
    PRIMARY KEY (cid,uid,confid,divid),
    FOREIGN KEY (cid,uid) REFERENCES registration(cid,uid) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (cid,tid) REFERENCES team_in_competition(cid,tid)    
);

--Football Conference Division
CREATE TABLE division (
    divid character(1) PRIMARY KEY,
    name character varying(6)
);

CREATE TABLE match (
    cid integer NOT NULL, -- Competition ID
    rid integer NOT NULL, --Round ID
    aid varchar(3) NOT NULL, -- Away Team ID
    hid varchar(3) , --Home Team ID
    comment text, --Administrators Comment for the Match
    ascore integer, --Away Team Score
    hscore integer, --Home Team Score
    combined_score integer, --Value of Combined Score for an over/under question (add 0.5 to this for the question)
    open boolean DEFAULT 0 NOT NULL, --True if Match is set up and ready
    match_time bigint , --Time match is due to be played
    underdog integer DEFAULT 0 NOT NULL,  -- If 0 then not an underdog game, else if -ve additional points for away team, +ve additional points for home team
    PRIMARY KEY (cid,rid,aid),
    FOREIGN KEY (cid,rid) REFERENCES round(cid,rid) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (cid,aid) REFERENCES team_in_competition(cid,tid),
    FOREIGN KEY (cid,hid) REFERENCES team_in_competition(cid,tid)    
);

-- Holds one possible answer to the round question
CREATE TABLE option (
    cid integer NOT NULL, -- Competition ID
    rid integer NOT NULL, --Round ID
    opid integer NOT NULL, --Option ID
    label character varying, --Simple Label for this Option
    PRIMARY KEY(cid,rid,opid),
    FOREIGN KEY (cid,rid) REFERENCES round(cid,rid) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE option_pick (
    cid integer NOT NULL, -- Competition ID
    uid integer NOT NULL, --User ID
    rid integer NOT NULL, --Round ID
    opid integer NOT NULL , --ID of Question Option Selected as Correct 
    comment text, --General Comment from user about the round
    submit_time bigint DEFAULT (strftime('%s','now')) NOT NULL, --Time of Submission
    admin_made boolean DEFAULT 0 NOT NULL, --set if admin made pick on behalf of user
    PRIMARY KEY (cid,uid,rid)
    FOREIGN KEY (cid,rid) REFERENCES round(cid,rid) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (cid,uid) REFERENCES registration(cid,uid) ON UPDATE CASCADE ON DELETE CASCADE
);

--forum user who will participate in one or more competitions
CREATE TABLE participant (
    uid integer PRIMARY KEY,
    name character varying,
    email character varying COLLATE NOCASE,
    password character varying, --stores bycrpted hash of password;
    last_logon bigint DEFAULT (strftime('%s','now')) NOT NULL, --last time user connected
    member_approve boolean DEFAULT 0 NOT NULL,--Set true if user may approve membership
    global_admin boolean DEFAULT 0 NOT NULL, -- Set true if user is global admin (automatically allows approve membership)
    unlikely boolean DEFAULT 0 NOT NULL, --Set true if this user is unlikely to ever return.  I won't prevent then, but we can use it to check all expected users have re-registerd
    verification_key character varying, --This is 
    -- The bcryted hash of the random pin created when sending verification emails, for lost password, membership verify emails, and email changes. 
    -- (in the case of e-mail changes the new e-mail will be added to the token sent to the verifier so its not necessary to store it here).
    verification_sent bigint DEFAULT (strftime('%s','now')) NOT NULL, -- The time verification sent (so can rate limit and expire old ones). 
    waiting_approval boolean DEFAULT false NOT NULL, --awaiting membership approval
    reason character varying, --the text the user has supplied to endorse their membership or the reason the unlikely flag is set
    remember boolean DEFAULT false NOT NULL --user has agreed to allow cookies to remember their log on
);

CREATE TABLE pick (
    cid integer NOT NULL, -- Competition ID
    uid integer NOT NULL, --User ID.scha
    rid integer NOT NULL, --Round ID
    aid varchar(3) NOT NULL, -- Away Team ID
    comment text, --Comment on the pick and why it was chosen
    pid varchar(3), --ID of Team Picked to Win (NULL for Draw)
    over_selected boolean, --true (=1) if over score is selected
    submit_time bigint DEFAULT (strftime('%s','now')) NOT NULL, --Time of submission
    admin_made boolean DEFAULT 0 NOT NULL, --set if admin made pick on behalf of user
    PRIMARY KEY (cid,uid,rid,aid),
    FOREIGN KEY (cid,rid,aid) REFERENCES match(cid,rid,aid) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (cid,uid) REFERENCES registration(cid,uid) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (cid,pid) REFERENCES team_in_competition(cid,tid) ON UPDATE CASCADE ON DELETE CASCADE
);

--Participant registered for particular competition
CREATE TABLE registration (
    cid integer NOT NULL REFERENCES competition(cid) ON UPDATE CASCADE ON DELETE CASCADE, -- Competition ID
    uid integer NOT NULL REFERENCES participant(uid) ON UPDATE CASCADE ON DELETE CASCADE, --User ID
    agree_time bigint DEFAULT (strftime('%s','now')) , --Time Agreed to Competition Conditions (null if not yet agreed)
    subscribed boolean DEFAULT 0 NOT NULL, --Set if has user wants to receive e-mail notifications of Picks being due
    PRIMARY KEY (cid,uid)
);

-- Round in Competition
CREATE TABLE round (
    cid integer NOT NULL REFERENCES competition(cid) ON UPDATE CASCADE ON DELETE CASCADE, -- Competition ID
    rid integer NOT NULL, --Round Number
    question text, --Bonus Question Text
    comment text, -- Administrator comment on the bonus question
    valid_question boolean DEFAULT 0, --Set once a valid bonus question has been set up
    answer integer, --If not null opid of correct answer to question
    value smallint DEFAULT 1 NOT NULL, --Value given for a correct pick
    bvalue smallint DEFAULT 2 NOT NULL, --Value given for a correct answer to the bonus question
    name character varying, --Name of the Round
    ou_round boolean DEFAULT 0 NOT NULL, --set if over underscores are requested for this round
    deadline bigint, --Time Deadline for submitting answers to bonus questions
    open boolean DEFAULT 0 NOT NULL,  --says whether round is availble for display
    update_date bigint DEFAULT (strftime('%s','now')) NOT NULL, --date of last update other than the update of the results cache
    results_cache text DEFAULT NULL, -- JSON String cache of recent result table
    cache_store_date bigint DEFAULT (strftime('%s','now')),
    PRIMARY KEY (cid,rid)
);

-- Settings used to define various aspects of operation
CREATE TABLE settings (
    name character varying(20) PRIMARY KEY, -- Setting Name
    value integer -- although an Int, We can store strings in here
);
--Styles used throughout the application
CREATE TABLE styles (
    name character varying PRIMARY KEY, --style variable name without the leading double dashes
    style character varying DEFAULT NULL --the value of the style.  Note it could refer to another style using 'var(--my-other-style)'
);


CREATE TABLE team (
    tid varchar(3) PRIMARY KEY,
    name character varying(50) NOT NULL,
    logo character varying(80) DEFAULT NULL,
    url character varying(100) DEFAULT NULL, 
    confid character(3) NOT NULL REFERENCES conference(confid) ON UPDATE CASCADE ON DELETE CASCADE, --Conference ID Team Plays In
    divid character(1) NOT NULL REFERENCES division(divid) ON UPDATE CASCADE ON DELETE CASCADE --Division ID Team Plays In
);

CREATE TABLE team_in_competition (
    cid integer NOT NULL REFERENCES competition(cid) ON UPDATE CASCADE ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED, -- Competition ID
    tid varchar(3) NOT NULL REFERENCES team(tid) ON UPDATE CASCADE ON DELETE CASCADE, --TeamID
    made_playoff boolean DEFAULT 0 NOT NULL, --True if team made playoffs
    points integer DEFAULT 1 NOT NULL, -- points to allocate if successfully chose team to make playoff
    PRIMARY KEY (cid,tid)
);

--Users Pick of WildCard Entries for each conference
CREATE TABLE wildcard_pick (
    cid integer NOT NULL, -- Competition ID
    uid integer NOT NULL, --User ID
    confid character(3) NOT NULL REFERENCES conference(confid) ON UPDATE CASCADE ON DELETE CASCADE, --Conference ID
    opid smallint DEFAULT 1 NOT NULL, -- Either 1 or 2 depending on which wildcard pick for the conference it is
    tid varchar(3) NOT NULL, --Pick
    submit_time bigint DEFAULT (strftime('%s','now')) NOT NULL, --Time of Submission
    admin_made boolean DEFAULT 0 NOT NULL, --set if admin made pick on behalf of user
    PRIMARY KEY(cid,uid,confid,opid)
    FOREIGN KEY (cid,uid) REFERENCES registration(cid,uid) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (cid,tid) REFERENCES team_in_competition(cid,tid)
);

-- END OF TABLES -------------------------------------------------------------------------------------------------

-- START VIEWS ----------------------------------------------------

--points user scored in a match from the pick and over/under question (if present)
CREATE VIEW match_score AS
 SELECT m.cid, m.rid, m.aid, u.uid, 
        CASE
            WHEN p.uid IS NULL THEN 0
            ELSE r.value + 
	      CASE
		WHEN p.pid = m.hid AND m.underdog > 0 THEN m.underdog
		WHEN p.pid = m.aid AND m.underdog < 0 THEN -m.underdog
		ELSE 0
	      END
        END AS pscore, 
        CASE
            WHEN o.uid IS NULL THEN 0
            ELSE 1
        END * r.value AS oscore
   FROM registration u
   JOIN match m USING(cid)
   JOIN round r USING (cid,rid)
   LEFT JOIN pick p ON  p.cid = m.cid AND p.rid = m.rid AND p.aid = m.aid AND p.uid = u.uid
	AND ((m.hscore >= m.ascore AND p.pid = m.hid) OR (m.hscore <= m.ascore AND p.pid = m.aid))
   LEFT JOIN pick o ON  o.cid = m.cid AND o.rid = m.rid AND o.aid = m.aid AND o.uid = u.uid AND r.ou_round = 1
 	AND (CAST((m.hscore + m.ascore) AS REAL) > (CAST( m.combined_score AS REAL) + 0.5)) == o.over_selected 
  WHERE r.open = 1 AND m.open = 1;

-- Points scored in round by user answering the bonus question
CREATE VIEW bonus_score AS
    SELECT r.cid,r.rid, u.uid, (CASE WHEN p.uid IS NULL THEN 0 ELSE 1 END * r.bvalue) AS score
	FROM ((registration u JOIN round r USING(cid) )
	LEFT JOIN option_pick p ON ((((p.cid = r.cid) AND (p.rid = r.rid) AND (p.uid = u.uid) AND (p.opid = r.answer)) AND (r.valid_question = 1))))
	WHERE r.open = 1 ;
	
--used to identify teams a user has picked correctly
CREATE VIEW playoff_picks AS
	SELECT cid,tid, uid, confid,admin_made,submit_time
		FROM wildcard_pick
	UNION ALL
	SELECT cid,tid,uid, confid,admin_made,submit_time
		FROM div_winner_pick;

-- Score user makes in correctly guessing the playoffs
CREATE VIEW playoff_score AS
	SELECT 
	    u.cid,u.uid, sum(CASE WHEN p.points IS NULL THEN 0 ELSE p.points END) AS score, c.confid
	FROM 
	  registration u,
	  conference c
	  LEFT JOIN (playoff_picks p JOIN team_in_competition t ON p.cid = t.cid AND p.tid = t.tid AND t.made_playoff = 1) AS p
	    USING (cid,uid,confid)
	  GROUP BY u.cid,u.uid, c.confid;

--  Get total score for the round by user 
CREATE VIEW round_score AS
SELECT r.cid,r.rid, r.uid, sum(
        CASE
            WHEN m.pscore IS NULL THEN 0
            ELSE m.pscore
        END) AS pscore, sum(
        CASE
            WHEN m.oscore IS NULL THEN 0
            ELSE m.oscore
        END) AS oscore, sum(
        CASE
            WHEN m.pscore IS NULL THEN 0
            ELSE m.pscore
        END + 
        CASE
            WHEN m.oscore IS NULL THEN 0
            ELSE m.oscore
        END) AS mscore, r.score AS bscore, sum(
        CASE
            WHEN m.pscore IS NULL THEN 0
            ELSE m.pscore
        END + 
        CASE
            WHEN m.oscore IS NULL THEN 0
            ELSE m.oscore
        END) + r.score AS score
   FROM bonus_score r 
   LEFT JOIN match_score m USING (cid,rid, uid)
  GROUP BY r.cid,r.rid, r.uid, r.score;

-- END OF VIEWS ------------------------------------------------------------------
-- STANDARD DATA

INSERT INTO conference(confid, name) VALUES ('AFC','American Football Conference');
INSERT INTO conference(confid, name) VALUES ('NFC','National Football Conference');

INSERT INTO division (divid, name)  VALUES ('N','North');
INSERT INTO division (divid, name)  VALUES ('E','East');
INSERT INTO division (divid, name)  VALUES ('S','South');
INSERT INTO division (divid, name)  VALUES ('W','West');

INSERT INTO team (tid, name, logo,  confid, divid) VALUES('NE','New England Patriots','R0lGODlhMgAyAOYAAKOruuPm62Ryi9JKWYeSpltqhP///wEYQcciNPPj5CpDheSmrThLa8zR4ZyltMkvPMQKG5GaqjRMi8PJ29TU1d3b3N56hcnKzdfT37kABbW+1fXU177E2OmfpsLF0kZdltnd5cQXK2x5kNXa4iQ5XPHIy2p8qrzAyNPK1ayzwXmJs8XK1RQrUau1z+rDyVJmnA0lTNpqeMvN3YuZvQARPHiFnAkhSaaxzGBuiHOBmNTM2s3S3MAAFNHW40RVck1derjB1+yzt9tyfHWAk01imthjb5Wiw7C40EpZduqssZGewIiXuzpRjhswVvvy8p2px3CBri5CZNVdZ8w1RuWYoG98lA0iSig8XxEpTwwkSwUeRr7F02BzpR5AZFJifXyIntW9ydPY39fW19jY17/H2rtoec7P0eTi4Ort8u3P0+74+ppsgN+AifPO0JSesNzf6iZAg9rFz0BXkoSQpD1Obj9Sck1Kad/J1IKQt4aUuv38/JunxuGGj0ZYdi9IiCQ+giH5BAAAAAAALAAAAAAyADIAAAf/gH5/g4SFhoeIiYqEfoKLj5CRf42SlZaMjpeaj5Sbnomdn6KYo6WTmaaeoambq6yXrq+VsbKRtLWcqLi2upJwTC9QSi0cE2QcxRNATypEvYa3iQpEUEYccS4oEV8iOAUFAlVzDic7LVBMitGECnImNzouVEVTIRBrBzQH+/z7WiQ4UvR48kKCAgV+0p1SJIGLERlpOkhBwCODxQw8ynRhAcMGjI8gbWjZd6WGhx7GevQYFEqBhA8mjEy4s6DIAwgXISAYwCbIBicjPDjwgiULyKNatNCwcoXBlRxkWDraIwPMAgsDblrkEWKAhSQb9BgwUIKPBRxN0mI5+jELCx8w/wQwoKE0BRSpg44kSMImRgwhbKj4dDLWSRsqUkJYhGCHhg1/RpFW2aGnhhUtUUBIwPsHzgcuKpYomaHChAYDbTrEGIAgBIIpA4R0qDACxAo3P1hE/ngAydgANQ7kaEFqkQQ8RzygQKEDQwM0Y9WESTFHhIACVzx+tNHEwRwQBA7YWMGlOCSXEtL70YCGQJR8/XbbsLGWBp0aNOr0UGD+khwVR2wRAQP7yKdFEySwINKBNBCgRCHrRCLHEg2k0McBWnTURARmAEAHZljQwEIYRED4jCZ+QNEAAFeIZ0MEZxRAwg8XMDDZE9CcuIkCS4CAwwE/+CAABWNUIIYIb5SYo4ssRPQQQQFiDAEjkThswd+SskhwBAA+nHBCBR78EMUISpqICxw3eEiBGBHQsUULCpl55g0OIFGBA1UAAYqOpSigQQ0iXJDnnrsMIkEDOCABwIOIRFjKByMAMMFmjfKZSh4cvKCOpYXK2Skkjn66kKi5kFqqqZuimqqqlbLaqqtYwtqfrKF+WmunfgQCADs=','AFC','E');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('NYG','New York Giants','R0lGODlhMgAyAOYAAKIlSeatuu/L1XMZRrsqUCs/cyNLfjk8b1lIdbcWQOzCy5MbQv35+tNuhps2WqoJLnRIcpsKNzxMfeOgs4gaQyNbi8A6V043aNmBmrgyWIIfTPHQ2BhJfWpRe/nq7QdIfidOgNd5ksxZddqJm9mCl5A8ZhFNgeq9x/79/XM3ZrorSpssUs5feVknW+7F0BpRg9Nxh8tSckhMevLV3dh9lQpMgY5MceKdrm41YpomTMNDZvDN13UnWGo4Z+q+x+Sqt/jm6uCaqosUQW9Mds9nfp0bQ9Z5j8dJZvPa3/Xd4dRwi7AjSGFgiB0+ceq5xmEjV3Q9aZMYQshJbNVyjuGbrOSktsdIasE+YeKjsfvw8mU9az9Cc4ocRTBYhzhhjrkkRv329+ewvuOjteOnteSns3RYfllTf3oeUP77+92Ro5MeSJsSQOm5w+GdrGYyYfbg5Wc8ZoEjT2o8ajNHea4rTdNyiNR0ioUvWHg5Z3I7ZWhEb3ohTvrs7xBShv///wNJfyH5BAAAAAAALAAAAAAyADIAAAf/gH1/g4SFhoeIiYqEfYKLj5CRf42SlZaMjpeaj5Sbnomdn6KYo6WTmaaenU8Dra6uFxxaQlxcQjwShCCvvG41gwe8A0+DnWsYVRPKylVEEUVEYQI7JyNfEL8yBGLLzCE5JoMtUskTVRhrxY5RM37u735kKgrw7m8WZX8SVvXuAivh/rQIAW9GFHWDogjo5ycJEIZ+kCx5IUEHQx8AxU2BJ+DgqYQbIIr0I0LGHH79TjgI2GLju44I/0SQIqINmnoMsBj5gaKeHQQHEsQIcvOdj5UaOXrsJAMBgiJj4DFgwQWOGhg939Xp8IKJmSg/4B1l6dLfUlR/oBiBxybjCwAu/+DB6ECoBw2xSAWW9QPzY6EUd98FKUEoTth3c+uSwEtWaUxCgOFRIfzng4YAcukO6rHYaN6Wjv1CDuxu8iDLmBFr/sOZcdKXZw1Ffme68uXMil3rDR1q0OzSlFHj3tzZ3djX7nYseOybtJ/awlXn9tz43YbloptLDn5bOnHdoK1j7/3n93Puqd0l/v5OJUsl8K4zL+8cend3DVa3fqcg4x8IDcQ3Hlrm2ZeeHzAMMZ07WVighwFbAOCDgPMViJ5YRfCAAwdyFOcOEkfQkQEW9ciXHX3bnXafOwrQ8AAHCBDBkAcM9GMieRaqGEY/aCzBQRcq8DEShSfmOMgdbfSTBf8dTfxhAwsi1ShehQSh0NNghDBhwQxogOElA0As0WQFK4iQBE4jjEAkeRB8ocMVV+iggg2E1ACBiBnkmecaTf7xAhR0xDDCDwGQcMUDdqyJFggSNOpoF4YYUMCklBbwQSEgXJDHHgPgIMEQAU55YiqIgKqoIS+AoOqqrLbq6quqGiBBEYe5cyNaECRAwK689urrr8DuakEaJQ4omxJ8eKDsssw26+yzHoDRzw6x/YXBkNhm64cTQlTonLbgwsOCgkVeG+65fqAwAgAVzIcHCwK4IO+89NZr7730OnHDETl4QUohCNBCwcAEF2zwwQgbfAYCAc1HqiXkPVxJxBJHQnEUxZyghTEkF28MisYeK9JxyIb0EQgAOw==','NFC','E');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('TEN','Tennessee Titans','R0lGODlhMgAyAOYAAJW4132InElZdszR2VuJx63J43xIYtXa4wIaQwsjS4aUpuny/LvJ1k8YOm8LLGZzi7a9yHCNt3SlzbzT5qSrt8ja9DkzVgISOxw4ZFNlfm8rUdYAGDVHaIy01llpgjVVh////hMrUszd69ni7bfO5qAMKIwNK2lXc+Tq8SRCc3qp0Nrm8Ze55itBaK62wbYCHJyjs5GZqqbD4uDj6NTf6ktyqmmU08HW6MTJ1BkiSZYBGcLT4wMmT8Xb6kVnmSM7ZN7q+97o9fr7+W6d3sLO2rzCzixTiGufysvP03J/lqe820l5s4ikyy4PNcTIzISv02SR0EhsofLy9EJffs3Y5Dddki4eQz5rpBkyXWl3j2KNy93g5s/e81R7tXaf2ChMgT9jl4GQo2Buh8/h7pOfsFOCv21jfO/w8A8tW/f4+cnT38fX7pu+2zhPcJOszp2zwv38+8/h9EJUc11IdVZIZV2Pzk9eeWuY11ByonWYymWa2rvT9Nbi8YFyinCizGidySH5BAAAAAAALAAAAAAyADIAAAf/gH5/g4SFhoeIiYqEfoKLj5CRf42SlZaMjpeaj5Sbnomdn6KYo6WTmaaeoambnRIdMhNqO0QTPT0AqKykfx0rIEUZHHQGZmFENyqERyoqup+dfk9sOxByFw4vDjkeAwVsE1Q4RTc9HaWrg74PCA0bJRchEFJZOU0OJicMJEd/rwBPni1KN0jCCDkIHGxwgCCBiy0u7ITQoKOBAiBjULiA4YKIOUkEB7EpggbLiw0NeMgDAeKBkTk6HDxAAYLMBTQpBLi4IQFSSAm/BHyxoGNhjgQPIDwIUedDgws/xAi4UMXGFSxZiIgooAyUQAlqZkBAsyRFAwfbLlxAgODDkDJV/36UNFIGihcbRlK0SaKGhMCQRxhkAZEFTZk6S2oorhHlQ4IvXbRAIWBDRgU+NGgE4QLAB5YkNJ4cCvnnRosAIBT8+BD5zpA7Nu50CdGwCosgStv8sNDCDpkVJL5woALAEOkCSS5kmbGFXYgUYChDsUGgShUSAwSwbecgAYILWGAswPODimheh54UcdAEzZQ23r+HiHJHMpQKEEJcSJCgwclt3l3wwAJRtDFCJqT9MUEfOpjQxA9VXFHDB7RFQZ0MTnjHH38lvJDShsotkEIABaB3iARjmKHDCy+UoIEPemiRQggEeIFCC2tth0ATO+r4nQtKYHBAT6csosIYZFhw1v8LOrRQhw1YVLEHGQhkYOWVWF7pwQ8tBGFEGGwMkuAgR7AhwhtT5IBWCnc0BgQHCODAEktCzHCGEHOyZMcFEEQgRw9iCnTIEQCsoEYSVlzgAxR5HKBfGEIoEEAMAzghBQg4BBDAAFvoF4AMLVARaCUSLABCflgQwEIR3nGQ3FoUIHEGCB6o5SpbYqzxAxGjVtKDAgMgVAMLEDS0oXcBICFFGnAei4AHXOzaqyQkiLFfAsPiwB8PCRz1LBJCOMpfDtwi8ICuvBZZyRPaflCDFl44asVZKSHAgROnIsCtCQ00gIACSoQ6rSQTJMGmDVrwoV0JG5hgRQIhuABHAA35t4H/FXFGIMANA0fihwhZYLBEHQW40IQJHnobQxoIJWBFCSU0IAAQKcRQnLqWSCACBS2kUMMCdrRDrnfLYbFtAzkgMAATGNDgyJiLsEEDBSFEgMIPxnpnBwTHJnABGVxgEYMMJl5yhAwu8ADADBxcm4CrGzZEBhBf2DFGPx1rMkEMPDCxQABYrAXxdwgIgEQcwtHQVd5mTwBDCD5UMAIFDwggRwZhDBAEE2jYMcJ5ZXtSABJyoOGDGyRwwcUaSkSQgth8LB66J0+IUIQYLWCgOwY/yBEDDTLgbZygtBcgghoMMEAEFTfkogjUuzxPfPQDTU+9V9dfAn32hWzPPePfI+L9Cffjc19+9n4EAgA7','AFC','S');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('IND','Indianapolis Colts','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','AFC','S');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('DAL','Dallas Cowboys','R0lGODlhMgAyAOYAAKuzwVNig8TJ1LvCzgANOHJ9llFhfnmGnLG5xiQ1Y36JoaKpukNTcs3R2tbb4ZyktYqUq01cexUkS5GbrmVxi7W8yISOptHW3nyGoR0xVio8Ylpmg214kjJEZk9dgpWesSI0WVxpi4KMpGhzjio5XXiDnjxLdYKMoY6Yq3aBnWJuioSOowUeRmp2kOLl6kVTegkaRA4mTYGKoIWRpTtMbb7F0G17lDFBbWx2kWl0lCExVxotUri+y3eCmgoiSjREbkFObjZIanyInoGKpAAYQT5Nb8rP2G99lRUrUXyHngAWP8DG0iw8aEhYdj1JanmDmg4iSjZGcD9RcHWDmTtJajA+YRgqWp6ouGVxkYuUp4eRqBssXGNvkDlKbC1CZEtWdSQ6XQIaQwskSg0fSAMcRB0vXoCJn15sh0hXfVlmiThHcXWBma+3xdzg5iY3Zf///xAaQyApUGx4lhcpWqatvX6Em/Dx9PT2+HJ/mAcfRw0kSxorXMjN1w0lTCIzYRYoWSH5BAAAAAAALAAAAAAyADIAAAf/gH5/g4SFhoeIiYqEfoKLj5CRf42SlZaMjpeaj5SbhGhMnpiigx9ppJOZm24fFqidnhE0RwmksJsKYTRotqqXfhZQGRi9ogFFK0BPZaK3lyU6LigdHs2+lQk9Um1LOsSezpUBQCgtVww9tZvhkhgZAjsqE1TV69eRfnhfNUpgAhkKwN2DFIDGBAVKyCCIsEbdr4GPoF0IwoJIiwc0AtjTVGZNEz4+fOQBY4REio1/3CQow7Kly5ZbQtD4gIJIHzEseERIcoPJj59AgwI1oWZQpxAVOIywMUKF06dQNyBp0IVFnz5EpjzY0aIFBxxgwX5tUeBAgR4DsBjN5OFEDAIR/8wUeCLDjN27dSpUCBPjKgsNDiacWEG48AwzT1YEIBCjh4lRjCA00VHhzQIOBzJrztyBRd+rPgzgOUIaz5TTI07cQaAjQokthcJh6QGHwwUDBJQQ2b1bSZ7PV/uE4c1bCYEiFTbAKVEv9r0oEEB0cLAgBhHgwbNr72O9zwQeJKpYCHWI3R8rJQKMoTNRiZjt8GP4UCJFQBIYI7goMj/Ig4IYFLhwBBG/wRdcDGTkocASRWQgQlH7QTQIE1p0UIURAOxABnbZWefFAA9AEUEKe3AiISFyjCDBFQ10ZiALBjSgYhLNLcKfIdApwUcANsFHhAITSACBQyZWYkEVA8j3ov8XCIBQQiU3FvJDBAVMoMRnMeRR4FVksAFEASXicyKKJLARQRjciaGEFxoQoQd3SgihBQMvSBIlIRaQUAMSPsRQkQ0OXHCGb34GwYOTdo75BxMbjDCBTUqAAMASGnQgwBVIECFGHhXQkIIVYkYiBwhsGKCEEhs4cAIUNrQARRZGNHHqClkw8Bgkd1qR5wBjIMFiFyRocUMUFujAgBEzwNDBAACF+sgNG5whghMXfDDGGScNYkUKBkiwQA0asOHEGrAV+UgIJCwgQANf7KBFnYagIYIEGwhwQRK24jqmBSDYsYAEBmAwUAJDfBEHAA2AUIC+jzDRQhAbSKCARo+k0QNMvSCsMIe5ioTgBQFSWOCGJEyI0AUBBtwa4SMYQFGAfpfkwEEGcnCMyA0PiHCDJ9AtIOGNEQwBqihblLDzyqgkfWfSDDNdjNPWQN1MIAA7','NFC','E');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('WAS','Washington Redskins','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','NFC','E');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('SEA','Seattle Seahawks','R0lGODlhMgAyAOYAADRKdCg2SztGWZait2l1hMnO0yZlHb3Cy5mluYmSnQACGn2Lpuzt8JCYpLO6wr7F0VJcbdXX3oaTrsPJ0+nr7ktVZ3N7iYOMmURcXAALJAISKDlOd8vQ1xkhOFpsjpmhrEteg3yHlLK6ykhRYxQ/GmRufQsaMVhhcS5bPKGosvT196qzxF5mdxsqQJWcqJ6pvKKtwDI2VaWstWR1lamwuba+yldqjEROYCQ8aMHHzk1WaEFWfaGrvn2El660vYiOmhAeNTY7TpykroCJln6IlCIwRnmHowoULHKBnpmgqy9GcJKetHeCj1NliU5hhmh5lwMYLuTn7JijuE9aa219m6OrtcbM1+/w8p2irFtkdOPn7F5vkaWrtbi/zLm/x8HH1UOgFHR7ksjN2IGOqEBNYC47UFdfb0VWaPz9/WZngJmeqXaFoVBjh19qeStDQZegqoyYsff5+5+nsK+yuqyzvFhkdilAbFpjc19wkeDj6eHj5+Pm6ebo6kZagP///zxReSH5BAAAAAAALAAAAAAyADIAAAf/gH1/g4SFhoeIiYqEfYKLj5CRf42SlZaMjpeaj5Sbnomdn6KYo6WTmaaeoambq6yXrq+VsbKRtLWcqLi2uru5iB4iIL6GtDAyEzAIy8zNzggvLwhLRjY7krEeXhktI1PfOhXi4+IjN+cjIzosIT4TRryHIhAZGhn3+PkZCgoZRxr8+t3TEEDIChu9Crma4UMDlIcQI0Kpd4KGAxopqlwQYM/hPQtcajyAQeVaMV0PyGSQKFGBgBwcLBQBUqRMGhdC6gCpBxAIlABZ3jyQ4kQhKipqBOrDp8ECgx9HFJhx0CADCSgxeiQoQQZIEhktACroQMAKElKErJQIIqCt27Y3/1g42DNFwRE6fvzoUADGABQNQM4AGZL3SoE3FfYVmYBnUCgjKvJoiUK5MmUKebEocOjUT4MgblCgwHDARZEreVOjSQFEwY0ajh3t4PCkiY3buHM/6eJHxs4MZYik+NAjTI8GJTrMSc3czw8FJrrEHrSAhx0A2LNrB6BECZw4BYoA7NCGyJAQIZgw4dCceQENGhxM//PABoBIOGBQaJEhC4UIPwyRgAtqCFGFAwXw0d4BGRTxwHxW/LEBJBv0EcEJCkDgRwIBNOBDCkkI8UEDIRBAwAU06JHaBQq0gcB8X2xhR3c01kgjDhJEcI8DP2QghAVR9QNYC2WMwEIdZ1hQAJ4DARyRQxPzzRDBC2MsYOWVWC6wxgoq/HACARCcUEKYd2RxxwknmKGDAAEEUEYRNSmQwBJo/QGCEUtIMcCefPbp5xJ+BioFDCJ0cYAcRSgwxYN1EmPnABYEIQYbRjlaiBQfPODBSZYOMgMFIhTFaadIPDADIrd02qiqh6TKqquqwtqprJbS6qitxODqi6678IqLr7UAK4uwrxDLSh+BAAA7','NFC','W');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('ATL','Atlanta Falcons','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','NFC','S');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('CIN','Cincinnati Bengals','R0lGODlhMgAyAOYAAHIjDtHR0ThLZO86CvWCZMTK0v9PIC0NBa9rWvvd1aKrt/ebg/BJHetJHthDGxowTXSClPL09fJEFvzVy4yXplJSUvrEtvyrlPz8/WZ0iPZsR4uLi+FFHHd3dp2ns7c5GOnr7sTExNjY2VAZCvKUe/qhir3Dy+fn5+9CFczO0KmyvURWbvnp5QwNDfZMH7KEeZaWlrS7xcQ9GVNkeoYqEf/29RkaGtzg5PV+Xfn6+mIcCfBGGSgpKflNH/5SJOhHHPhBEBYHA/aNcf7t6f1DEuTX0/tOH6s1FSQ5VUJCQvBOI54yFvFVLPNiPP7g12lraz09PZctEcM0DvydhPRLH/3n4fFaMv9LG9uomoCMnPFAEe8+D85AGtzf5AggQP/8/NHW2/BIHPDy9P6DYedBFbYtCf5ADV05MPi3pc3S2KU9Itfb4Pf4+fJLHv7z8P9zS//7+uHj5+bo68YvCPqwntA1DNE/F5YrDu9OI/X29/FRJxMpSPBKHv///wAAAAYePiH5BAAAAAAALAAAAAAyADIAAAf/gHt/g4SFhoeIiYqEe4KLj5CRf42SlZaMjpeaj5Sbnomdn6KYo6WTmaaeoambq4QCBbGys7S1tCYqFDNIiq6DHn0nKQEpRU4JyAnHwwHNzcXHylVuGGIFELyHvitsOUkt4DQ+SuR4Pkvg6ekf4+RMTWNYN31xGdqof14mfTB+/n53ruwYuOOKjn8ID/wgOFCClgMtNuToQ8FLIVcZgvFA+MEIn49tXBxA+A+AgY8oDdD4V4FNH3ukCD1Y06cDwiBcPH7swSEISX8dUfLp4cDnvw59QGQ7VShLHxEtbjrogdKIjJ9+DjRwIdTAQYQtAryM+UeAGAwVSAbhwPWjgSNY/3WcRNmDi1GEG/p4iOlFRZ8QNmxE9aewLR8DUf4FDqyGyI6UALA+6RMj5goxYuKIOCFiY9YfhlX649HlhGkWdJSE4eOi588gL/qoiIlEgG0Bafqk9RMENGR/SfoIHy5ky+GVJA/MudAnC9lCwHavDR3ZD5Thw0tsodJjZEI7VybkEPCckALd/oJM/e0nOPYaGlBYVcvFjBC9F/ENOr/bjwydh1XHAwwbbIDFBfEdd5MUZuDgRgEP5IcIf/8cMVeAP0kBBAo7jYBQFG+g8UUM+PjyB4X+0HChaDdxQMVHrd2lwxVCTNBHAeRJeAiKfpiU0hLJoSDBakZ88I9WLqCAAv8BQ0QA0yAm8nhAG218VKQ/LfDAwxkaNBHGDiz6YeFHYWzRRBU5zFDefuil50BbdfkEBQY55PBFDRYwYZA/IxhRJUoD4PBFHBEytWMfCCA0JmsNjHQddn2QAISH/gH40UA2QgClIxYR4tcYX/khV1UePoqddiPpYClKW5TQhwmbDgKBCioooEIEfeAAhHdavaigqcINoQEZI31woVBb3AdGrH/MIFwCJCwghBJEeRcUH1e28EQHL5RAQhMS9HSAC38KxccWC/SxrKF/ADOEFQNssZoBMvg0Kmuu+aMDEVugEKOK5n7EgBYWvMrsH0iA0IcFKDCQUr3T8dGGEaHeG6PbDFQFjIIVQ1B08B8Q9PEFDsY9HISPhwHJp05UcDDCD74KxcAAdPSRR46r7JFbAgw8lhIXI7yJr1EHZNzGD0dQae4OAwjxhccfN4tBpCVXxYEDvnpFWAMx/7D0FjssAAdlmbjSVx9DMBHvFmxvoYUWbRNRxj91ANE23HfrQYCNeqHii1kLR7vA4IQTPsUCHSROwuGFD36BBVX0wYYJahpiYhZydKH55px3rvkanndxwxoFKACBAJ1arh8rlZjIeiSuv87J6rLPXvslsd+OSO66q967JLz/HrXwuwcCADs=','AFC','N');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('MIA','Miami Dolphins','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','AFC','E');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('CAR','Carolina Panthers','R0lGODlhMgAyAOYAAEt5lbjEyGfG5xio27a9wQah2AVWh7va5Li4tzl1mQJnpomoujp6oAEiNUm64tbX2InS6gtknGqSqqeqq7rN0hZmlEpKSlRUVLvj8aLT5DdRYidslQB+x3h6fNDi5197jQQFBufm5gFHdKfL1yat3YXP6MjLzKrR3sTW22JiYjq14AlGaVrB5QE2WBkYGKzV5CgnJz6DrANelTU0NFtbWxthiwCAzrLS3AEZJ6S1vG3I6JiYmAA+aAEyTnmTpCNki5y3w3zL5gIsRABtsqavsyw7RKnc7JPV6gETHZ2hpSyw3lSAmXqiuJ7a7hpZgWVbVnjM6QBPhAELEQ5yrp7F02xsbE9OTpzV6Daz3wB0uwAwUz89O4WFhXLK6ACM3XNtakJBQJ+dnB4eHeDy+Sp1oz1xkUdQVCYiH67Ax8/Y3B5woQ0MChISEo2gq2mHmoufqlmYvC+CtUh/oGOJoZ7S4gCK4ZzP4RIuPhI7Vk2Nsl+QrLCvrgSh2A2k2QAAAACf1yH5BAAAAAAALAAAAAAyADIAAAf/gH1/g4SFhoeIiYqEfYKLj5CRf42SlZaMjpeaj5Sbnomdn6KYo6WTmaaeoambq6yXrq+VsbKRtLWcqJp9SiwlGS8nI1RUIyd2QQ4Di7eKSlACXUc3OQtwMRsVBtsGNWR5TEAZXQ5YBYbNiQ4hPhJyFTIiLQ1IUiB+IFJSOEI8URsSFqTBgk4XpD4HfkS500CKn4d+YFi5wAYiCBgwGmiJAmRZoXSJVJhwgmcNxIcg1qSgUdHPjBRi/IiQ0OUQyEMkSgRIMMTAnTNbLFy4YAHGvQt7drjwI8bJghdBSHw0qGgABDRyovRgU6PIDDBWaFTpcOGemDBVQICw8uFDGAQe/1SQisQCxRwZWu6B6Ao2xdgOS08+BAOgwx4EDzCcOwVpgJEJaqIgQemiQpEtNFKkGBrTCpcOXKz4uZPAxI0AAUKwGARSBQo3CngIZrNBwwwX9yxOgJliD4gWTHT8GeAAQhPWVAmxMFFmSA/Ba9jcESEYYpWKLr7gqIDC4yCPzaAgqJClgZ99uSGKEFLdD24/a1yIWFAT0S0IEyJwwOGnQQ+Hgv1mXnsPacHAAcnRAkESCuznhxAipFcdEhJa1MMGKCihSCwlMGgDf0IoACCBJCJRAQVybaiLDvl50YIUQnAwIIkn6ZMbEj+8kEshLBAQQR02DJGFDTYoIEMUPDRUXek+DyGBxBYwuGCGEzckhxwhWBCwQgQblAHAEmDKwQAZUwwxhAwvQiTEZH4g0cMZTzwxgwFVMuMICWMgkAMFJ2RwxRGAXpHBDRTk4EMMUyggAg5SUAfRCvL0IEIE3dk5iA4lOEDCYvZhoYMRAfhAhgJGjthfD1kkQEQTnNrnSKuRDCDAAUQAEIGiDaTHgx4Y8LHjJ3yoAEEAbyQggwFJStFCHB7AapOVlgzAwhVotKEHAzXI8MMDGlrKCnFQ0CHMCBikqCIusECL7rPrzqJuu3PB+6u83tJ7rr334uuqvqC8K+9N//oLbx+BAAA7','NFC','S');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('TB','Tampa Bay Buccaneers','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' ,'NFC','S');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('BUF','Buffalo Bills','R0lGODlhMgAyAOYAAMi4x9hKV74AFF6CsKuOptIsONVodMvW5QAredbj76R/mUVtotOotHSSuhZXmSJSkXGOtmuLtf37+tp6hFV7qwtCh5yyztQ1QypYlRxNjjNsppmNqrvK3bF4j7oABtdXZGOFstHBz+bs8zVhmwA5go6mxztlnZKpyXmWvKa50oahw67A10typcUcKwNDiyNhnxBGidEYKbXF2g1DiCxopNqSnMuEk8EOIjJfmcMAEll/rr8AHKy+1rqDmHyZvgE+hqq81QY+hJWsyrLG2oSewomixIqMrRVJi8gCF6e60wA1f5mvzc0NHyFLjQg/hYukxT1on8kFGlF3qUN3rQpMkTxyqg9RlaS30cDN37fH3LDA18NsfwQ8gwE8hLDB2BBCh32HrIOPshhHjICbwC5cl+ayuB9enQhAhvzKyWCKt2iHsb4AD6SsxKm2zri3y9djcNhve7+Ro1p4p5evzAU6gh9QkNQhMbq80Et2qdF9jcN9kdbf66i71A9FiSVUkhlLjCH5BAAAAAAALAAAAAAyADIAAAf/gH5/g4SFhoeIiYqEfoKLj5CRf42SlZaMjpeaj5Sbnomdn6KYo6WTmaaeoambq6yXrqYjKCpXBytCEBmKsZ8ZC0UHfAtQjRRFK2SgqJ8YDXxCOhgzXVxOTiRKUhwYiL2WGGNeEXUkJGczferrSiw8ZLuF35IgHBEzSmfr+/tKKDIphLAgtemBBQt/SMyAwa+hugowjoxIEWHQPEUZWGR5QsKJw4/qZswgcSSLRWaQWHixYMIJxHUMQ4qsUOGMkyA/upibEeTKyUpkLMzBQYKLyBkVbnZZ+sOFCypWHLygUQWPHAhE/JwB8jPSgCtQlJBwClWqhik60kAIY2SDgg5b/7YY+BAAjQQfdOp46eoNBxQWJRKk0bG2LYEeevJMmBvggp0YTJggyZFjjYcCElaYg+LzlCEpbdwAAMCAQY0Jb+heKPBYMuU1awTIlg07BxImdi68kaDC3IAGfP/UCXHhxo4dAmArny3gOPLZlKPEuBDgw5YeBIxEgIJFhRIuPEwEbwDHg/Pz55OvySE9dwA4NghsgEBBgxkHVFx0UUJhgBIIKhD0BwYhGJdebVEwMd0H8MWxARgDTGFffj/8cAZNIvUBQxAkjLBCPJ4NckIAHix3QwEBvJFHHNmpQUEVL1jh1A9ccIGOhjAclc5DCBChgzyOLFBGCxd8MEENDIRwR/+ENDjgQjZKiGXOlC+FVMEMTlwIwxl1UJDFA0AOIgQAbJyAgg7FDIFDlEpUQMYCUlDAAg4U+ODDE0JQUMFDdTRARBJAjKBEBliUAIUhnWBQhyEloKBEFzj4YEEJfIgwxxNJLCGFBSJE8MCe+EAwADAqLNAEDxR4g9IfGZzwRJs+AKHDF1CssEAhI2ghBgJKBFHBEQPw4AQOKhThQwLAqXqIhw0o8QcPDQSBAAhe4GCICnNGEEEDY5xQRAYI/CYDB7cuYwgGMpjgrAw6KOHECUIsWggGB2RxAgQHKFOBs2rIQCeYvDCDQgQIkMABDwjolawhs1gLxRMmELEEEHyg0A2IJKFkoAYfX1SwxB514JBFqo+ccMATOrAATyWh4HDAF3UAIQIOX2Ah3iO/KNNKJhGggIAFKCwxLQqvmDuIDxDAkMIDKSzAw6pFh1IHDxYAR0YCJxRt9CAmHHAzCyNorSwhGaDgSAYgii2g2pFcxDaiUL99iNtyB1f31nfjnffcce9Nd91/y+1HIAA7','AFC','E');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('PHI','Philadelphia Eagles','R0lGODlhMgAyAOYAAN3g46vCx0hJSnaTmXh4eZaZmkNdZCJbYtvc3M3R1UZ0e1uDiJq1ujc4OcXJzNDT1ic6QRRET2GIjtve4Ozr7OTq7NPX2VV7gaa+whdSWf79/YWCgsrO0ZCVluLj48LDxQZFTdXa3ScnKAQGCJ+5vXqboPHx8TZSWgcUGaS7v7bIzKKjpG2SmVlcXRISE/n6+iczNpKus8fMzmNkZaysrYyLiyhES8PHyTJnbVJUVY2mqx4fIPP09F1gYouprmxsbTNCRzlrc7Kxskdja2x5fLDHy2mKkSVKU4amqr2+wCxRWgMkLAlIT6uusBgzPAYaIYCepC9faLO2uL7BxBQsMqepqg4lLY+rsGdpak5VV5ueoIKjp+Tm5+3v8H9/gQMNEU1NTjAwMPDy9Pv8/LS3ukFocvL4+qCfnw4xPB9GUcnX2SEuM46QkpuzuNDPz8HS0/b2973P0kBAQbzNz3FxcmZnamlnZ4KFh4eJi4mGhXGMkg45RA1LUgAAAP///wBBSSH5BAAAAAAALAAAAAAyADIAAAf/gHx/g4SFhoeIiYqEfIKLj5CRf42SlZaMjpeaj5Sbnomdn6KYo6WTmaaeoambq6yXrq9/IDgHhCAZQSwYDIOxnyCFB0ZzbRl8ClsYMSxROgu+qMAKOH8ZEik6bRVQMTESUXtPX3spwaejIBdvMRckKRcRQQEDSlYjffl9XyXQ0cALSEx4QWKBjS8jnlBB0cdFGDA/ZuA7QqLQL0ggFgSQoGDACSA9wvSB0cLLig8WAACoUGfflWqkLikIYATNEwg9hDw4U8ABBT9+eHAJkcBCFXwXAiiAAvNiogMMBlAZ2QEBUBM8gPoZI6YCAAshbohcwmKAETUZ/kUCUSKGjSx2/1aY0Eq3ywMyWu4QwBIyH0IUUBTEfBQlwBAIQjS8oOvnBYIqBHrkECCnspwGYUTgG3GhhEVpiC5goNLipx8PCBaPQZCEBo0bCLhU4PI1AQcLK/ApIXFOrSIJPlBsAPqgZ9bGFOAAHdPFA4AJISxw4OBApBMMaT8vWgDlSx6gNXpYZQz0BQWiCRI8WM9BQB8rDKIccmqkxIjhD2aEAbCV8eomd/zQQw8z0HHHCmD0sQQDKWSn3SFMXGFEH3T4YYJIP3ChnFZcaDEDZQKAIUADLuiTzxJKqCDBfKApgIEBfRAAFAE7tEDAhhYmUUABSVgwAXQPJPCBhyXuUwYSiKyCQ/8KelgRxgd+UEDACCgUACVQGngwQRcVhMCBDA6EGaYFD4iwTxQkMJEkKgeo4EQfckTmggtEAJGFG4yJMQEHUyThwHoO3MBBAjnkc0QADhqyyjxUuIAFXy308YMQpk3gYwczNLDDF1+IkEMHgybQQz5pYGALKJkEgcETYUgxAR5eWMCGAHSwscEPDWDRgAhgeJFXDkXOMEWCfShRxKmoDpJBEVTIMeifIchwQxNeGOhFiQl94UIOH1SgxWbYDhEAssn+ccUJOwg6XQdg7ODCFzuEQQYefZygAwY+WAEnGXKY+AQLDIDG4iABfPFDtFO4l5ALDfQxQhNyDEGCfAss4HDEiU8s8YUBGKwYSScMWCEAmZGmWEEa1zZAwxMkZKfABfo4QUIbDECRKCeOsHCCC0kAIMAXAfhhxhESzWqAZ4NsoQAVJwyAgQIHqGlJJwe08UUYNFSxgxMqVABECzkQ8AR2hAREAhKCqZLJAinY8MQaa5xAQhwQFOAFCjpcIAs6hBzgAwNXkLAFEx6J8AQULOzNdyFM8CF1FFdQ0YbHeztFyABFwKS45Yqv2fnUAn9eruiQcE66b6crYvrpq5Peuuivf85HIAA7','NFC','E');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('NO','New Orleans Saints','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','NFC','S');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('CHI','Chicago','R0lGODlhMgAyAOYAAN1YAFVqgNjNw9rFs/7izu+FOvvbw+p4Kubn591VAAUZNuJbAfm6i/WZWDhNZeRjCk9ieEZacDNFXbS8xCo8VNDQzx0xTPKMRnKFmfq/kyY5Uufc1Pmud4OTpQwiQa25xPm0g6Ovuv3Ts5Sjsqq0viMySt9gBuvXyt5bAeNmE99hCOpzHvfq4N5eBOvHrJ2qty9CW+LLuf6/k/qlahMpRcbL0c7S1/PFpsbExO/NtvOQS7vDymp9kqCtuuVrFPyxfRouSWB1icLIznuNoP7LpWByhY6drOyANfahZPbcyyI3UNbW1/XKq83HxvzFnuRgA2Z5j/WeYPCJQfzZvBosRdtNAB40TvmobxUrRzBAVzZJYA8mRPmgYunMuOhtGulwF/PPtf/PqPzGocS/u/+8iaOor9jd4SY8Vl9ugfakapintv/Kn8nCu9/f4OdpDoaWp/HRuPzXvMDGzsnLzbi6vPi/lfXBneHHsuDJt/rfytDV2drU0ODb1o+fsRMpSAYePiH5BAAAAAAALAAAAAAyADIAAAf/gH5/g4SFhoeIiYqEfoKLj5CRf42SlZaMjpeaj5Sbnomdn6KYo6WTmaaeoambq6yXrpFbVlZAVmcwEjBnSkBAFh4ekrGKHrYQHSRjAy43zi4DbHQjUFq/wovEh34aDm9NNxwXK25PC+dPD18FM3VdExgwSluK2oVKEm8nPysACSgtTAhsEdBECxT+HhSQIWBIFiWgUB3aQgENHxAp/hlEuOCBmy9fygEAgMKgPy8MlkDQQM+QPT8l+kw5kKCFihYJHkjhYKeLgJ8CctRBcmABABM3ExzJY6RES1KI/GR5EeYBChUmEqwAgacMjwgOzmC55QAZDjgNDmIFoEIGiRIW/wppg9FBBEAVADkI4CHBypangzzQ8KAEAokpBdI9MEcmhBZspxDBgJAnxVUUPkSo0QAMEpYSRZoMGBAjBp47CNBIgGpIyw4dCW6mMICBAuRIFmA4kODLFxVj2GLBCCDiqAkUThy+kivRA4wJOtgCkCIkC43lrAc5CBKnpAoARIJQwJ5dQwQEBdia8LFBy3Xykf9YoVBkQwO2eA/sGQ8/voUSOxhgmQo3rcAHDLdpsoUCDDaoAGufdSCgTQLlAQFEn2QRQRAcBlEEBMFJlMUIRMSmQgJXfJDFJ1ZAwAIDMIKwRhtWDOLKFhLYEJ1sBBQBwyYeUFCDDlUkAEAVDYSggf+NEv0xHAE3fXcECytdsoUSPYCAn00GQFBjfK29IEMCSCUgBQs8cCaJEjCQwIB3WZGhxopMImKFBHpEYSIABxgwQQQUvIcIDRZQAMUeaRyFFYo1SBBXnYhIIAECetoEEBJJTACFBEpYgYUCNHR6RgRvVOAETUjhdIUeEpzBnCJaSGAGCAit9cAFdcTQxAQkhNDDBzgI4MIVB5BE4FEyyJGFq68qogQFH0xxxD9rAfDAAVI0EEUDOhzhhVFXfZfABQaoQcGXzSqyhQY8LJHBESj8QxBCI40E0EYJLFCAGDYEUUKTYC6iAQUd7CECUZbVW6+RKKRwxAxgzFHbkhFJskVjoUWE0EYSTGTAwQxccDHDD3UwcUINRkSgRGf1AFzMLxQ4EAAGRqjRwwsjvMEDBA70gkUk9qjrCw2EanAGL0DQQIUFgw3jcn9RPQ21S1JPnZ3VFWOdTdVYB621111zbTXYYwcCADs=','NFC','N');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('JAC','Jacksonville Jaguars','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','AFC','S');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('HOU','Houston Texans','R0lGODlhMgAyAOYAAPHL1a0AJsgsVsrN01pjdPXc4thxjAEUK5OZpOXK0+y9ydrc4OSYrPrq7u7CzcESQX2Gkyk1SqSrtOu1w96EnMpEZoGLmMQ4WkpWZwkbMsxadeWsud17lfPz9AAKIrIAMumqu6GwuBYlO+Sis2pzgtVdfb3CybABK8AOPuvs7tPW2/TV3ThDV+OUqbUWOfzz9sPIzuLj5tJSdF9qed2Qo7kiQ/jl6sw5YdlsivDH0XZ+i+u5xoqSnqoAG/LS2c5kfOGMo9ZigQAEHO/w81BbbcYjT7woSvv+/rMMM9BKbtt1kbskSNuLn8QbSQEXLrC2vuSfsOPk6CIvReewvtFOcfTl6kRPYQkVLaGnsb4wTxwqP78KO+ilt97Fzthohvv5+v77/DA9UfTT2/zY3z9KXeenuOinub4yUebo6/DQ1ri7w/XY3/rT3MKdrdNwhhEfNuDDzp6krsMZRwEPJ+3u8PPO2KestqmvuBIXLdd8kPvw8/DU3cIWRAMYL////78JOiH5BAAAAAAALAAAAAAyADIAAAf/gHx/g4SFhoeIiYqEfIKLj5CRf42SlZaMjpeaj5SbnomdhnwyLTl7CV1dCQoMJQJbn4ehgw9KKws8RCwRUr1hGBYLDl4osZiFAgpRJG8eHnNzHkJvMwhtNEpUxcaTmQIrMFJCB33lcyI8cBw3D9yijig7MVIe5eZaA0CZ7oWdMn4khNgr54EHA36gHIEYImXOwD4e7HjxVKRCE1iKOolRkcHJQw8EAOyr1ASEnjI4BCQctIIjuYEHDkgw004TihYA8igYofLdIAAdGj7sc+DKHQc9NQGZguRHAQM+/zDwQ6De0ANzLFQxsM1SPCY9luRo0c9REj8mrrx8eMCDlQE5/2RoqmDDSA8XDjgc+4PCgZ8ZAocSzKAjxoQkGCMV0XMhQAAjBW4MCpXkC5oIVgW31WIhioISNRc9gKIAyYcPAQyMmLyPgp8BIjILjqZFx4I6HIog2iJACYAdNU6cDpAlB+tCKLigjS14YDRqJqpAkSHghgwlDHLY2PEDifDTJ5BMOV7oAYjXmD02L9d2Dos4fhq8KLCBhgYjJwKc3n/CxQTyyAHhRwozHKDeQ04ceIAQeKjghx8U9ODYd/sNd4Fx3SDiBRh+2NGHgvYYOJATczzx4AgUVrhfAFDolWEhRZxHBwlzvOREBiJA4wEGZDhkjwcIPDhFihXm54ZIAP6RRP8Dr2khxIFOHEACAlpcsQAEsnkAgZBEDndCHmtcsNcgAoAAxgIYeLAWUTKlMIAfWIzz45Z+oFhkACdU4IACSb1IyBZB2HAED9DAVOKDUWAQjUcFPUiDfh+ccIIRbiiwAg6hJUmIAH5hoZY9TnggwYMPqsAMVnc8+IN+JyzhwAoglNAEIrP0cx4WNRI0gx90DOGHGjrMkOMVMMS3hHAB0MDASFHReh6W7FlhhQgsDIGAEB6QGIGvU+j32Bp90spsPzl0EIZV0bRFBAwZkOMBCQ9q4C0UQEBS6yE3vGDHHAcShIEUBs5RbA6mBaDBCrNyMq4hDHQQgY8wEUTGF37IG8DVGQUkEcm9+IJRVXMkmrhBfjX4EIQkHBtSRAHQCuZWfHbVkAYOlaRcHgA8yBbiFW9q0IMRddBc88I3t/yQEDr4QUMPWfhQwiU2D4ICBV8QoTNELBwxQQA1rPE01ET/cYMyBKxpzhsLsOFCDxu4CLYiyfkBAwvphuhBCGOsXUEdCb+tyANJgNCBCQRkoGaoFtRRwwUjFKCEJ1ETcgMDDZgqghAzrOHGBmLk9knkMFJQwAIIpNCAAkFkugnohsiBAwATaOMO6witVPvqYd+eUe66i9s71IEAADs=','AFC','S');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('SF','San Francisco 49ers','R0lGODlhMgAyAOYAANOmt82quMbLym4OJubq6RcUDq8mW7W2tUkBC5BaR4AAIqunqamgpNKHpK6YZYV4TrRuV2s2NXcAGToED/n//9e3w4B+gF9QNWRjZHJLVNSes4mIiZo4PZSIWLtIdFpYWbOlrLQ0ZqZPSK+haNLT09O7e+n18oNsSUlJSSsoGJkuOjo3OKSWmyonJ005LMGJZGkBGVVGL2w7RpORkoY1NsXQztvc29rm46QIRNWUrcuncpmmo8i4vsLEw+/x8cGerJBkbbe/vczW056bnfn7+40AJ6Wxrn8AHc57m5IKK9Lb2cNcg5qHi6kVTqwdVIcAJZceM4ZucXV2do52epaTlZeOkvL59zooLJKalxwcF8hpjTUzIF4AEMpvklcQIHIAET5BQWseMJmWl21tbh8kIYqQjY0aMKICQNOwd4tdZr6ostzh4GphP2t3dMFWf5Z6gIgLKODe3y4uL+Tf4L2nbntbYc64eYkGJYUKKIgLJ0AXHoQAJqYNSAAAAP///6EAPiH5BAAAAAAALAAAAAAyADIAAAf/gHx/g4SFhoeIiYqEfIKLj5CRf42SlZaMjpeaj5Sbnomdn6KYo6WTmaaeoambq6yXrq+VsYtNIUsNGgABvAEAGg1aHk5ns6iPTR5dOQBqIAxDQwwLagEaSMPGkE5azRYoZOFZBeQFWVnhK2MMAUgGkLSEHhoMH2R9WS4xETQ0Kv8q+kWI4CIFPhRiALgpBuoYoRAaqMjpUyBGAhEqkjyR8KWjhCNHJEi4A4VDggsGs1gA4KHhIT4NGEzMwgaCijtHYITJMIUFCyZRZMiIMiUDlydPoIg4sQWfmBxNXh4zUOFDnz5sXnDYo0BCBAYEiPTYseOAEgp+0hqZUISrAigQ/x4U6IOiQghDq6iuoNgBAh4FT45kIJC2TJ8JCBBMcCHGh5+1bfe4FeGgaQsed0kN4lNhYgEHEBQo2PMEhoC0fki8AQIkTYYIE1Z8WIEgsmSuHOg0JVPBieY/Oaz26fBitOTSJFCnReuHAhECDFwguE19zxERdLLQ1aDZwIKrF9CYMU5aQp0bytOntZJBAtL3TyQrePHgqpjMnZCguDoCwpHqT3yhBwZYGBHEAQgeIAARadWAgEgQuseVCnYYBEYOmzkSgHYplMABeeVlkAECXCBwxRgYpJgiYQSsQNQUU0QRhRej4aEDGxQFkOEgAVwVQwnjUVdaDxQwMcAXERxgA/9qHyS3ABhKCCEEehRc4d589fXxw45/BDDXj0HeVtoBaSnxhgxZtDDEAjOQWYMcE5AzwQRVVHklfVdtecogANzT4YdCwsCDHwcEYQIBcZDQQw8CkCBFAVx8wcQGXBQRhhUruGcjjgXouOcf+vHnX6ALCJDFBHqggIEUY8xWwARcDFCHFVjUNkAbWYimQgkWNsClASCAJx6Ie3gBaxEKfAEDAkMIEAcBc9hAmB9l1KYAFzBw9UIHVw2BXyYNCEecaEKSdtwTYcThBxFSfOBuENTWtkcRRVyXHV0YcjlJBXsV0B+51Yk5QHI+tIAtF16ssYO81nGgg2W9/fYHVWDwBQH9HMSSdsQXYRBmBQqV1isDGJWKRllTcmBWiCtOVIDBVVltBeIAQyWXFgFRROCeBFyIBpdcdFXwzsoO4RBTC/icYNMdowkWRA1CCCB1DTXsMIFkRSj1QFNZUAGVVIlARAXSWVxwERRJDDDn2mx7UdJJKVkQQEuIxDPIPPVwqE8/HACkAgcc0EBQUwWgMAMAS+CgiN2EGNAFAAyMAYY445RjDjorYMBCAA1ktgjjhjjhARIaBAACC1RssEEVLIDgSwNuDB0J6IWcIfoyGmjww+4//JIDNgYoLgntstTtUPHwHI/858ov75LzwzcPPV7STy+x9c9jv3j12BM/PR+BAAA7' ,'NFC','W');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('CLE','Cleveland Browns','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','AFC','N');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('PIT','Pittsburgh Steelers','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' ,'AFC','N');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('BAL','Baltimore Ravens','R0lGODlhMgAyAOYAANfFlWVUj0Q5F6SRVistiLima8ajNs3EycW1k+fatpeLtNvLqJmGTeLYyoV3p9fU1sq8r3V1ddzX5eXXq7eztg8RN6ukt4uIixYZTYeBpk1ANd/QszYrGJFPUHJhmUYxetS3XFxJipKSktvBc+nWncyqRaGho9TJw1NRSAkKEZyUuLest8SxetfDhyMlfaqeeJCKdlxcnbyvl6abu1dJHujp9XdlKUZBeLyzxWNhWv///4p4OhgbbWdop8e/yM20aM7Bu9/NnGlWHJuaxkBClDghcKOajq+rqjYqLqWKN0VHha6oxdK6ceLi4m1slDUdbdq3RxweTM+yWiEiVuPMhc/Dpm9tZrqbO4JsJfX2+oKCuHtsoCMla8zJ39e9avT09B8cFlE9gpCCr3diGx4fYp2Xpf/+8TQaJE5QnVxbXbq72vfmu2dYNbejYYGBgMepT/Hx71VVi2ZobS8wYuPQkZt/KHV4uK+v0mdps87M0IBxo318gXd2noJrHzwlczEZayH5BAAAAAAALAAAAAAyADIAAAf/gH5/g4SFhoeIiYqEfoKLj5CRf42SlZaMjpeaj5Sbnomdn6KYo6WTmaaeoambq6yXrq+VsbKRtLWcqLi2uotPYR4qOAdAxQc4YgG9vJIBCicJLW0MO9UMBQAbK1uCT7PLhU8ePhNtNgJgFRVR7BUpYAI7LScKCt+LIT4kSQIpGEp8yhxBUAXBkR4uyFQAY4OOGTF/vOVK9ERBgisCKihRUSVICwAk6BT4UWJEDBcEXGDgcIVEPUi0PuCgggUMDzxDMjhRYucEnSUYYEBhQcSFiylceCDBkiAPzF4ffHgRUgEDhigYXPAgUsWAFwVOqhhBQ2bKFHdRuKTYkUCPhxAf/0Dp+nBACo0UHDgI4JAiigsLIAwgMNKiRQYXXKLg7XBGJRgGLxAkeOCh1yo/PqTUEZLkjZQSJfqhaXHFZAWhLYhEcYdEQ4qqKWKnEJCEhIQthlbN+HHlR5ATFhQ0CF1hSGAZBOKwYBBAK5cYTvbsSYMEjJw8R+RooMHiQZhCocRMAEDBQYgikxokAeMCCBQQC2RcuIEyhpYhd9R0qaEDzoMvOgQIhwka2LBBAKT84YEEM4RgyAwj3DUHDFbkkEYcRhHRQw8xoEGEFk2gkMYeIphAwX8BZhGBEBt8d8ogAcRlSAAT1CGADXUkcZc66mBAhlFGEaDCBSb4cIQIe1gRgf8bJuSRxR47WDDILZOc8MYPC0BwwghYCCDEGFiMwdcUBJSpFYgBpqlDExRcsIcFNCAwJThFLNGABR58gNkbV0hBRRALLDBCRlygFAUZZICBggYaoJDDkm5EoAEYcc6ZyAdbuPiHCuOt4EAAYXwQQgN3HRpFOmwUwMKqBQxADQMDyFAFCytYCkkAXSig6SCcDkBDBQK0kcQAEGwRwLEeOCCGGA54EKoCDr4IyQfoGfLBDAqsQQMHAHThgx7gyFVKA1gMIIZEsIRbiRhMACCjJlRWUsQw6KZrShgOfBLvLofsyy946v4LsMDMEDyRwYv4S7DCAjP8r8P8QryLxLhQXIsFxbL4EQgAOw==','AFC','N');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('DET','Detroit Lions','R0lGODlhMgAyAOYAAHuatnCizTQ0Mj1UZF2XyBljmABUoYGHi4SdsgNqsnOHmIeZqZGmuXuBhgxbkzuEw5a73GNnaRNMdDB9wDNceWWSuRlah0tld2SYxnR2eA1irVxjZ3WdwIqUnRtstCNyqRRtrCVomJy1ygFcqiJZfyJwtIaoxwBZpGtyeEZtiChCVQ1nsgtpqygvMwZgq42hs0WGvYONlTlpixFuswBcpXePpVGJvVprd7O+yCVdgxRlsS90pEZNUZKdpnF6gVOPxgdssyZjjjV+wBJlqjBTbBhxtkuOy4Cs0k9cZCR0vA5npkCGw2qOr0yMwwZorjxNWTZARkVebhVnoQBPoQNjpgtThgBKnABXo7jR5wNapgZfpyZ6vEmHweTi3mdscXBub3Rwa+rx9qSemI+01JeZmzxgeYi24BU6VDlwlm2QrmGf1QZisZynsU+SzZ7A3b/O2gtfmid0tyd1wCt6sS58vxVrtoR8dcDGysDW6T+Cux9xrFyQvdjo9Q1xtwBdpgBpsyH5BAAAAAAALAAAAAAyADIAAAf/gH1/g4SFhoeIiYqEfYKLj5CRf42SlZaMjpeaj5Sbnomdn6KYo6WTmaaeoal/BRIslaulQE4kUEGwkbKbCU6DIS0ZIgsbRAW5iruaCUQqA1B2WBoeTUwxSCCLypcFKmJYFQElVydXI0kMA9mgqJosBVAxR0MGBld++H5XcQgbIQmItkmi8MWEkCv38im8oiFAA3WHBEZK8WKFAYUY8ZUTguACEEMSH4UQ8CbOiYworTzIsI4ULxVgjmiggVIhDS1cRNwAWCiUkwIkiAT5uEgGigBZTtbER8PAEAh3iFiQIMWlhQEoanDwgWYREAodJiRcehOGhilHetRgEOHDoE47/76YOUsggwRFegTg8KCUrAsCQ2hkmbGiDgAibzOFiMCBi5AfBygkmtECh8ml+ZrSOOGijoY1hxMXKhAFRQMbRjK4NZSAQgwuJ2hizmfAAwAFNQB42SHaEBULB5akKWNIyYAORi7OzneiBIIoU88EcXnoAoclEWYMApJjwws6ypfju/KDTBmePdsRCqJAzosoLKQgWUBAw1iUsjEaENIDCQUVFvC0DQgRLFHCCxtkwIEHBuSX0RUGjGDPeAkZUAIHAHDQgAy9IZLCAnLogAEGI9yH0QkjPIBBBQRMsIYLDwixxggnGIDiFGrw0OEhMxyHgQYNLnWCBwg0EAURNxxQQ/8NBzSgABN7LOGBDksAMMCOh9SygQgzLTXFDxtUMYgTDuRAgQNwBDVABh0skAERVZ0CiQU9FJEfDbKdMIUOY1wAiRJVUJUeJEEssIJsV2ihhR80DIEBGzzMoYp61XGQBU0GwIDHOFlAEAYbSPC2SUh6oLDERQzx4YaNJwyhAZ9XjkppITIg4EJTHpjQBQFJbLFFESskgUAKky6SQBR7ILQEA0is2UADB8Qg7RNFFKsIFUjAYAABDVDAghNKwAGHFAWEUIAv1iZCxQZ5TBFABEqwMui1GzQxxQoL3CUvlqxdgIAQbTTgwL78GgLCAA14IQNR+4aUAAlPqLAawSERHNAYrBYng3HGF3Mcy8YezxsyJyCPLKfJ2gQCADs=','NFC','N');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('GB','Green Bay Packers','R0lGODlhMgAyAOYAABcpKyw7MiQzK/X29aqcIoV6HKarp5ySFYSMhpWclzVCOFZzMypYN/z8/JeJHGqFSZCDHlhjXImQi3tzIpabOZqgnIONLKmlMbWlI3R9dnyJLrijGauiKRtONYWVSnuDfdPW1FpaIHKDLfn5+Whyayk4L6CZHCQ1M6mcHKaaE6uxrcrOyzpFLGN8OK2bFVJUIqKRGmyBNpuaKzNdM+jq6eLk4y8+NGZkIqinQjtJQZKVLExxRrutLThkQic2LMLGxO3u7TtjNpuZI0FORn+HgkFIKWNuZtXY1k1ZUUVSSQlBLIKPO3FsJV1oYO7w70xRJwQ+LKCMELCeGhJHLbzBvt3f3jE9LiIxJ83Qziw7OB4wNevs65+PH1FdVY6VkJ6kn213cCEzNxstLh8wLLu/vL/EwR8vJ7K3tLO4taWSFK+1saOPEBUlG2l9LXeKPsGsH9bZ1+fo50lvRFR2Rld7UrOqN6qVGdDT0Sg5OJ2hPre8uIqSODE/Ng1FNf///wA7KiH5BAAAAAAALAAAAAAyADIAAAf/gH1/g4SFhoeIiYqEfYKLj5CRf42SlZaMjpeaj5Sbnomdn6KYo6WTmaaeoambq6yXro9TMwsWQigpuSkoQhYtM1OWsYlKM206BARcEAUTEwUQXCgEMiJBwZHDhgwaGHZMRSVjAOTl5GM+RTdcGHtBkNqDMzIENyzjeEMRGRIJX18JJGRoMiSLGDFWQnDhsGCRtg4UpLwQACBLhAoraDTww7Fjxy13DBjhc7CIgwszQKEitOPNjRMAckg4stGjzZsNqiQYIkbLEykPEMVy44KFGD5eatzk2GDEgAE1l9JIoEBMAAgUlBhy5SFKAAAR7iytoYIIiQhdIhj5YKDKUj8g/yKYCTMhD5RCqx6sOTHmw4CbcD7kECDAh48SJXwQVgAGy9IBGQSEKeABbyYGG6yI+RC14xc+VwLY4EO6NB8bAUJ76cxxRAYzJ9LsIPUHCo4XYpr8tekltOnfpgOYIbK0QZMTRepoPTWoB4wTfMTaPCMgAPDrpG2UIEHkg3fvRCIECANBzqBOS0KIyXBzABIfv23In09/voAr+PNfKcEHzwsK5znCQRFjnAEYar8FYNiCDDaI2IOIBZCFAigEOIgL2q1w0woljFaaDySUQcaIJJZIIhVlpJjiDwj4kMUBFv6RgnaO2QQHgqVdgcBbPHqExhUvxijFPWTcBEQS/OW4Y/+PPVZgBoUxUvCEGBIslYAZppXQhApcdumlAQY48RYJYoQAIHN/zFGAFkPE0V4EVwTXIINXsEHECEthwYcWDvQQ4xQYWDEGcTfR0IQZSZ5GH2mp2VABa60ZIcYLONyF5h8PFBCGDwY8VkES9x0WwKgl3BcACRq+JQFCGzBAW204hKCFDZ0uBQQaRBiBxBC8dgFGAiDw2IAXApwAAx2WFdIBDy9o4QMCYvI4ABA0AIFnjzWAAUAJawSVbCEM8HBDGGYgocduTPLohAFDAMACAS0cEksHF0CgmQARqLBFujfV8AUSAIxxAwbvyLsSITFgcEMJYoyRQwZqwBHtWyAZQIKRAgG/gIIH2BisSAdLYDABCyc0rEASTfDjTwUJIJBBBAUdZMUNBOjgqiLxDNJBCxygMMETVggghjnmiOEDCzfAwIEGNzt0MCJQMLCADhwoA4EzTDDxjAPJVDPDcvA8TYzUGghhggkHpH3A2Tr80nE2Yr8SttytxE03znbfLVTeem/Fd9+vAs7J34LnLHjgh4MSCAA7','NFC','N');

INSERT INTO team (tid, name, logo,  confid, divid) VALUES('OAK','Oakland Raiders','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' ,'AFC','W');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('MIN','Minnesota Vikings','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','NFC','N');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('DEN','Denver Broncos','R0lGODlhMgAyAOYAAEhZeIiTqGl4koFGKAUGSKatu8TK1PP19zRDaQQbRnmFnJ1NHiApXOLk6s3S2+tkA/JmAiIvXCYsYsVaEks4Pfz9/VI7PNleCKVLEjM9aJmjtOvt8bW8ye3x9hsqW+Xo7nuLpXNDLEpGViwzZLZVFrzDzys6Y/T5/flpAIdDHYGNovj5+h4yWTouOeVjBtzf5RUmS6y0wh4iWgAOOVY2MDM8XTFCZholViUtSBgzY9LW3nQ6HhEUURQZUzUyRbtTDlVjgN1hClFgfpehszdGa6y7z8BUDMZTBQ0iSc5WBGV0jiY0XOnr70M2QRgbVhktVRoeWI+ZrFxqhWM1Ip+puRUpUNXZ4MjN16pLD7G3xUFScuBhBz5KcQwQTklQaCszU/v7/GFvis1bDF9riS5Lda5PEvb3+KCkr4ufusnU4i84aEouLVYwJA8ST8HI0klNYZKju5OesZ2mtxEuXYhuaJBBE8lXCOrg2wEhUlVsjlxmgnN+lic2YA0NTv///wAARCH5BAAAAAAALAAAAAAyADIAAAf/gH1/g4SFhoeIiYqEfYKLj5CRf42SlZaMjpeaj5Sbnomdn6KYo6WTmaaeoambq6yXrq+VsX8jbQQEhgRQNx4eDE65o7QZbX1OhjwSEV9fSx5dpbFQfI02PIMyJk0pRmJiPwM+aqiasWo4PX0tTR5LFBguKBAQDw8QWztLMp+xNWxq/og48uPHAxRbSCxYIObBFhcQMCxhoKrcnxsYaiijMEEMiRBNcMDAA2PAAxcQsSzBZs6iCSxlcESYA8PCgAUTggQh0SJBiiRHkjyoQ6RHNEudhP2RYAHChTIkJsiDYKfOFBo+WNjw4uWNCAsJWAAhMsIiKEcRWELJQWMLinlG/3a0qJEHTREHHw6cONHhQxoOQwxcAYAAGaROfHB4iEBhgAUfIVKsqSGgSAc/mDNrzlxhAwcORBiYLdRJwpoyBt+mSEAGzofNmh1cWQEbs444AG4YRpSUyJQJExaweVOgQu3YT4gEcLAZjJszd4Yg4cc7k4wcCZA8AXEZ9goHBfZoQaDFRBUkMIAw51yAToEoNqgbWuWERYIStRtE0ZJgBgw9Q7jxQgMvlMACALB1UAIVHCiR1nzl8GCCFnJYkdkGKrAwwwxPqPAabBkeUJsZBjRQAAISkGaWEzfwIUQAcpgwQ3ZAvJCgcUwssYdmImZmhh8NSMEHFIPQQkgbPTDwxPgTCWixgWYrFKBCCWDYZoMUHFxRgAByfIjZFVmEkeIpkeAiQwQ2KNCAHwbYIIQVxn0QgBJZRCGAACpQYYAOZhzghgMbNCDAmEYq0sUICCiAhBBV+nEiAxIKIUAYWvCBgAZ+gHADA2O8YIAHRY72SA8JVPGkHwFE0AYjXXQhSB8RqBBDBj1AwYUCGYSqSgYx+BEDAkolkgEVJQhgAg8ZUFcoJBIQwYQW8inihAd8qIFNH8IsCwkCAhAxjKiRSIDECN+K0gcLFJkLbiRc3FCuKCNE28q6spxVb0v3wkJvviryO8u+/pIZ8GEA+6vtwAIjrMjBAzMccB+BAAA7','AFC','W');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('NYJ','New York Jets','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','AFC','E');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('ARI','Arizona Cardinals','R0lGODlhMgAyAOYAAOu5AKWmpraLAPLb5MdnjOjo6LxJdaoAI9yjufHx8f///1ZYV8x1l+e9zWZNANzc3LW0tZRxAEZLSq4kWbkAJvTi6YODg9HR0bQyZH0AGTkrA8Ncg//KAJ6entOjAFxHBzg7OiUpKNObs36DhRQXFsTExIkAHAsCA6scU3p6erUAJbEAJdeSrenD0hgAA0IADNLNz2cAFMWnufj4+NqetZGSkicABO/V3zMACczKy0s5AOK0xrmgrHJycv/QAKIDQeXS2fjt8pUAHdnL0dWNqZkAIMMAKOzK16MAIqQJRVpcX6gUTRwjIaqrq9SKplsAE21ycXqAf6cPSf/CAA4REZaYpPv191EACc/Pz0I6IksADi0hAKEBP79SfNGCoN/X23VdAM65wqCiotbV1s99nQwMCr0AJ8bHx+GswE9PT0dQT0pTUR8WF/z7/G5ubmdpcLq8weW4yTE0NfDCAPfIAHAAD3EAFt+nvJeameTO1+DQ1h8fH6YNSK4AJAAAAKEAPiH5BAAAAAAALAAAAAAyADIAAAf/gHx/g4SFhoeIiYqEfIKLj5CRf42SlZaMjpeaj5R/ZBOboYadLTugoqKdTgoVDJmolp0bbRYlR11csLGOE0EpZT0PDV2vuoqdXAhjZX4kUQVHBEvGi51LNApKflouJFBYFTRdKNSHnXxHChckOAcxJ2USAQUDdwQYxbCdfxsKeEx+XpjpE8NGMyU1ziS4cYfMBgxS9GX6EScHMz/tjKwwccWFnzJMJETpcOZLngZexm3a92dChRp+YrowQaFmHyF2tNg4EZNECAlQmgzZQYBcJZYYKihY4CfGExsxkKxYoaKmigNCMsR4YcPFCSpqxABxcgoSSz43FOSQ46IIhQwm/w70mTuXak0KV3G+OBEiih4yETkVI6CgA7MTGYxQoMu4sV0KB+rYYILnCAbBhpI0SCAn5okXSBY3nltVxQq6KyissHNizZcN1fJhsAIh5pMnODLIHW0nRtyap/usMIMER4gcsBOxJMRAQQ8/LqSaEDJaRQaZLzJUpatCxZUQYwwoz/fnB40ZafzYKGImeGMKT2LGxEEz+PArIIAYHUV+UoMCEkBnQnujUYWDfLZ1V5cKOETBAiLLFYJCCwmkd0IMCjamQhE8+UEFCQFRRZoQbAyxHyaLoFBBCfLR5x5dZtgRUwgQ7IFRHyrMRQEOIxBgTn+EoPEAFU2ZYMJopB1IRf8BZ9iIAxLtUVCHHAjkUkiEhhDQRoBaGJEjkhSYEFMACpwBAnS6mUFiGIGhmGIQAfhxghCigfmCH2koYAGI2OFwAgRlDYKlISzMcKYNOCKJo5h+zBNCTCkwFZMSDSRxJZCEqFgCM1rUWd2BZQTwQA1iBADiBwKcMMKDbj5iQBswNeUpYxTIGBMIkcakAwA+CFAGHOIJimkhzbkRUwazksYhgn5oIIAPHEzhQwRy7PCDsJUQ0UZ60X3J2FQGIbiFAxF4IC0HGlQR7KCIJBHHAzY+odFoFNwpnwZgfKCDBjpEQIcAaRCBbSUY+CKnHQeoRqsWCGoALQcACODABx58IMPHwJW0gAWR0MXQR50MIliGBxxwAG3EDmzBA8aSsFDBAx2kQaQLyKa2rHwjzyHAB1tskUUWe6w8ybCH/IBCFyzccEEPRGoh3IEig7EFFUpUIYMIItAgAsuXSLFBC2MwZQPUzPrxxhBE4HNteVxrksQGNwQAUNl7QEBDoPwZs4QTD6SH4B4w+BhbOQbcEEWHJCBnFtGWTNCAGDw1wUAk7IbCBxoB9BDH2piVM0gSO1hxGeWMa4KBF5x37rkmla9+TOmuXxr7JXwEAgA7','NFC','W');
INSERT INTO team (tid, name, logo,  confid, divid) VALUES('KC','Kansas City Chiefs','R0lGODlhMgAyAOYAAOV3iuPj47nKxfPy80sFEnNHUbSQmOeDlKsAJicnJ/X+/dvb23AuPtUkQ7QAKbcAMtK9wW8UKaRpd9TU1Oa9xOzGzaq4tOqxu8PCwsS3urKysoYAG6Ojo/3+/p+eno50eBYWFtq3vdg2UqmpqXYBFenN0mxsbHw3R7iipejn6F5eXkxNTe7w8FYzOtIWN2NkZNXDxuydq1xMTrW6uYqKipKSks8FKTAwMHlpbFVVVfG9xnJzcpdUZoODg+2lsTc3N6IAHpOEhtDNzuTt66B6gtxJZLmztHx8fOmNnn0MKvj4+O2rttPb2srFxpQAIEVFRQUFBd5UbJNAUr8ANNvh4NALLpccOIMeNPLCy/n//+uYpr69vSYDBeygre+1v7PAvOjz8N9ZcXKBfbCurn9aYaEcO25vbj4vMdcxToUoO9/f37G4taezsD0+PvD29do+WbSvsOBddOFieZWYl5+Rk8GxtUolLaCpp6Ktq2hpaeLCx4+Pj5ywrNAPMf///84CJiH5BAAAAAAALAAAAAAyADIAAAf/gH1/g4SFhoeIiYqEfYKLj5CRf42SlZaMjpeaj5Sbnomdn6KYo6WTmaaeoambq6yXroVvOhRLBwAxPgdoVX1VqbGESBh7IxAhRmMwMWFyUQ2mwX8NEyAJPwlQ2lAvNUc0MAANVb+qqIVoGCBbAwETCwtzCdYgID3HegfQmtI2FQkc/AgcqERNhw5j2mgDYaZEjFsiKgUjd+BFjg4DMw7sgKFGjxUgnuTYIURfpFAutPgAQIGCFyMJBvjJchCjxowzVDwBAYUGhCVROGXSUiNHj3keTLQJQESCUwl1BrJo+hSFwAArtP3QgGRRJxtYfkBRccRDjhUT5nABggABiSAD/9kQcOBgAwEyNjt40AmCg5Yi5QyF0jLy5oI2G6Y4YDDEDxg6VxwguEKHT+ObW0Cs8ODFxaFQB3aouOknD4kHCHhkMXLCCeoWeDIYIGKgDhU/VCYo8TOC55Elngt1qhL2BekXpx2cIOPEwZQHD5JEAEKduhUeV9IEuMrhRp4SRYQ7KjICCobjp1G3ZUAA+oMNSaRISbMBCF0r2weqSXCjCQBSf2ixwgqk+YHcc5MFgQMBBDz3QARsKDDEGi2QMEUZ+Un1AggjHDBIJxTc4EGBOaQXgQAebGADg9A5cMV5jj1BQAQpkNYDCCV86AgFCYxB2h0EIDDFFBvgwAB0J9jhnP9iEYBxlRhrkBbADnl0oeMgPI5A2g5cMMigDBFMgQAOZ3hJQAG7+cFRBjINtEAOCeRQwT6deHHDEaQtMMMXfArwhYXKWSCAn19cpkAQJERwm0AT3KCCEV7sc8ogB6jQhk0FCuRGC0IiIAUGQ2SRBRhMwFGAE0B8gJESYySwRxdo2CDeIEV48EOamQpkAQFAPOfEFSecwEASTiDgBBkK8HYDFGZcIKtgjogwxhNKCKHGAhqokakFLRCwAQKStQXEBml4kMUEO9ywQxM+BAftIFHUAEUC9N4Awg8sZOqGBWbI0AIDDBSAAxxM1HBDAiqUII4inbwhRA5HQGAEDE0kMEG6rgOJqukaN9xgwhY+SApKJmF0IU4DUWBwQ5sYt6PBTiDsUAEAEUEiDQA0tIGxH02sQC8IL8ABgxbu2nzOIDZ48cQOpKXgQQ87gJTDHkbogcQbRZ909B8ulHDvCHOYsEIOecB5zQ95LFNEA1lLtHUVOhyRQBsq5PHCCk+ooIEOPqwksjmJvHFBCBd0gUQMF1ywRBwuVPFsKdK8YrTkrWxNuVCXw2J55iNz7rbnkkQO+qyjY166V5ufPkkgADs=','AFC','W');

INSERT INTO team (tid, name, logo, confid, divid) VALUES('LAC', 'Los Angeles Chargers', 'R0lGODlhMgAyAPcAABM1WXaMqvLCHW2EoxVSjFx6oXuVZj5xdBpRjkl6dUpljdC6OxRVhoicZBZNi3mRXf/ECEJyawBAgKyqTf7GFf/KAde6NPbDGxxekUNqm0Jqki1eja2sUj1omw1OhA5UhPfEGgM5ctu5MQBJi26Cmk9znrmySR09YDRqe4mas8a2P//IBv/IBCZifwcrURk6XnKHpXqMol1zjUFcevvFGf/ECv7CER5Mfl15n2V7kytJarqvR2mAog1Vig1Nig0wVStkgnyPpwVLh3uNpDVScnmLoXGFn22DolJqhf/IDf/ICf/HEfrGF//GBgMuYxhchQpHhnuOpwdPhiNCZGp+lyRhhV90jjVqgwwvVf/CDv/DC//CDf/FBv/DDP/DCv/HBP/GBRY3W//CD2+Fn2J4kSZGZzNQcFt/qY6guE9tlVuCcP/KB4qbr1l0lU5wlWt/mHOHnjlvfVd4ohBRfZSktWiGZWqBmChifbyuQWl9lsm1QCphluvEIpupvIebti5fmBBHezRtiFx+ZgtamE9vnFtzjISbZMayPwhRi/zHEzJqh1aAczNUfjtXdv/MCChHaVNxlyp2llV0n1x3nf/GAbWrRLevSpamuGqDpf/DDQAucm6FpFR3oWyVffrHGMm2OlyQh2OEaX6QqWeLbFNukmuNaeTBNW+Dnf/FBf/HDw8xV0lif52rv6GlUf7KIGZ8lP/GCP/HCz1Yd5KnbXaIoCFvmyttl+jAJu/CIJmouJ2quzBneu6+HDJrd4WXXJehWTdwejuBkT9weNu7OANIgJKfWAVIhLuvQxdTkR1WkIOVqeK5LOC+ND+HnTRrhENehRBdiCloe16Eb3eKpVJqjiBAYv/CDPDEH3GEm/nFG2uIYgBUmpGesAFZmR1NikR2dTFPb3qNpqCiTKekSVqTj3iLpDdUc9u6Lv/HBmKBp2iBo2WCpiFfewlLif/GBDJQb3GEnEh0b0RwowVIe0xzpAxQidu9Kcy5OGh8lBpAbv3JD/vDDpqiVFGNjkxwngQoTyH5BAAAAAAALAAAAAAyADIAAAj/AP8JHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEOKHEmy5MQyrKhB4pTuCAkkYUYCaGTlzakxfpyMSBChxYdkBeC98/hChhE5fwgweALE2RVbs5KAsFDsQL0MtHRorEYChwMG8XxVEoHrwoVsF3iJ0QLhy5JPanxIyuHCogsyk6Cg4HcrFYsmELQIHpylcBZrXJSoiIMgxgmKL4Z4azGBwhcIXgZr6dJli+HPWbagYmKgHQytEU+EA1TqmjstNmzQuCBAwAUaS2KxAAOhs+FMmFdwkILpEUQA5SQ0G8YlSw0R/a4oqlIFCIoIgh6MO8dECRctXpYd/4IFgYUJKQFiNnShTEGIWhZqhK7BwViaKGPGbFp3Rt4eBrtogwcIK+xDTicCgMHCBEIE4ZALM6QgxA5giNHFFyBMAM0NRQzkgipTrJLHAPQkc8cD9jAzSCALfLGGAcnI4FAOPjSwwhZcUNDKHQjwQAJqB01hBQwdMBBKMJr0YAILnkRTwGMLlVECMBRAgM49wjigDhnqMWSOEf4gEoICPVhSwQ7GYMNQDELoQUkSv3hAyBsASKQDLc+kEIAUKjjSSwFdBulPAmskMgoU05hhkSyXvILDE3yIgwwSClHRzjH6LOJAEapghAUWM3TwjSlzlJPQD5uw44o0DsDRET4ENGtwgDoJgZNBHYZA0aFHQXwQiRsJybABKPOI0qlHRGiwjQYJcYNBN6QQEVIMIWyQkC7E3JCDSNW0kU9CfTgRRF0i2cFIQmwcIe1IL6CRUCF0mJRLQgAEKpKiJuWr77789uvvvwAHLPDABIMUEAA7','AFC','W');
INSERT INTO team (tid, name, logo, confid, divid) VALUES ('LAR', 'Los Angeles Rams', 'R0lGODlhMgAyAOYAAG58lQojS9fTyAEcSHeEm8WqamlnWevl1aeWbFRYWSU3Vpqktu3jzUlbeefdxsiucd7NplhphrvDz+PNmtK2deHUs7i5tNrBiNO+iaKru7ihaztGVZiKZv///zdJa9S4doZ8YsmwdLikdMHI1auyvE9gfs24hLaohx0zWbO5wuTRpomTpszJwj9Tdn2KocyydU1SVsDEydW7ftrFle7euamdfHt0YRQpTtq+fcetbevp5d/LmkVOWBctUpWfs+3cs8+0ddzYzci4kmppYEJHSs21e8LExKavvtXBks2wbevZrzE5RtHOx+XYubu/xC1CZoGMomNeUOPf1dnHnObRno2EaM7PzeDBeQ4nUXFuYeDIjwYfSb+nbVxfXiY7YJGbrJCBXcmvcz1QcdCzcfb2+OPXud7h5vLlxde6d/Tfrceyf8LCv9K+kJCcswAOOMy/oa+dccnO2e7hwbOgcIaCdB4yUNPEn6GSa9S1buXXs+jWrpybl2NwhzA+Uw0lTgAZRSH5BAAAAAAALAAAAAAyADIAAAf/gH5/g4SFhoeIiYqEfoKLj5CRf42SlZaMjpeaj5Sbnomdn6KYo6WTmaaeoambq6UDHi4kFrRrKQRPiq6iKC4sFRB2QicnQk1MAFiIu54RAhAQDgcHUkFGe3QcEFYeh8yaLg5TFVMmRS8vRUh5Um0JIgwlht+WAE0mJmEFD2EhIWE5CgD5IcHDHQYtCtHjJAZABgc5HvB78eEDEApoKIR4UGBCjD5zgqAgZQlFhAUCaKgwsdGfRhAJNvAYAgfNixAFqLQhssMHSUgDWvgQoAQDAhsbugBxOWfDgAFbBvy5YQPIzRxlWoBx4GXQwkEDSqSQo4ULiA2CsJzQCISLglON//xs+ZPlw8YLBIhQAeAV1aEBDZzkwaEhS52nAQDPeBDiQ5dTAeL6CRAAgUY8e+qoSdFX0ZMUTXAUMAw17h8AWnK84FJnix8sdQK4bjSgi10KNbAgYNH5UAAXQTDg4dCntOQ/K1JTQIAlcgAeIHrM3tLnJoU7WzjwPnXIQwwIYwp0SSzZNBQqAufciOxnAIg77Kn7+1BlgPbehPgEMZHjTp8/7JUnSAQ0FBACEE5RksAVG7hW2wdhoDHEFiIYgV8AK5SRg2pZ9NEDYgIO8MQBQDzwAQeJRVXFFV0M0NwdNr2gQB8zfNGbFxJU0M8DOSSRhAYg8PDhbI0kdoQSBp64Qf8fVVHAwx8oeLABEDgM8QcIcnTD3R8RHHFECkYwUUYFM8hAwY9ZKGBce0/ocEGS1lGgnmwAeJDAYzDskMFPjKDwRAsAkCBABRdQYJaa7P1Rgg4TBLThGBe0KJcXC2wRgAEzxNADn4n0cNIzaHBhAHkB/NGCBAwoQcUEb/Axm1QptBBFGiRsyukiCrjAxA4nqknJFoASEAEKA0S2RQkorOACEXKIMY9fkPTgggBlwVCsHzdINch0CqTQAxQ+LKGEPApBG4kXKegxRotbwNBDgJNtgQIUHhQUBQ3k3irJFgA44NgfPCQwQJGT/OGaGBnw5ISt+lbSgBQy8HCDBjwUy2++HCv44UYDBBjAQFfPjiKGFCKAoAcSMGyRQQcsj9ADACVwYKE35l7SgAMqZBADBn2MkEEEZHQQxwIbIEHAMjVfQoBPJfxAxAI+lGDGEWS4EMUZWoacygBHYLCEDxKUQAYfBc3hxFw0sxLAEU3AkQAKAMTRgqw0RABK0psca4UKHMCwQRRgsBFDqUizQggWAAQxxRRyCPAFyIUbTkgDKZBQJ95fSX635ppkzrnWn0vieej4kc4J3qY3nHq5q3MSCAA7', 'NFC', 'W');


-- END OF STANDARD DATA ----------------------------------------------------------
-- INDEXES --------------------------------------------------------------

CREATE UNIQUE INDEX part_email_idx ON participant(email);

CREATE INDEX div_tid_idx ON div_winner_pick (tid);
CREATE INDEX div_uid_idx ON div_winner_pick(uid);
CREATE INDEX div_cid_idx ON div_winner_pick(cid);

CREATE INDEX wild_tid_idx ON wildcard_pick(tid);
CREATE INDEX wild_cid_idx ON wildcard_pick(cid);
CREATE INDEX wild_uid_idx ON wildcard_pick(uid);

CREATE INDEX tic_mp_idx ON team_in_competition(made_playoff);
CREATE INDEX tic_cid_idx ON team_in_competition(cid);

CREATE INDEX option_cid_rid_idx ON option(cid,rid);

CREATE INDEX round_open_idx ON round(open);

CREATE INDEX match_open_idx ON match (open);
CREATE INDEX match_cid_rid_idx ON match(cid,rid);
CREATE INDEX match_time_idx ON match (match_time);

CREATE INDEX answer_cid_rid_idx ON option_pick (cid,rid);
CREATE INDEX answer_uid_idx ON option_pick(uid);

CREATE INDEX pick_cid_rid_idx ON pick(cid,rid);
CREATE INDEX pick_uid_idx ON pick(uid);

CREATE INDEX registration_cid_idx ON registration(cid);

-- END OF INDEXES -------------------------------------------------------

-- SPECIFIC SETTINGS FOR THIS VERSION OF THE SOFTWARE.

INSERT INTO settings (name,value) VALUES('version',14); --version of this configuration
-- values for client config

INSERT INTO settings (name,value) VALUES('client_log',''); --if none empty string should specify colon separated function areas client should log or 'all' for every thing.
INSERT INTO settings (name,value) VALUES('client_log_uid',0); --if non zero limit client logging to that uid.
INSERT INTO settings (name,value) VALUES('cookie_visit_name','FMVISIT'); --name used for a cookie to record a visit where the user logged on.

INSERT INTO settings (name,value) VALUES('main_menu_icon','menu'); --character from material icon font to use as the main menu.
INSERT INTO settings (name,value) VALUES('webmaster','webmaster@example.com'); --site webmaster.
INSERT INTO settings (name,value) VALUES('site_logo','/appimages/site_logo.png'); --url of the site_logo image to be used on info pages and in mail
INSERT INTO settings (name,value) VALUES('min_pass_len', 6); --minimum password length
INSERT INTO settings (name,value) VALUES('dwell_time', 2000); --time to elapse before new urls get to be pushed to the history stack

--values for server config
INSERT INTO settings (name,value) VALUES('cache_age',0);--cache age before invalid (in hours), 0 is infinite
INSERT INTO settings (name,value) VALUES('server_port', 2040); --port the api server should listen on.
INSERT INTO settings (name,value) VALUES('cookie_name', 'FOOTBALL'); --name used for our main cookie
INSERT INTO settings (name,value) VALUES('cookie_key', 'newCookieKey'); --key used to encrypt/decrypt cookie token
INSERT INTO settings (name,value) VALUES('cookie_expires', 720); --hours until expire for standard logged on token
INSERT INTO settings (name,value) VALUES('verify_expires', 24); --hours until expire for verification tokens.
INSERT INTO settings (name,value) VALUES('rate_limit', 30); --minutes that must elapse by verification emails
INSERT INTO settings (name,value) VALUES('email_from', 'admin@example.com'); --email address that mail comes from (do not reply)
INSERT INTO settings (name,value) VALUES('mail_footer','<p>Some footer html</p>'); --mail footer
INSERT INTO settings (name,value) VALUES('mail_wordwrap',130); -- word wrap column in html to text conversion
INSERT INTO settings (name,value) VALUES('mail_signature', '/appimages/signature.png;Name of Signature'); --email signature if starts with a slash is an image url which maybe followed by a semi-colon and then caption, else html
INSERT INTO settings (name,value) VALUES('site_baseref','https://example.com'); -- basic site url without trailing slash to be added to hostless image urls to 
INSERT INTO settings (name,value) VALUES('first_time_message','Welcome to the <strong>Football Mobile Results Picking Competition</strong>.  This appears to be your first visit to the site. You will be have to provide your email address and later your password but, with your permission, we can remember you so you won''t have to keep entering it.'); -- First Paragraph of text for First time Users

------------------------------------------------------------------------------------------ STYLES
---COLOURS 
INSERT INTO styles (name,style) VALUES('app-primary-color', '#42d9ff'); --Main colour for use in the application
INSERT INTO styles (name,style) VALUES('primary-color-filter', 'invert(69%) sepia(72%) saturate(792%) hue-rotate(160deg) brightness(102%) contrast(102%)'); --Filter needed to color svg to match app-primary-color NOTE this is done by putting desired color in calcfilter.js 
INSERT INTO styles (name,style) VALUES('app-accent-color', '#131335'); --Colour to use when something is to stand out - Main Button etc 
INSERT INTO styles (name,style) VALUES('accent-color-filter', 'invert(9%) sepia(23%) saturate(2922%) hue-rotate(213deg) brightness(92%) contrast(102%)'); --Filter needed to color svg to match app-accent-color NOTE this is done by putting desired color in calcfilter.js 
INSERT INTO styles (name,style) VALUES('app-primary-text', 'var(--app-accent-color)'); --Main text colour to use on primary colour backgrounds
INSERT INTO styles (name,style) VALUES('app-accent-text', 'white'); --Text colour to use when writing on accent colour backgrounds
INSERT INTO styles (name,style) VALUES('app-user-color', '#f3fcff'); --Background used to indicate the particular user
INSERT INTO styles (name,style) VALUES('app-user-text', 'var(--app-accent-color)'); --text Color for highlighted user
INSERT INTO styles (name,style) VALUES('app-spinner-color', 'var(--app-accent-color)'); --Spinner Dot Colour
INSERT INTO styles (name,style) VALUES('app-button-color', 'var(--app-accent-color)'); --Main Button Colour
INSERT INTO styles (name,style) VALUES('app-cancel-button-color', 'lightsteelblue'); --Cancel Button Colour
INSERT INTO styles (name,style) VALUES('button-text-color', 'var(--app-accent-text)'); --Color of text on primary buttons
INSERT INTO styles (name,style) VALUES('cancel-button-text-color', '#212121'); --Color of text on cancel buttons
INSERT INTO styles (name,style) VALUES('app-form-color', '#fcffc0'); --Background Color of Forms;
INSERT INTO styles (name,style) VALUES('fm-win-color', 'darkorange'); --Color of icon to indicate a match win or an over/under result.
INSERT INTO styles (name,style) VALUES('fm-in-playoff','gold'); -- colour of trophy indicating a team in the playoff
INSERT INTO styles (name,style) VALUES('fm-correct-pick', 'orangered'); --colour of a correct pick
INSERT INTO styles (name,style) VALUES('fm-incorrect-pick', 'mediumorchid'); --colour of incorrect pick
INSERT INTO styles (name,style) VALUES('fm-indeterminate-pick', 'lawngreen'); --colour of pick where result not yet available.

--- FIELD SIZES
INSERT INTO styles (name,style) VALUES('email-input-length','240px'); --input field width for e-mail input 
INSERT INTO styles (name,style) VALUES('name-input-length','120px'); --input field width for display input 
INSERT INTO styles (name,style) VALUES('pw-input-length','100px'); --input field width for password input 



-- Configuration Settings That are just examples and MUST be changed.  There are others that you might want to change so review them all.
-- 
-- UPDATE settings SET value = 'https://example.com' WHERE name = 'site_baseref'
-- UPDATE settings SET value = 'webmaster@example.com' WHERE name = 'webmaster';
-- UPDATE settings SET value = 'admin@example.com' WHERE name = 'email_from';
-- UPDATE settings SET valie = '<p>mail footer</p>' WHERE name = 'mail_footer';
-- UPDATE settings SET value = '/images/signature.png;Joe Bloggs' WHERE name = 'mail_signature';     --NOTE, site specific images should be in a different directory
-- UPDATE settings SET value = '/images/site_logo.png' WHERE name = 'site_logo';                    --As above.
-- UPDATE settings SET value = 'newCookieKey' WHERE name = 'cookie_key';

COMMIT;
VACUUM;
-- set it all up as Write Ahead Log for max performance and minimum contention with other users.
PRAGMA journal_mode=WAL;

