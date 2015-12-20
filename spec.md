CnCNet 5 IRC protocol rev 3
===========================

> WARNING: THIS SPEC IS INCOMPLETE AND NOT IMPLEMENTED IN CNCNET 5 OFFICIAL CLIENT

This document describes the CnCNet IRC addon protocol that is compatible with
any standard IRCd. The protocol uses only standard IRC commands to represent
game information. All normal IRC stuff is considered part of the protocol and
RFC 1459 is a good read for anyone implementing a client.

Because all CnCNet 5 commands are done over pure IRC protocol, any IRC client
library with support for custom CTCP should work. Using a library is highly
recommended for correctness and client security.

The third version of the protocol in this document is meant to be used on a
standard IRC network with normal flood limits. The client is expected to
buffer and queue messages to avoid flooding itself out.

Client should also use 'dirty flag' to indicate some setting has been changed
by the user and wait for 1 second before sending the changed setting out. This
allows the player to browse through something fast and send only a single
message when at least one second has passed after the last change.

Main lobby and other channels
-----------------------------

There are two channels that work with the client. `#<lobby>` that is used for
chat and `#<lobby>-games` that is used for game room update announcements.

This separation allows the main lobby to have less traffic and normal IRC
client accessible. 

Normal chat messages in `#<lobby>-games` are ignored by the
client.

Game room
---------

Room names are free form but should follow the naming convention of
`#<lobby>-game<random number>`. This naming convention prevents conflicting with
any real channels that exist in any given IRC network.

When creating a game room, the host can use a few standard IRC channel flags to
limit room accessibility:

 * +k for password (always set, see 'Room password')
 * +l for player limit (also see TOPIC for maxplayers)
 * +i when the game is starting to close the room

Depending on IRC network the channel should also have +s or +p to hide it from
any channel listing to avoid normal IRC users joining the channel accidentally.

### Public game room information and announcing

Protocol rev 3 does game room listing completely differently compared to the
original v1/v2 specification. The original implementation relied on the LIST
IRC command but it was inefficient and caused a lot of traffic. It is also
very prone to flood limit control.

When someone creates a game room, they should start announcing the room in the
main lobby channel. The announce interval could by anything from 5 seconds to
30 seconds. As a rule of thumb, never announce faster than once per 5 seconds.

If the public game room information changes, the lowest possible interval can
be used to do a quick update to everyone in the lobby.

When the game has been closed (started), announce interval can be lowered
to 10 seconds or stopped completely after single announce to reduce traffic.
When game room information has not been updated for more than 15 seconds it
should be removed from the local game list automatically.

The downside of all this is that game rooms are not immediately visible when
you join but it scales well and doesn't require any external services.

As the main lobby channel can also work as a regular IRC channel, announcing
on it might not be desirable. Announcing is done in `#<lobby>-games` channel
instead to target only game clients who join there. If a game client does not
want the update stream, they can leave the channel. This can be a "low
bandwidth" optimization that is selectable.

```
CTCP NOTICE #<lobby>-games GAME <revision>;<game>;<reserved (game version)>;<max players>;<room>;<room name>;<room flags>;<player list>;<public game flags>;<map name>
```

Current revision is **B1**, If wrong revision, parsing must end at the first
field and channel ignored. Joining a channel with different version will
yield unexpected results because of protocol mismatches.

The game version field is optional and used to check for incompatible mods.
The format is game specific and undefined at this point. Revision 1 client
used it to hash client version and rules.ini for Red Alert for example.

The player list contains all the actual players that are currently part of the
game. The host has the '@' symbol prefixed to indicate he is the one hosting
this game. There might be no host and the player list might be empty if the
room is bot controlled.

**Supported games**

Any game that has CnCNet 5 spawner support. At the time of writing this
document:

 * td
 * ra
 * ts
 * tsdta

**The standard room flags**

  * bit 1 - password (player chosen)
  * bit 2 - reserved (tourney)
  * bit 3 - started
  * bit 4 - tunneled
  * bit 5 - reserved (n/a)
  * bit 6 - reserved (automatic / bot controlled like matchmaking)
  * bit 7 - closed (remove from game list immediately)

**Tiberian Dawn public game flags**

  * NONE

**Red Alert public game flags**

  * bit 1 - reserved (demo?)
  * bit 2 - aftermath
  * bit 3 - reserved (TA rules)

### Game options

The game host is the one who has operator status on the channel. The host does
not need to be part of the game itself and can instead be a bot who configures
the game settings for you. These kinds of bots can do matchmaking or other
automatic magic.

All non-public settings (player house, color etc.) are sent using CTCP
messages to the channel (PRIVMSG for request, NOTICE for reply). Players can
request settings and whatever the host sends is to be considered the final say.

Using CTCP this way also defines a more fine grained control that any reply
type command (over NOTICE) should NEVER cause any automatic request to be sent
to avoid going into endless loop. The only exception are game management bots
and map upload request that is unavoidable as a possible response to GOPTS.

**Room password**

To prevent IRC clients from randomly joining game rooms, they should set the
channel mode to secret (+s or +p depending on IRC network) and also always
use a default password of first 10 characters of the SHA1 checksum of the
channel name in lowercase.

**Host options**

```
CTCP NOTICE GOPTS <speed>;<credits>;<unitcount>;<techlevel>;<scenario hash>;<private game flags>;<seed>
```

Every time host changes some option it will send all settings to everyone. The
ready state of every client is cleared every time.

Scenario hash is calculated from the map file and is a SHA-1 checksum. All
maps, even stock ones for a game are hashed. The client is responsible for
checking that they have the specified map, if not, request host to upload it.

**Tiberian Dawn flags**

  * bit 1 - Bases
  * bit 2 - Tiberium
  * bit 3 - Crates
  * bit 4 - Auto Crush Infantry
  * bit 5 - Capture The Flag
  * bit 6 - MCV Undeploy

**Red Alert flags**

  * bit 1 - Bases
  * bit 2 - Ore Regenerate
  * bit 3 - Crates
  * bit 4 - Capture The Flag
  * bit 5 - Shroud Regrows
  * bit 6 - Slow Unit Build
  * bit 7 - Aftermath Game
  * bit 8 - Random Spawns
  * bit 9 - MCV Undeploy
  * bit 10 - Fix Formation Exploit
  * bit 11 - Allow AI Alliances
  * bit 12 - Ally Shroud Reveal
  * bit 13 - Build Off Ally
  * bit 14 - Aftermath Fast Build
  * bit 15 - Enable Paraboms
  * bit 16 - Fix Magic Build
  * bit 17 - Fix Range Exploit
  * bit 18 - Tech Center Fix

**Map sending**

If a client does not have the map specified in GOPTS, he should first try to
download it from the CnCNet map database (over HTTP, documented separately).

Raw map files are hashed with SHA-1 and compressed to <hash>.zip archives for
local and remote storage on the database.

If that fails for any normal reason like the db not having the map, the client
should request the host to upload it. This ensures that if the map database is
wiped or cleaned up they will be automatically reuploaded by the game host.

```
CTCP PRIVMSG MAPREQ <scenario hash>
```

When the host has finished uploading the specified map:

```
CTCP NOTICE MAPOK <scenario hash>
```

Or if something goes fatally wrong:

```
CTCP NOTICE MAPFAIL <scenario hash>
```
The purpose of MAPOK is to allow the clients to re-request the map from the
map database when the host has finished uploading. MAPFAIL is to indicate that
uploading failed permanently and the client should not allow itself to be readied
and show some error message that the map is missing. This is the correct
behaviour as long as the client does not have the map host has selected.

**Player options**

```
CTCP NOTICE POPTS <p1name>;<p1country>;<p1color>;<p1start>;<p1team>;<p1ai>;<p2name>;<p2country>;<p2color>;<p2start>;<p2team>;<p2ai>;...
```

When player settings change for any reason. All players are in the list. If the
AI flag is '1' then that player is shown as AI. The name for AI players might
or might not be ignored by the client as it is completely optional in this
revision of the protocol.

Teams and start positions start from 1, 0 is considered not enabled. Spectators have the special value of -1 as their team.

So, a 3 player game with one AI might look like:

```
CTCP NOTICE POPTS Player 1;0;1;0;0;0;Player 2;1;2;0;0;0;Computer;0;3;0;0;1
```

**Player ready states**

```
CTCP PRIVMSG PREADY <p1name>;<ready>;<p2name>;<ready>;...
```

**Tiberian Dawn countries**

  * -1 - random
  *  0 - GDI
  *  1 - NOD

**Tiberian Dawn colors**

  * -1 - random
  *  0 - Yellow
  *  1 - Red
  *  2 - Teal
  *  3 - Orange
  *  4 - Green
  *  5 - Grey

**Red Alert countries**

  * -1 - random
  *  0 - Spain
  *  1 - Greece
  *  2 - Russia
  *  3 - England
  *  4 - Ukraine
  *  5 - Germany
  *  6 - France
  *  7 - Turkey

**Red Alert colors**

  * -1 - random
  *  0 - Yellow
  *  1 - Blue
  *  2 - Red
  *  3 - Green
  *  4 - Orange
  *  5 - Grey
  *  6 - Teal
  *  7 - Brown

**Host start game**

First the room must be set +i to prevent people from joining. After the server
has confirmed this and no one has messed up anything the following message
shall be sent:

```
CTCP PRIVMSG START <p1name>;<p1address>;...
```

Note: address for AI players are empty! Address is in form ip:port.

Also when starting the host must also announce to -games to indicate the game has
started so the room is shown properly in game list.

When the client receives this message and finds its own name from the list, it
shall generate spawn.ini and start the game.

Clients will stay in the game room until the client exits.

When a client joins the room, host must always send the options and update
public game options and set the dirty flag.

**Client options request (can be denied or ignored by the host)**

```
CTCP PRIVMSG OPTS <country>;<color>;<start>;<team>
```

**Client ready or unready request (can be denied or ignored by the host)**

```
CTCP PRIVMSG READY <0/1>
```

**Client return from game notification (can be ignored by the host)**

```
CTCP NOTICE RETURN
```

The purpose of this notification is for the host to be able to reset the game
if the room is persistent. The client can also leave the room on will.

**Player leaves game**

As the host is required to keep announceing the -games channel for updates, it
is the responsibility of the next player in the announced player list to take
over announcing when the host leaves.

When the next announcing player leaves, the next one takes over according to
announce player list order.

When the last player leaves, the client is required to send the room closed
announce.
