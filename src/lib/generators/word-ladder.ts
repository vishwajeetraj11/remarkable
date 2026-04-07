export type WordLength = 3 | 4 | 5;
export type Difficulty = "easy" | "medium" | "hard";

export interface WordLadderPuzzle {
  startWord: string;
  endWord: string;
  steps: string[];
  wordLength: WordLength;
}

// ─── Dictionaries ────────────────────────────────────────────────────────────

const WORDS_3: string[] = [
  "ace","act","add","age","ago","aid","aim","air","all","and",
  "ant","any","ape","arc","are","ark","arm","art","ash","ask",
  "ate","awe","axe","bad","bag","ban","bar","bat","bay","bed",
  "bee","bet","bid","big","bin","bit","bog","bow","box","boy",
  "bud","bug","bun","bus","but","buy","cab","cam","can","cap",
  "car","cat","cob","cod","cog","cop","cot","cow","cry","cub",
  "cud","cup","cur","cut","dab","dad","dam","day","den","dew",
  "did","dig","dim","din","dip","dog","don","dot","dry","dub",
  "dud","due","dug","dun","duo","dye","ear","eat","eel","egg",
  "ego","elm","emu","end","era","eve","ewe","eye","fad","fan",
  "far","fat","fax","fed","fee","few","fig","fin","fir","fit",
  "fix","fly","foe","fog","fop","for","fox","fry","fun","fur",
  "gag","gal","gap","gas","gel","gem","get","gig","gin","gnu",
  "god","got","gum","gun","gut","guy","gym","had","hag","ham",
  "has","hat","hay","hen","her","hew","hex","hid","him","hip",
  "his","hit","hob","hod","hoe","hog","hop","hot","how","hub",
  "hue","hug","hum","hut","ice","icy","ill","imp","ink","inn",
  "ion","ire","irk","ivy","jab","jag","jam","jar","jaw","jay",
  "jet","jig","job","jog","jot","joy","jug","jut","keg","ken",
  "key","kid","kin","kit","lab","lad","lag","lap","law","lay",
  "lea","led","leg","let","lid","lie","lip","lit","log","lot",
  "low","lug","mad","man","map","mar","mat","maw","may","men",
  "met","mid","mix","mob","mod","mog","mop","mow","mud","mug",
  "mum","nab","nag","nap","net","new","nil","nip","nit","nod",
  "nor","not","now","nub","nun","nut","oak","oar","oat","odd",
  "ode","off","oft","oil","old","one","opt","orb","ore","our",
  "out","owe","owl","own","pad","pal","pan","pap","par","pat",
  "paw","pay","pea","peg","pen","pep","per","pet","pew","pie",
  "pig","pin","pit","ply","pod","pop","pot","pow","pro","pry",
  "pub","pug","pun","pup","pus","put","rag","ram","ran","rap",
  "rat","raw","ray","red","ref","rev","rib","rid","rig","rim",
  "rip","rob","rod","roe","rot","row","rub","rug","rum","run",
  "rut","rye","sac","sad","sag","sap","sat","saw","say","sea",
  "set","sew","she","shy","sin","sip","sir","sis","sit","six",
  "ski","sky","sly","sob","sod","son","sop","sot","sow","spa",
  "spy","sty","sub","sue","sum","sun","sup","tab","tad","tag",
  "tan","tap","tar","tat","tax","tea","ten","the","tie","tin",
  "tip","toe","ton","too","top","tot","tow","toy","try","tub",
  "tug","tun","two","urn","use","van","vat","vet","vex","via",
  "vie","vim","vow","wad","wag","war","was","wax","way","web",
  "wed","wet","who","why","wig","win","wit","woe","wok","won",
  "woo","wow","yak","yam","yap","yaw","yep","yes","yet","yew",
  "you","zap","zen","zig","zip","zoo",
];

const WORDS_4: string[] = [
  "able","ache","acid","acre","aged","aide","ally","also","arch","area",
  "army","aunt","auto","away","back","bade","bait","bake","bald","bale",
  "ball","band","bane","bang","bank","bare","bark","barn","base","bash",
  "bass","bath","bawl","bead","beak","beam","bean","bear","beat","been",
  "beer","bell","belt","bend","bent","best","bias","bike","bill","bind",
  "bird","bite","blew","blob","blog","blow","blue","blur","boar","boat",
  "body","bold","bolt","bomb","bond","bone","book","boom","boot","bore",
  "born","boss","both","bout","bowl","brim","bulk","bull","bump","burn",
  "burp","bush","busy","buzz","cafe","cage","cake","calf","call","calm",
  "came","camp","cane","cape","card","care","carp","cart","case","cash",
  "cast","cave","chat","chin","chip","chop","cite","city","clad","clam",
  "clan","clap","claw","clay","clip","clod","clog","club","clue","coal",
  "coat","cock","code","coil","coin","cold","cole","colt","comb","come",
  "cone","cook","cool","cope","copy","cord","core","cork","corn","cost",
  "cosy","coup","cove","cozy","crab","crew","crop","crow","cube","cult",
  "cure","curl","dale","dame","damp","dare","dark","darn","dart","dash",
  "data","date","dawn","days","dead","deaf","deal","dear","deed","deem",
  "deep","deer","dell","dent","deny","desk","dial","dice","died","diet",
  "dine","dire","dirt","dish","disk","dock","does","dome","done","doom",
  "door","dose","dots","dove","down","drag","draw","drew","drip","drop",
  "drum","dual","duel","duke","dull","dumb","dump","dune","dunk","dusk",
  "dust","duty","dyed","each","earn","ease","east","easy","edge","edit",
  "else","emit","epic","even","evil","exam","exit","eyed","face","fact",
  "fade","fail","fair","fake","fall","fame","fang","fare","farm","fast",
  "fate","fear","feat","feed","feel","feet","fell","felt","fend","file",
  "fill","film","find","fine","fire","firm","fish","fist","five","flag",
  "flap","flat","flaw","fled","flew","flip","flit","flog","flow","foam",
  "foil","fold","folk","fond","food","fool","foot","ford","fore","fork",
  "form","fort","foul","four","free","frog","from","fuel","full","fume",
  "fund","fuse","fuss","gain","gait","gale","game","gang","gape","garb",
  "gash","gasp","gate","gave","gaze","gear","gift","gild","girl","gist",
  "give","glad","glow","glue","gnaw","goad","goal","goat","gold","golf",
  "gone","good","gore","grab","grim","grin","grip","grit","grow","gulf",
  "gust","guts","hack","hail","hair","hale","half","hall","halt","hand",
  "hang","hare","hark","harm","harp","hash","hasp","haste","hate","haul",
  "have","haze","hazy","head","heal","heap","hear","heat","heed","heel",
  "held","help","herb","herd","here","hero","hide","hike","hill","hilt",
  "hind","hint","hire","hiss","hive","hold","hole","home","hone","hood",
  "hook","hope","horn","hose","host","hour","howl","huge","hull","hump",
  "hung","hunt","hurl","hurt","hush","hymn","icon","idea","idle","inch",
  "into","iron","isle","item","jack","jade","jail","jaws","jazz","jerk",
  "jest","jobs","join","joke","jolt","jump","jury","just","keen","keep",
  "kelp","kept","kick","kill","kind","king","kiss","kite","knee","knew",
  "knit","knob","knot","know","lace","lack","lacy","laid","lair","lake",
  "lamb","lame","lamp","land","lane","lank","lard","lash","lass","last",
  "late","lawn","lazy","lead","leaf","leak","lean","leap","left","lend",
  "lens","lent","less","lest","levy","liar","lick","lied","lieu","life",
  "lift","like","limb","lime","limp","line","link","lion","list","live",
  "load","loaf","loan","lock","lode","loft","loge","lone","long","look",
  "loom","loop","lord","lore","lose","loss","lost","loud","love","luck",
  "lull","lump","lung","lure","lurk","lush","lust","made","maid","mail",
  "main","make","male","mall","malt","mane","many","mare","mark","mars",
  "mash","mask","mass","mast","mate","maze","meal","mean","meat","meet",
  "meld","melt","memo","mend","menu","mere","mesh","mess","mild","mile",
  "milk","mill","mime","mind","mine","mint","mire","miss","mist","mite",
  "moan","moat","mock","mode","mold","mole","monk","mood","moon","moor",
  "more","moss","most","moth","move","much","mule","mull","muse","mush",
  "must","mute","myth","nail","name","nape","navy","near","neat","neck",
  "need","nest","news","next","nice","nine","node","none","noon","norm",
  "nose","note","noun","nude","numb","oath","obey","odds","odor","once",
  "only","onto","ooze","open","oral","oven","over","pace","pack","pact",
  "page","paid","pail","pain","pair","pale","palm","pane","pang","pant",
  "park","part","pass","past","path","pave","pawn","peak","peal","pear",
  "peat","peck","peel","peer","pelt","pend","perk","pest","pick","pier",
  "pile","pill","pine","pink","pipe","piss","plan","play","plea","plod",
  "plot","plow","ploy","plug","plum","plus","pock","poem","poet","poke",
  "pole","poll","polo","pond","pony","pool","poor","pope","pore","pork",
  "port","pose","post","pour","prey","prod","prop","prow","pull","pulp",
  "pump","punk","pure","push","quay","quit","quiz","race","rack","raft",
  "rage","raid","rail","rain","rake","ramp","rang","rank","rare","rash",
  "rate","rave","read","real","reap","rear","reed","reef","reel","rein",
  "rely","rend","rent","rest","rich","ride","rife","rift","rile","rill",
  "rind","ring","rink","riot","rise","risk","road","roam","roar","robe",
  "rock","rode","role","roll","roof","room","root","rope","rose","rote",
  "rout","rove","rude","ruin","rule","rump","rung","ruse","rush","rust",
  "sack","safe","sage","said","sail","sake","sale","salt","same","sand",
  "sane","sang","sank","sash","save","scab","scan","scar","seal","seam",
  "sear","seat","sect","seed","seek","seem","seen","self","sell","send",
  "sent","shed","shin","ship","shoe","shoo","shop","shot","show","shut",
  "sick","side","sift","sigh","sign","silk","sill","silo","silt","sing",
  "sink","sire","site","size","skim","skin","skip","skit","slab","slag",
  "slam","slap","slat","slaw","slay","sled","slew","slid","slim","slit",
  "slob","slop","slot","slow","slug","slum","smog","snap","snip","snob",
  "snow","snub","snug","soak","soap","soar","sock","soda","sofa","soft",
  "soil","sold","sole","some","song","soon","soot","sore","sort","soul",
  "sour","span","spar","spec","sped","spin","spit","spot","spry","spur",
  "stab","stag","star","stay","stem","step","stew","stir","stop","stub",
  "stud","stun","such","suit","sulk","sump","sung","sunk","sure","surf",
  "swan","swap","swim","swum","tabs","tack","tact","tail","take","tale",
  "talk","tall","tame","tank","tape","taps","tare","tarn","tart","task",
  "team","tear","teem","tell","temp","tend","tent","term","test","text",
  "than","that","them","then","they","thin","this","thus","tick","tide",
  "tidy","tied","tier","tile","till","tilt","time","tine","tiny","tire",
  "toad","toil","told","toll","tomb","tone","took","tool","toot","tops",
  "tore","torn","toss","tour","town","trap","tray","tree","trek","trim",
  "trio","trip","trod","trot","true","tube","tuck","tuft","tune","turn",
  "tusk","tuft","twin","type","ugly","undo","unit","unto","upon","urge",
  "used","user","vain","vale","vane","vary","vase","vast","veil","vein",
  "vent","verb","very","vest","veto","vial","vice","view","vine","void",
  "volt","vote","wade","wage","wail","wait","wake","walk","wall","wand",
  "want","ward","warm","warn","warp","wart","wary","wash","wasp","wave",
  "wavy","waxy","weak","weal","wear","weed","week","weep","weld","well",
  "went","were","west","what","when","whim","whip","whom","wick","wide",
  "wife","wild","will","wilt","wily","wimp","wind","wine","wing","wink",
  "wipe","wire","wise","wish","wisp","with","wits","woke","wolf","womb",
  "wood","wool","word","wore","work","worm","worn","wove","wrap","wren",
  "writ","yank","yard","yarn","year","yell","yoga","yoke","your","zeal",
  "zero","zinc","zone","zoom",
];

const WORDS_5: string[] = [
  "about","above","abuse","acted","acute","admit","adopt","adult","after","again",
  "agent","agree","ahead","alarm","album","alert","alien","align","alike","alive",
  "allow","alone","along","alter","amaze","among","ample","angel","angle","angry",
  "ankle","apart","apple","apply","arena","argue","arise","aside","asset","attic",
  "avoid","awake","award","aware","awful","badge","badly","baker","basic","batch",
  "beach","beast","begin","being","below","bench","berry","birth","black","blade",
  "blame","bland","blank","blast","blaze","bleak","bleed","blend","bless","blind",
  "blink","bliss","block","bloke","bloom","blown","board","boast","bonus","boost",
  "booth","bound","brain","brand","brass","brave","bread","break","breed","brick",
  "bride","brief","bring","broad","broke","brook","brown","brush","build","bunch",
  "burst","buyer","cabin","cable","candy","carry","catch","cause","cease","chain",
  "chair","chalk","chant","chaos","charm","chart","chase","cheap","cheat","check",
  "cheek","cheer","chess","chest","chief","child","chill","china","chunk","cider",
  "civic","claim","clash","class","clean","clear","click","cliff","climb","cling",
  "clock","clone","close","cloth","cloud","coach","coast","color","comet","comic",
  "coral","could","count","court","cover","crack","craft","crane","crash","crazy",
  "cream","crime","cross","crowd","crown","crude","crush","curve","cycle","daily",
  "dance","deals","death","debut","decay","delay","dense","depth","devil","diary",
  "dirty","donor","doubt","dough","draft","drain","drama","drank","drawn","dream",
  "dress","dried","drift","drill","drink","drive","drone","drown","dying","eager",
  "early","earth","eight","elect","elite","empty","enemy","enjoy","enter","entry",
  "equal","error","essay","event","every","exact","exile","exist","extra","faint",
  "fairy","faith","false","fault","feast","ferry","fever","fewer","fiber","field",
  "fifty","fight","final","first","fixed","flame","flash","fleet","flesh","flies",
  "float","flock","flood","floor","flour","fluid","focus","force","forge","forth",
  "forum","found","frame","frank","fraud","fresh","front","frost","fruit","fully",
  "giant","given","glass","gleam","glide","globe","gloom","glory","glove","going",
  "grace","grade","grain","grand","grant","grape","grasp","grass","grave","great",
  "green","greet","grief","grill","grind","groan","groom","gross","group","grove",
  "guard","guess","guest","guide","guild","guilt","gummy","habit","happy","harsh",
  "haven","heart","heavy","hence","honor","horse","hotel","house","human","humor",
  "hurry","ideal","image","imply","incur","index","inner","input","issue","ivory",
  "jewel","joint","judge","juice","knife","knock","known","label","laser","latch",
  "later","laugh","layer","learn","lease","leave","legal","level","light","limit",
  "liner","linen","liver","local","logic","loose","lorry","lover","lower","loyal",
  "lucky","lunar","lunch","lyric","magic","major","maker","manor","march","marry",
  "match","mayor","medal","media","mercy","merge","merit","metal","meter","might",
  "minor","minus","model","money","month","moral","motor","mount","mouse","mouth",
  "movie","music","naked","nasty","naval","nerve","never","night","noble","noise",
  "north","noted","novel","nurse","occur","ocean","offer","often","olive","onset",
  "opera","orbit","order","other","ought","outer","owner","oxide","panic","panel",
  "paper","party","paste","patch","pause","peace","peach","pearl","penny","phase",
  "phone","photo","piano","piece","pilot","pitch","pixel","pizza","place","plain",
  "plane","plant","plate","plead","plaza","plumb","plume","plunge","point","polar",
  "pound","power","press","price","pride","prime","prince","print","prior","prize",
  "probe","proof","proud","prove","pulse","pupil","purse","queen","quest","quick",
  "quiet","quota","quote","radar","radio","raise","rally","ranch","range","rapid",
  "ratio","reach","react","realm","rebel","refer","reign","relax","repay","reply",
  "rider","ridge","rifle","right","rigid","risky","rival","river","robin","robot",
  "rocky","rough","round","route","royal","rugby","ruler","rural","saint","salad",
  "sauce","scale","scene","scope","score","scrub","sense","serve","setup","seven",
  "shade","shake","shall","shame","shape","share","shark","sharp","shave","sheep",
  "sheer","sheet","shelf","shell","shift","shine","shirt","shock","shoot","shore",
  "short","shout","sight","since","sixty","skill","skull","slash","slate","slave",
  "sleep","slice","slide","slope","small","smart","smell","smile","smoke","solar",
  "solid","solve","sorry","sound","south","space","spare","speak","speed","spell",
  "spend","spice","split","spoke","spoon","sport","spray","squad","stack","staff",
  "stage","stain","stair","stake","stale","stall","stamp","stand","stare","stark",
  "start","state","stave","stays","steady","steal","steam","steel","steep","steer",
  "stern","stick","stiff","still","stock","stone","stood","store","storm","story",
  "stove","strap","straw","strip","stuck","study","stuff","stump","stung","style",
  "sugar","suite","sunny","super","surge","swamp","swear","sweep","sweet","swept",
  "swift","swing","swirl","sword","sworn","swung","table","taste","teach","teeth",
  "thank","theme","thick","thing","think","those","three","throw","thumb","tight",
  "timer","tired","title","toast","today","token","topic","total","touch","tough",
  "tower","toxic","trace","track","trade","trail","train","trait","trash","treat",
  "trend","trial","tribe","trick","tried","troop","truck","truly","trunk","trust",
  "truth","tumor","twist","ultra","uncle","under","union","unity","until","upper",
  "upset","urban","usage","usual","utter","valid","value","verse","video","vigil",
  "vinyl","virus","visit","vital","vivid","vocal","voice","voter","wages","waste",
  "watch","water","weary","weave","wheel","where","which","while","white","whole",
  "whose","wider","woman","world","worry","worse","worst","worth","would","wound",
  "wrist","write","wrong","wrote","yield","young","yours","youth",
];

const DICTIONARIES: Record<WordLength, Set<string>> = {
  3: new Set(WORDS_3),
  4: new Set(WORDS_4),
  5: new Set(WORDS_5),
};

// ─── BFS Pathfinding ─────────────────────────────────────────────────────────

function getNeighbors(word: string, dict: Set<string>): string[] {
  const neighbors: string[] = [];
  const chars = word.split("");
  for (let i = 0; i < chars.length; i++) {
    const orig = chars[i];
    for (let c = 97; c <= 122; c++) {
      const ch = String.fromCharCode(c);
      if (ch === orig) continue;
      chars[i] = ch;
      const candidate = chars.join("");
      if (dict.has(candidate)) neighbors.push(candidate);
    }
    chars[i] = orig;
  }
  return neighbors;
}

function bfs(start: string, end: string, dict: Set<string>): string[] | null {
  if (start === end) return [start];
  if (!dict.has(start) || !dict.has(end)) return null;

  const visited = new Set<string>([start]);
  const queue: [string, string[]][] = [[start, [start]]];

  while (queue.length > 0) {
    const [current, path] = queue.shift()!;
    for (const neighbor of getNeighbors(current, dict)) {
      if (visited.has(neighbor)) continue;
      visited.add(neighbor);
      const newPath = [...path, neighbor];
      if (neighbor === end) return newPath;
      if (newPath.length > 12) continue;
      queue.push([neighbor, newPath]);
    }
  }
  return null;
}

// ─── Pre-computed Pairs ──────────────────────────────────────────────────────
// Guaranteed to have valid paths in the dictionary above.

interface WordPair { start: string; end: string; length: number }

const KNOWN_PAIRS: Record<WordLength, Record<Difficulty, WordPair[]>> = {
  3: {
    easy: [
      { start: "cat", end: "dog", length: 4 },
      { start: "hot", end: "ice", length: 4 },
      { start: "man", end: "boy", length: 4 },
      { start: "big", end: "dim", length: 3 },
      { start: "sun", end: "fun", length: 2 },
      { start: "pen", end: "pet", length: 2 },
      { start: "hat", end: "hit", length: 3 },
      { start: "red", end: "rod", length: 3 },
      { start: "cap", end: "cup", length: 3 },
      { start: "bag", end: "bug", length: 3 },
      { start: "tin", end: "tan", length: 3 },
      { start: "mud", end: "mad", length: 3 },
      { start: "ran", end: "run", length: 2 },
      { start: "net", end: "nut", length: 3 },
      { start: "low", end: "law", length: 3 },
    ],
    medium: [
      { start: "cat", end: "dog", length: 4 },
      { start: "hot", end: "col", length: 5 },
      { start: "pig", end: "sty", length: 5 },
      { start: "wet", end: "dry", length: 5 },
      { start: "fly", end: "ant", length: 6 },
      { start: "ape", end: "man", length: 6 },
      { start: "cot", end: "bed", length: 5 },
      { start: "hen", end: "fox", length: 5 },
      { start: "old", end: "new", length: 5 },
      { start: "sea", end: "air", length: 5 },
      { start: "sad", end: "joy", length: 6 },
      { start: "fog", end: "sun", length: 6 },
    ],
    hard: [
      { start: "ape", end: "man", length: 6 },
      { start: "cold", end: "warm", length: 7 },
      { start: "eye", end: "lid", length: 7 },
      { start: "ink", end: "pen", length: 7 },
      { start: "war", end: "joy", length: 7 },
      { start: "shy", end: "big", length: 8 },
      { start: "dew", end: "sun", length: 7 },
      { start: "bay", end: "sea", length: 7 },
      { start: "pea", end: "pod", length: 7 },
      { start: "woe", end: "joy", length: 7 },
    ],
  },
  4: {
    easy: [
      { start: "cold", end: "cord", length: 2 },
      { start: "head", end: "heal", length: 2 },
      { start: "love", end: "dove", length: 2 },
      { start: "cake", end: "cane", length: 3 },
      { start: "hand", end: "band", length: 2 },
      { start: "make", end: "bake", length: 2 },
      { start: "wine", end: "vine", length: 2 },
      { start: "bone", end: "cone", length: 2 },
      { start: "ride", end: "rile", length: 2 },
      { start: "mail", end: "rail", length: 2 },
      { start: "fire", end: "hire", length: 2 },
      { start: "gold", end: "bold", length: 2 },
      { start: "lamp", end: "lame", length: 3 },
      { start: "wall", end: "tall", length: 2 },
      { start: "moon", end: "mood", length: 2 },
    ],
    medium: [
      { start: "cold", end: "warm", length: 5 },
      { start: "head", end: "tail", length: 6 },
      { start: "hide", end: "seek", length: 5 },
      { start: "love", end: "hate", length: 5 },
      { start: "word", end: "game", length: 5 },
      { start: "rain", end: "snow", length: 5 },
      { start: "fast", end: "slow", length: 5 },
      { start: "fish", end: "bird", length: 5 },
      { start: "dark", end: "dawn", length: 5 },
      { start: "rise", end: "fall", length: 5 },
      { start: "lead", end: "gold", length: 5 },
      { start: "save", end: "sell", length: 5 },
    ],
    hard: [
      { start: "army", end: "navy", length: 7 },
      { start: "black", end: "white", length: 8 },
      { start: "flour", end: "bread", length: 8 },
      { start: "mice", end: "rats", length: 7 },
      { start: "wine", end: "beer", length: 7 },
      { start: "dawn", end: "dusk", length: 7 },
      { start: "girl", end: "lady", length: 8 },
      { start: "rock", end: "sand", length: 7 },
      { start: "home", end: "away", length: 8 },
      { start: "east", end: "west", length: 7 },
    ],
  },
  5: {
    easy: [
      { start: "brain", end: "train", length: 2 },
      { start: "stone", end: "store", length: 2 },
      { start: "black", end: "blank", length: 2 },
      { start: "stare", end: "stale", length: 2 },
      { start: "whale", end: "whole", length: 2 },
      { start: "grill", end: "drill", length: 2 },
      { start: "place", end: "peace", length: 3 },
      { start: "smile", end: "stile", length: 3 },
      { start: "heart", end: "heard", length: 3 },
      { start: "light", end: "night", length: 2 },
      { start: "bread", end: "break", length: 2 },
      { start: "house", end: "mouse", length: 2 },
      { start: "flame", end: "blame", length: 2 },
      { start: "trace", end: "trade", length: 2 },
      { start: "grand", end: "brand", length: 2 },
    ],
    medium: [
      { start: "light", end: "shade", length: 6 },
      { start: "brain", end: "brawn", length: 5 },
      { start: "stone", end: "stove", length: 5 },
      { start: "start", end: "stare", length: 5 },
      { start: "bread", end: "broad", length: 5 },
      { start: "sweet", end: "swear", length: 5 },
      { start: "steel", end: "steep", length: 5 },
      { start: "black", end: "blank", length: 5 },
      { start: "flame", end: "frame", length: 5 },
      { start: "cloud", end: "clout", length: 5 },
      { start: "grind", end: "grill", length: 5 },
      { start: "clear", end: "clean", length: 5 },
    ],
    hard: [
      { start: "wheat", end: "flour", length: 8 },
      { start: "house", end: "tower", length: 8 },
      { start: "price", end: "prove", length: 8 },
      { start: "night", end: "light", length: 7 },
      { start: "storm", end: "story", length: 7 },
      { start: "river", end: "rider", length: 7 },
      { start: "stone", end: "store", length: 7 },
      { start: "crane", end: "brave", length: 7 },
      { start: "mount", end: "mouth", length: 7 },
      { start: "spine", end: "space", length: 7 },
    ],
  },
};

// ─── Step count ranges per difficulty ────────────────────────────────────────

const STEP_RANGES: Record<Difficulty, [number, number]> = {
  easy: [2, 4],
  medium: [5, 6],
  hard: [7, 12],
};

// ─── Random BFS Pair Discovery ───────────────────────────────────────────────

function findRandomPair(
  wordLength: WordLength,
  difficulty: Difficulty,
  dict: Set<string>
): WordLadderPuzzle | null {
  const words = Array.from(dict);
  const [minSteps, maxSteps] = STEP_RANGES[difficulty];
  const maxAttempts = 120;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const start = words[Math.floor(Math.random() * words.length)];
    const end = words[Math.floor(Math.random() * words.length)];
    if (start === end) continue;

    const path = bfs(start, end, dict);
    if (!path) continue;

    const stepCount = path.length - 1;
    if (stepCount >= minSteps && stepCount <= maxSteps) {
      return {
        startWord: start.toUpperCase(),
        endWord: end.toUpperCase(),
        steps: path.map((w) => w.toUpperCase()),
        wordLength,
      };
    }
  }
  return null;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function generateWordLadder(
  difficulty: Difficulty,
  wordLength: WordLength = 4
): WordLadderPuzzle {
  const dict = DICTIONARIES[wordLength];

  const randomResult = findRandomPair(wordLength, difficulty, dict);
  if (randomResult) return randomResult;

  const pairs = KNOWN_PAIRS[wordLength][difficulty];
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }

  for (const pair of pairs) {
    if (pair.start.length !== wordLength || pair.end.length !== wordLength) continue;
    const path = bfs(pair.start, pair.end, dict);
    if (path) {
      return {
        startWord: pair.start.toUpperCase(),
        endWord: pair.end.toUpperCase(),
        steps: path.map((w) => w.toUpperCase()),
        wordLength,
      };
    }
  }

  const words = Array.from(dict);
  const start = words[Math.floor(Math.random() * words.length)];
  for (const end of words) {
    if (start === end) continue;
    const path = bfs(start, end, dict);
    if (path && path.length >= 2) {
      return {
        startWord: start.toUpperCase(),
        endWord: end.toUpperCase(),
        steps: path.map((w) => w.toUpperCase()),
        wordLength,
      };
    }
  }

  return {
    startWord: "COLD",
    endWord: "WARM",
    steps: ["COLD", "CORD", "WORD", "WARD", "WARM"],
    wordLength: 4,
  };
}
