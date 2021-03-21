const Vec3 = require('vec3').Vec3;

let bot;
let achieve;
let achieveList;
let blocks;
let items;
let blocksByName;
let itemsByName;
let processMessage;
let inventory;
let stringTo;
let nearest;
let syntaxTask;
let moveTask;
let inventoryTask;
let blockTask;
let informationTask;
let tasks;
let alias;
let parameterized_alias;
let giveUser;
let async;
let all_task = {};
let materials;
let Recipe;

function init(_bot, _achieve, _achieveList, _processMessage, _async) {
    bot = _bot;
    const mcData = require('minecraft-data')(bot.version);
    async = _async;
    processMessage = _processMessage;
    achieve = _achieve;
    achieveList = _achieveList;
    bot.on('blockUpdate', function(oldBlock, newBlock) {
        if (newBlock != null) {
            if (isBlockEmpty(newBlock)) bot.emit("pos_" + (newBlock.position) + "_empty");
            else bot.emit("pos_" + (newBlock.position) + "_not_empty");
        }
    });
    bot.navigate.on("stop", function() { bot.emit("stop"); });
    bot.navigate.on("cannotFind", function() { bot.emit("stop"); });

    blocks = mcData.blocks;
    items = mcData.items;
    blocksByName = mcData.blocksByName;
    itemsByName = mcData.itemsByName;
    materials = mcData.materials;
    Recipe = require('prismarine-recipe')(bot.version).Recipe;
    inventory = require('./lib/inventory');
    nearest = require('./lib/nearest');
    stringTo = require('./lib/stringTo');
    inventory.init(bot, materials);
    nearest.init(bot, isNotEmpty, blocksByName);
    stringTo.init(bot, inventory, nearest, isEmpty, isNotEmpty, blocksByName, async);


    syntaxTask = require('./task/syntaxTask');
    syntaxTask.init(achieve, achieveList, stringTo);
    moveTask = require('./task/moveTask');
    moveTask.init(bot, processMessage, isEmpty, stringTo, isNotEmpty);
    inventoryTask = require('./task/inventoryTask');
    inventoryTask.init(bot, stringTo, findItemType, inventory);
    blockTask = require('./task/blockTask');
    blockTask.init(bot, stringTo, isNotEmpty, isBlockEmpty, isBlockNotEmpty, isEmpty, positionToString, processMessage);
    informationTask = require('./task/informationTask');
    informationTask.init(bot, stringTo);
    giveUser = ["ifThenElse", "ifThen", "repeatUntil", "repeat", "taskList", "replicate"];
    tasks = {
        "ifThenElse": syntaxTask.ifThenElse,
        "ifThen": syntaxTask.ifThen,
        "repeatUntil": syntaxTask.repeatUntil,
        "repeat": syntaxTask.repeat,
        "stopRepeat": syntaxTask.stopRepeat,
        "taskList": syntaxTask.achieveListAux,
        "wait": syntaxTask.wait,
        "nothing": syntaxTask.nothing,

        "move to": moveTask.moveTo,
        "move": moveTask.move,
        "stop move to": moveTask.stopMoveTo,
        "jump": moveTask.jump,
        "up": moveTask.up,
        "tcc": moveTask.tcc,
        // 		"avancer":avancer,c:conditionAvancer,


        "list": inventoryTask.listInventory,
        "toss": inventoryTask.toss,
        "equip": inventoryTask.equip,
        "unequip": inventoryTask.unequip,
        "activate item": inventoryTask.activateItem,
        "deactivate item": inventoryTask.deactivateItem,
        "craft": inventoryTask.craft,


        "dig": blockTask.dig,
        "build": blockTask.build,
        "watch": blockTask.watch,
        "stop watch": blockTask.stopWatch,
        "replicate": blockTask.replicate,


        "pos": informationTask.pos,
        "look for block": informationTask.lookForBlock,
        "look for entity": informationTask.lookForEntity,
        "say": informationTask.say,

        "attack": attack,
        "look at": lookAt,


        // 			"achieve":achieveCondition
    };
    // ou passer à du pur string ? (what ?)
    alias = {
        "x+": "move r1,0,0",
        "x-": "move r-1,0,0",
        "y+": "move r0,1,0",
        "y-": "move r0,-1,0",
        "z+": "move r0,0,1",
        "z-": "move r0,0,-1",
        // 		"spiral up":"do sdig r0,2,0 then sdig r0,1,1 then sdig r0,2,1 then move to r0,1,1 then sdig r0,2,0 then sdig r-1,1,0 then sdig r-1,2,0 then move to r-1,1,0 then sdig r0,2,0 then sdig r0,1,-1 then sdig r0,2,-1 then move to r0,1,-1 then sdig r0,2,0 then sdig r1,1,0 then sdig r1,2,0 then move to r1,1,0 done",
        //"spiral up":"do sdig r0,2,0 then sdig r0,3,0 then smove r0,1,1 then sdig r0,2,0 then sdig r0,3,0 then smove r-1,1,0 then sdig r0,2,0 then sdig r0,3,0 then smove r0,1,-1 then sdig r0,2,0 then sdig r0,3,0 then smove r1,1,0 done",
        "spiral up": "do smove r0,1,1 then sdig r0,-2,0 then smove r-1,1,0 then sdig r0,-2,0  then smove r0,1,-1 then sdig r0,-2,0  then smove r1,1,0 then sdig r0,-2,0  done",

        // 		"spiral down":"do sdig r1,1,0 then sdig r1,0,0 then sdig r1,-1,0 then move to r1,-1,0 then sdig r0,0,1 then sdig r0,1,1 then sdig r0,-1,1 then move to r0,-1,1 then sdig r-1,1,0 then sdig r-1,0,0 then sdig r-1,-1,0 then move to r-1,-1,0 then sdig r0,1,-1 then sdig r0,0,-1 then sdig r0,-1,-1 then move to r0,-1,-1 done",
        "spiral down": "do smove r1,-1,0 then smove r0,-1,1 then smove r-1,-1,0 then smove r0,-1,-1 done",
        "raise chicken": "do move to nearest reachable object * then equip hand egg then activate item done",

        "build shelter": "immure bot",

        "destroy shelter": "do sdig r-1,0,0 then sdig r0,0,-1 then sdig r1,0,0 then sdig r0,0,1 then sdig r1,0,1 then sdig r-1,0,-1 then sdig r-1,0,1 then sdig r1,0,-1 then sdig r-1,1,0 then sdig r0,1,-1 then sdig r1,1,0 then sdig r0,1,1 then sdig r1,1,1 then sdig r-1,1,-1 then sdig r-1,1,1 then sdig r1,1,-1 then sdig r-1,2,0 then sdig r0,2,-1 then sdig r1,2,0 then sdig r0,2,1 then sdig r1,2,1 then sdig r-1,2,-1 then sdig r-1,2,1 then sdig r1,2,-1 then sdig r0,2,0 done",


        "attack everymob": "repeat do move to nearest reachable mob * then attack nearest reachable mob * done done",
        "scome": "smove me",
        "come": "move to me",
        "down": "do tcc then sbuild r0,-2,0 then sdig r0,-1,0 then wait 400 done", // could change the wait 400 to something like a when at r0,-1,0 or something
        "sup": "do tcc then sdig r0,2,0 then equip hand item to build then up done",

        "triple north start": "repeat do dig r0,0,-1 then dig r0,1,-1 then dig r0,2,-1 then dig r-1,0,-1 then dig r-1,1,-1 then dig r-1,2,-1 then dig r1,0,-1 then dig r1,1,-1 then dig r1,2,-1 then move r0,0,-1 done done",
        "triple north stop": "stop repeat do dig r0,0,-1 then dig r0,1,-1 then dig r0,2,-1 then dig r-1,0,-1 then dig r-1,1,-1 then dig r-1,2,-1 then dig r1,0,-1 then dig r1,1,-1 then dig r1,2,-1 then move r0,0,-1 done done",
    };

    const gss = { "stonebrick": "stone", "coal": "oreCoal", "ingotIron": "oreIron", "diamond": "oreDiamond" };

    // should I put these aliases somewhere else ?
    parameterized_alias = {
        "giveEverything": function(p, u, done) {
            done("do look at " + p + " then toss everything done");
        },
        "give": function(p, n, i, u, done) {
            done("do look at " + p + " then toss " + n + " " + i + " done");
        },
        "toss everything": function(u, done) {
            const l = inventory.myItems().map(function(a) { return "toss " + a[1] + " " + a[0] }).join(" then ");
            done(l === "" ? "nothing" : "do " + l + " done");
        },
        "sbuild": function(s, u, done) {
            done("if is empty " + s + " then do equip hand item to build then build " + s + " done endif");
        },
        "sdig": function(s, u, done) {
            stringTo.stringToPosition(s, u, null, function(pos) {
                done("repeat do ssdig " + s + (blockTask.canFall(pos.offset(0, 1, 0)) ? " then wait 1500" : "") + " done until is empty " + s + " done"); // empty != air !!
            });
        },
        "ssdig": function(s, u, done) {
            stringTo.stringToPosition(s, u, null, function(pos) {
                let t, p, a = [],
                    x, y, z;
                const bb = bot.entity.position.floored();
                const bb2 = bb.offset(0, 1, 0);
                let u = "";
                if (pos.floored().equals(bb.offset(0, 2, 0)) && blockTask.canFall(bb.offset(0, 3, 0))) {
                    u = "repeat do equip hand tool to break " + bot.blockAt(bb.offset(0, 3, 0)).name + " then dig " +
                        positionToString(bb.offset(0, 3, 0)) + (blockTask.canFall(bb.offset(0, 4, 0)) ? " then wait 1500" : "") +
                        " done until is empty " + positionToString(bb.offset(0, 3, 0)) + " done then ";
                }

                function makeSafe(bb, bb2, pos, a) {
                    //check for water or lava
                    for (x = -1; x <= 1; x++) // can do this better...
                    {
                        for (y = -1; y <= 1; y++) {
                            for (z = -1; z <= 1; z++) {
                                if ((Math.abs(x) + Math.abs(y) + Math.abs(z)) === 1) {
                                    p = pos.offset(x, y, z);
                                    if (!(p.equals(bb)) && !(p.equals(bb2))) {
                                        const e = bot.blockAt(p);
                                        if (e != null) {
                                            t = e.type;
                                            if (t >= 8 && t <= 11) a.push("sbuild " + positionToString(p));
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                makeSafe(bb, bb2, pos, a);
                if (blockTask.canFall(pos.offset(0, 1, 0))) makeSafe(bb, bb2, pos.offset(0, 1, 0), a);
                //if(blockTask.canFall(pos.offset(0,2,0))) makeSafe(bb,bb2,pos.offset(0,2,0),a);
                // cannot make this recursive because he can't build very high but a column of 2 is common
                let b = a.join(" then ");
                b = b === "" ? b : b + " then ";
                done("if is not empty " + s + " then do " + u + " " + b + " equip hand tool to break " + bot.blockAt(pos).name + " then dig " + s + " done endif");
            });
        },
        "shoot": function(s, u, done) {
            done("do look at adapted " + s + " then activate item then wait 1000 then deactivate item done");
        },
        "cget": function(n, s, u, done) {
            const gs = s in gss ? gss[s] : s;
            const m = inventory.numberOfOwnedItems(s);
            let need;

            function gn() {
                return neededItemsToCraft(n - m, s)
                    .map(function(item) {
                        return "cget " + item.count + " " + item.name;
                    })
                    .join(" then ")
            }
            done(m >= n ?
                "nothing" :
                isCraftable(s) ?
                "do " + gn() + " then " + ((need = needWorkbench(s)) ?
                    "if close of crafting_table then nothing else do cget 1 crafting_table then " + gn() +
                    " then sdig r0,0,1 then sbuild r0,-1,1 then equip hand crafting_table then build r0,0,1 done endif then " : "") +
                "look at r0,0,0 then craft " + (n - m) + " " + s + (need ?
                    " then sdig r0,0,1" : "") + " done" : "repeat sget " + gs + " until have " + n + " " + s + " done");
        }, // r0,0,1 : change this , problem with the number : try to craft it all when it only need to craft current - demanded : let's do it here, it seems to make sense since I'm going stringTo.stringToPosition for dig forward : hence the if have could probably be replaced by a js if : I'm going to let the if have be for now, and just do the current - demanded : not using have anymore... : remove it ? actually I'm using it, can't you see ???
        "get": function(s, u, done) {
            done("do move to nearest reachable position nearest block " + s + " then sdig nearest block " + s + " done"); //add+" then move to nearest reachable object" when improved
        }, // do move to nearest reachable position block nearest block log then dig block nearest block log done
        "sget": function(s, u, done) {
            done("do smove nearest block " + s + " then sdig nearest block " + s + " done");
        },
        "follow": function(s, u, done) {
            done("repeat do move to " + s + " then wait 2000 done done"); // can make it follow with some distance maybe ?
        },
        "smove": function(s, u, done) {
            stringTo.stringToPosition(s, u, null, function(p) { // change ?
                const s = positionToString(p);
                done("repeat ssumove " + s + " until at " + s + " done");
            });
        },
        "dig forward": function(s, u, done) {
            stringTo.stringToPosition(s, u, null, function(p) {
                done("do sdig " + s + " then sdig " + positionToString(p.offset(0, 1, 0)) + " then sbuild " + positionToString(p.offset(0, -1, 0)) + " then move to " + s + " done");
            });
        },
        // 		"tunnel":function (s,u,done)
        // 		{
        // 			stringTo.stringToPosition(s,u,null,function(p){
        // 				done("do sdig "+s+" then sdig "+positionToString(p.offset(0,1,0))+" then sbuild "+positionToString(p.offset(0,-1,0))+" then sbuild "+positionToString(p.offset(,2,0))+" then move to "+s+" done");
        // 			});
        // 		},
        "ssumove": function(s, u, done) {
            stringTo.stringToPosition(s, u, null, function(p) {
                const r = bot.navigate2.findPathSync(p);
                const path = r.path; // cannot fail : should be able to fail... : maybe with a break, failed or stop task ?
                console.log(r);
                const t = path.map(function(p2) { return "sumove " + positionToString(p2); }).join(" then ");
                done("do " + t + " done");
            });
        },
        "sumove": function(s, u, done) {
            stringTo.stringToPosition(s, u, null, function(p) {
                p = p.floored();
                const bb = bot.entity.position.floored();
                const d = p.minus(bb);
                if (d.y !== 0 && isNotBedrock(bb.offset(0, sgn(d.y), 0))) done(d.y < 0 ? "down" : "sup");
                else if (d.x !== 0 && isNotBedrock(bb.offset(sgn(d.x), 0, 0)) && isNotBedrock(bb.offset(sgn(d.x), 1, 0))) done("dig forward r" + sgn(d.x) + ",0,0");
                else if (d.z !== 0 && isNotBedrock(bb.offset(0, 0, sgn(d.z))) && isNotBedrock(bb.offset(0, 1, sgn(d.z)))) done("dig forward r0,0," + sgn(d.z));
                // 				if(d.y!=0) done(d.y<0 ? "down" : "sup");
                // 				else if(d.x!=0) done("dig forward r"+sgn(d.x)+",0,0");
                // 				else if(d.z!=0) done("dig forward r0,0,"+sgn(d.z));
                else done("nothing");
            });
        },
        "immure": function(s, u, done) {
            done("do sbuild r-1,0,0+" + s + " then sbuild r0,0,-1+" + s + " then sbuild r1,0,0+" + s + " then sbuild r0,0,1+" + s + " then sbuild r1,0,1+" + s + " then sbuild r-1,0,-1+" + s + " then sbuild r-1,0,1+" + s + " then sbuild r1,0,-1+" + s + " then sbuild r-1,1,0+" + s + " then sbuild r0,1,-1+" + s + " then sbuild r1,1,0+" + s + " then sbuild r0,1,1+" + s + " then sbuild r1,1,1+" + s + " then sbuild r-1,1,-1+" + s + " then sbuild r-1,1,1+" + s + " then sbuild r1,1,-1+" + s + " then sbuild r-1,2,0+" + s + " then sbuild r0,2,-1+" + s + " then sbuild r1,2,0+" + s + " then sbuild r0,2,1+" + s + " then sbuild r1,2,1+" + s + " then sbuild r-1,2,-1+" + s + " then sbuild r-1,2,1+" + s + " then sbuild r1,2,-1+" + s + " then sbuild r0,2,0+" + s + " done");
        },
        "achieve": function(c, u, done) {
            const impliedActions = {
                "at": function(p) { return "smove " + p; },
                "have": function(n, o) { return "cget " + n + " " + o },
                "close of": function(b) { return "smove nearest block " + b },
                "is empty": function(p) { return "sdig " + p },
                "is not empty": function(p) { return "sbuild " + p }
            };
            done("repeat do " + impliedActions[c[0]].apply(this, c[1].map(function(par) { return par[1] })) + " then wait 500 done until " + c[0] + " " + c[1].map(function(par) { return par[1] }).join(" ") + " done");
        }
    };
    all_task.tasks = tasks;
    all_task.giveUser = giveUser;
    all_task.alias = alias;
    all_task.parameterized_alias = parameterized_alias;
    all_task.stringTo = stringTo;
}

function isNotBedrock(pos) {
    const b = bot.blockAt(pos);
    return b != null && b.type !== 7;
}


function isEmpty(pos) {
    return isBlockEmpty(bot.blockAt(pos));
}

function isBlockEmpty(b) {
    return b !== null && b.boundingBox === "empty";
}

function isNotEmpty(pos) {
    return isBlockNotEmpty(bot.blockAt(pos));
}

function isBlockNotEmpty(b) {
    return b !== null && b.boundingBox !== "empty";
}


function pround(p) {
    return new Vec3(round(p.x), round(p.y), round(p.z));
}

function findItemType(name) {
    let id;
    if ((id = itemsByName[name]) !== undefined) return id;
    if ((id = blocksByName[name]) !== undefined) return id;
    return null;
}


function lookAt(goalPosition, done) {
    if (goalPosition != null) {
        bot.lookAt(goalPosition, true);
    }
    done();
}


function isCraftable(s) {
    return Recipe.find(findItemType(s).id).length !== 0;
}

function attack(ent, done) {
    if (ent != null) bot.attack(ent);
    done();
}

function positionToString(p) {
    return p.x + "," + p.y + "," + p.z;
}

function neededItemsToCraft(n, s) {
    const id = findItemType(s).id;
    const r = Recipe.find(id);
    n = Math.ceil(n / r[0].result.count);
    if (r.length === 0) return null;
    const nd = [],
        d = r[0].delta;
    console.log(d);
    d.forEach(element => {
        if (element.id !== id) {
            nd.push({
                "name": items[element.id] === undefined ?
                    blocks[element.id].name : items[element.id].name,
                "count": -parseInt(n) * element.count
            });
        }
    });
    return nd;
}

function needWorkbench(s) {
    const id = findItemType(s).id;
    const r = Recipe.find(id);
    if (r.length === 0) return null;
    return r[0].requiresTable;
}

function sgn(n) {
    return n > 0 ? 1 : -1;
}

module.exports = {
    all_task: all_task,
    init: init
};