/**
 * Word wheel (anagram round): one center letter + ring letters. Valid words
 * must include the center letter and only use each ring letter once.
 * The embedded dictionary drives both puzzle generation and the answer key.
 */

const DICT_RAW = `
ace act age ago aid aim air all and ant any ape apt arc are arm art ash ask ate awe axe bad bag ban bar bat bay bed bee beg bet bid big bin bit boa bob bog bon bow box boy bra bud bug bun bus but buy cab cad cam can cap car cat caw cob cod cog con cop cot cow coy cry cub cue cup cut dab dad dam day den dew did die dig dim din dip doe dog don dot dry dub dud due dug duo dye ear eat eel egg ego elf elk elm end era erg eve ewe eye fad fan far fat fax fed fee fen few fib fig fin fir fit fix fly foe fog for fox fry fun fur gag gap gas gel gem get gig gin got gum gun gut guy gym had hag ham has hat hay hem hen her hew hex hid him hip his hit hob hoe hog hop hot how hub hue hug hum hut ice icy ill imp ink inn ion ire irk its ivy jab jam jar jaw jay jet jig job jog jot joy jug jut keg key kid kin kit lab lad lag lap law lax lay led leg let lid lie lip lit lob log lot low lug mad man map mar mat maw may men met mid mix mob mod mop mud mug mum nab nag nap net new nil nip nod nor not now nun nut oak oar oat odd ode off oft oil old one opt orb ore our out owe owl own pad pal pan pap par pat paw pay pea peg pen pep per pet pew pie pig pin pit ply pod pop pot pro pry pub pug pun pup put rag ram ran rap rat raw ray red rib rid rig rim rip rob rod roe rot row rub rug rum run rut rye sad sag sap sat saw say sea set sew she shy sin sip sir sit six ski sky sly sob sod son sop sot sow soy spa spy sty sub sue sum sun tab tad tag tan tap tar tax tea ten the thy tie tin tip toe tog ton too top tot tow toy try tub tug two urn use van vat vet vex via vie vow wad wag wan war was wax way web wed wee wet who why wig win wit woe wok won woo wow yak yam yap yes yet yew you zap zip zoo
able ache acid acre aged ages aide aims airy ally also alto amid ants apes arch area arms army arts atom aunt auto away axis babe baby back bail bait bake bald ball band bank bare bark barn base bath bats bead beak beam bean bear beat beds beef been beer bees bell belt bend bent best bets bike bill bind bird bite blew blob blot blow blue blur boar boat body boil bold bolt bomb bond bone book boom boot bore born boss both bowl boys brag bran brat brew brim brow buck buds bugs bulb bulk bull bump bunk burn burst bury bush busy buys cafe cage cake calf call calm came camp cane cans cape caps card care cars cart case cash cast cats cave cell cent chap char chat chef chew chic chin chip chop cite city clad clam clan clap claw clay clip club clue coal coat code coil coin cold colt comb come cone cook cool cope copy cord core cork corn cost cosy coup cover cows cozy crab crew crop crow cube cues cuff cult cups cure curl cute damp dare dark darn dart dash data date dawn days dead deaf deal dean dear debt deck deed deep deer dent deny desk dice died dies diet digs dime dine ding dips dire dirt disc dish disk dive dock does dogs doll dome done doom door dose dots dove down drag draw drew drip drop drum dual duck dude duel dues duet duke dull duly dumb dump dune dung dusk dust duty dyed dyes each earl earn ears ease east easy eats echo edge edgy eels eggs egos elks emit ends envy epic eras errs euro even ever eves evil ewes exam exit eyed eyes face fact fade fail fair fake fall fame fang fans fare farm fast fate fawn fear feat feed feel fees feet fell felt fend fern feud figs file fill film find fine fins fire firm fish fist fits five flag flap flat flaw flea flee flew flex flip flow flux foam foes foil fold folk fond font food fool foot ford fore fork form fort foul four fowl foxy frat free fret frog from fuel full fume fund funk furs fury fuse fuss gain gale game gang gape gasp gate gave gawk gaze gear gems gene gent germ gets gift gigs girl gist give glad glee glen glow glue goal goat goes gold golf gone gong good gown grab gram gray grew grid grim grin grip grit grow gulf gull gulp guru guys hail hair half hall halt hand hang hard hare harm harp hash hats haul have hawk haze head heal heap hear heat heed heel heir held hell helm help hemp herb herd here hers hide high hike hill hint hire hits hive hoax hobo hogs hold hole holy home hone hood hoof hook hoop hope hops horn hose host hour howl hubs hugs hull hums hung hunt hurl hurt hush hymn icon idea idle idly idol inch into ions iris iron isle itch item jade jail jams jars jaws jazz jeep jest jets jibe jigs jilt jinx jobs jogs join joke jolt joys judo jugs jump junk jury jute keel keen keep kelp kept keys kick kids kiln kilt kind king kiss kite kits knee knew knit knob knot know labs lace lack lacy lads lady laid lake lamb lame lamp land lane laps lard lark lash lass last late lava lawn laws lazy lead leaf leak lean leap left legs lend lens lent less lest lets liar lice lick lids lied lies life lift like lily limb lime limp line link lint lion lips lisp list live load loaf loan lobe lock loft logo logs loin lone long look loom loop loot lord lore lose loss lost lots loud love luck lull lump lung lure lurk lush lust lute lynx made maid mail main make male mall malt mane many maps mare mark mash mask mass mast mate math maze mead meal mean meat meek meet melt memo mend menu mere mesh mess mice mild mile milk mill mime mind mine mint miss mist mite moan moat mock mode mold mole monk mood moon moor moot mope more moss most moth move much muck muff mugs mule mult mush must mute myth nail name nape naps navy near neat neck need neon nest nets news next nice nick nigh nine node nodes none noon nope norm nose note noun nude numb nuns nuts oaks oath obey odds odes oils oily okay okra omen omit once ones onto onus ooze opal open opts opus oral orbs ores ouch ounce ours oust outs oval oven over owed owes owls owns pace pack pact page paid pail pain pair pale palm pane pang pans pant park pars part pass past pate path pats pave pawn paws pays peak peal pear peas peat peck peel peer pegs pens pent perk pest pets pews pick pier pies pigs pike pile pill pine ping pink pins pint pipe pits pity plan play plea pled plod plot plow ploy plug plum plus poem poet poke pole poll polo pond pony pool poor pope pork port pose posh post posy pots pour pout pray prey prim prod prop pros prow pubs puck puff pull pulp pump punk puns punt pupa pure purr push puts quit quiz race rack raft rage rags raid rail rain rake ramp rang rank rant rare rash rate rats rave rays read real ream reap rear redo reed reef reel rein rely rend rent rest ribs rice rich ride rife rift rigs rims rind ring rins ripe rise risk rite road roam roar robe rock rode rods roll roof rook room root rope rose rosy rout rows ruby rude rugs ruin rule rums rune rung runs runt ruse rush rust ruts sack safe saga sage said sail sake sale salt same sand sane sang sank saps sash save says scam scan scar seal seam sear seas seat sect seed seek seem seen seep sees self sell semi send sent sets sewn sham shed shim shin ship shod shoe shoo shop shot show shut sick side sift sigh sign silk sill silo silt sine sing sink sins sips sire sits site size skew skid skim skin skip slab slam slap sled slew slid slim slip slit slob slot slow slug slum slur smog smug snag snap snip snob snow snug soak soap soar sock soda sofa soft soil sold sole solo some song sons soon soot sore sort soul soup sour sown sows spam span spar spas spat sped spin spit spot spun spur stab stag star stay stem step stew stir stop stow stub stud stun subs such suck suds sued sues suet suit sumo sump sung sunk sure surf swab swam swan swap swat sway swim swum tabs tack tact tags tail take tale talk tall tame tamp tang tank tape taps tarp task taut taxi teak teal team tear teas teem teen tell temp tend tens tent term tern test text than that thaw thee them then they thin this thou thud thug thus tick tide tidy tied tier ties tile till tilt time tine tins tint tiny tips tire toad toga toil told toll tomb tone tong tons took tool toot tops tore torn toss tost tote tour tout town tows toys tram trap tray tree trek trim trio trip trod trot true tsar tuba tube tubs tuck tuft tugs tuna tune turf turn tusk tutu twig twin twit type typo ugly undo unit unto upon urge urns used user uses vain vale vane vans vary vase vast veal veer veil vein vent verb very vest veto vets vial vibe vice view vile vine viol visa vise void volt vote vows wade waft wage wags waif wail wait wake walk wall wand wane want ward ware warm warn warp wars wart wary wash wasp watt wave wavy waxy ways weak wean wear webs weds weed week weep weld well welt went wept were west wets what when whim whip whir whiz whoa whom wick wide wife wiki wild will wilt wily wind wine wing wink wins wipe wire wiry wise wish wisp with woes woke wolf wood wool word wore work worm worn wove wrap wren writ yard yarn yawn year yeas yell yoga yoke your zest zinc zone zoom
`;

export const WORD_WHEEL_DICTIONARY: string[] = [
  ...new Set(
    DICT_RAW.split(/\s+/).filter((w) => w.length >= 3 && /^[a-z]+$/.test(w))
  ),
];

export interface WordWheelPuzzle {
  letters: string[];
  /** Index of the required center letter within `letters`. */
  centerIndex: number;
  /** Dictionary words buildable under the rules (the answer key). */
  solutions: string[];
}

function letterCounts(word: string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const ch of word) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  return counts;
}

function canForm(word: string, pool: Map<string, number>, center: string): boolean {
  if (!word.includes(center)) return false;
  const need = letterCounts(word);
  for (const [ch, count] of need) {
    if ((pool.get(ch) ?? 0) < count) return false;
  }
  return true;
}

/**
 * Build a wheel from a random dictionary word of length 9 (distinct letters,
 * which keeps every wheel clean) and collect all shorter buildable words.
 */
export function generateWordWheel(minSolutions = 10, rng: () => number = Math.random): WordWheelPuzzle {
  for (let attempt = 0; attempt < 400; attempt++) {
    const seeds = WORD_WHEEL_DICTIONARY.filter(
      (w) => w.length === 9 && new Set(w).size === 9
    );
    const seed = seeds[Math.floor(rng() * seeds.length)];
    if (!seed) continue;

    const letters = seed.split("");
    const centerIndex = Math.floor(rng() * 9);
    const center = letters[centerIndex];
    const pool = letterCounts(seed);

    const solutions = WORD_WHEEL_DICTIONARY.filter((w) =>
      canForm(w, pool, center)
    );

    if (solutions.length >= minSolutions) {
      return { letters, centerIndex, solutions };
    }
  }
  // Deterministic fallback seed (rare).
  const fallback = "education";
  const letters = fallback.slice(0, 9).split("");
  const pool = letterCounts(fallback);
  return {
    letters,
    centerIndex: 0,
    solutions: WORD_WHEEL_DICTIONARY.filter((w) => canForm(w, pool, "e")),
  };
}
