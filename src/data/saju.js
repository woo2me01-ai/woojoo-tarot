/* 사주 기본 데이터 — 웹(fortune/index.html)에서 옮겨 옴 */
import { P } from "../lib/util.js";

const STEMS = "甲乙丙丁戊己庚辛壬癸", STEMS_KO = "갑을병정무기경신임계";
const BRANCHES = "子丑寅卯辰巳午未申酉戌亥", BRANCHES_KO = "자축인묘진사오미신유술해";
const STEMS_RO = ["Gap","Eul","Byeong","Jeong","Mu","Gi","Gyeong","Sin","Im","Gye"];
const BRANCHES_RO = ["ja","chuk","in","myo","jin","sa","o","mi","sin","yu","sul","hae"];
const ANIMALS_EN = ["Rat","Ox","Tiger","Rabbit","Dragon","Snake","Horse","Goat","Monkey","Rooster","Dog","Pig"];
const BRANCH_EL = [4,2,0,0,2,1,1,2,3,3,2,4];   // 지지의 오행
const EL = [
  { cls:"wood",  han:"木", ko:"목", en:"Wood",  hex:"#6ee7a8", color:{ ko:"초록·청록", en:"Green · Teal" },   dir:{ ko:"동쪽", en:"East" },   nums:"3, 8" },
  { cls:"fire",  han:"火", ko:"화", en:"Fire",  hex:"#fb7185", color:{ ko:"빨강·주황", en:"Red · Orange" },   dir:{ ko:"남쪽", en:"South" },  nums:"2, 7" },
  { cls:"earth", han:"土", ko:"토", en:"Earth", hex:"#fcd34d", color:{ ko:"노랑·베이지", en:"Yellow · Beige" }, dir:{ ko:"중앙", en:"Center" }, nums:"5, 10" },
  { cls:"metal", han:"金", ko:"금", en:"Metal", hex:"#e5e7eb", color:{ ko:"흰색·은색", en:"White · Silver" },  dir:{ ko:"서쪽", en:"West" },   nums:"4, 9" },
  { cls:"water", han:"水", ko:"수", en:"Water", hex:"#7dd3fc", color:{ ko:"검정·남색", en:"Black · Navy" },    dir:{ ko:"북쪽", en:"North" },  nums:"1, 6" },
];
const DAY_MASTER = [
  { ko:"곧게 뻗는 큰 나무", en:"a tall, straight tree" }, { ko:"유연한 풀과 꽃", en:"flexible grass and flowers" },
  { ko:"세상을 비추는 태양", en:"the sun that lights the world" }, { ko:"따뜻한 촛불", en:"a warm candle flame" },
  { ko:"듬직한 큰 산", en:"a steady, great mountain" }, { ko:"기름진 논밭", en:"rich, fertile soil" },
  { ko:"단단한 바위와 쇠", en:"solid rock and steel" }, { ko:"빛나는 보석", en:"a shining jewel" },
  { ko:"넓은 바다와 강", en:"the wide sea and rivers" }, { ko:"촉촉한 이슬비", en:"a gentle misty rain" },
];

/* 십신 (오늘 일진 vs 내 일간) */
// base: [총운, 애정, 금전, 건강, 일·학업]
const GODS = [
  { name:{ ko:"비견", en:"Companion" }, han:"比肩", key:{ ko:"나란히 걷는 날", en:"A day to walk side by side" }, base:[70,62,55,80,75], text:[
    { ko:"나와 같은 기운이 들어오는 날이에요. 혼자보다 함께할 때 힘이 붙고, 오래 미뤄 둔 일을 동료와 나누면 의외로 쉽게 풀려요.",
      en:"Energy like your own flows in today. You gain strength with others rather than alone, and tasks you’ve put off get easier when you share them." },
    { ko:"자신감이 차오르는 하루예요. 다만 고집이 세지기 쉬우니 내 방식만 밀어붙이지 말고 한 번쯤 남의 의견도 들어 보세요.",
      en:"Confidence rises today. You may get stubborn, though — don’t push only your way; listen to someone else’s view at least once." },
    { ko:"비슷한 처지의 사람에게서 힘을 얻는 날이에요. 친구에게 먼저 연락해 보면 반가운 소식이 돌아올 수 있어요.",
      en:"You draw strength from people in a similar situation. Reach out to a friend first and good news may come back." } ]},
  { name:{ ko:"겁재", en:"Rob Wealth" }, han:"劫財", key:{ ko:"나눔과 경쟁의 날", en:"A day of sharing and rivalry" }, base:[60,55,42,70,66], text:[
    { ko:"경쟁심이 살아나는 날이에요. 승부욕이 좋은 결과로 이어질 수 있지만, 무리한 내기나 충동 지출은 피하는 게 좋아요.",
      en:"Your competitive spirit wakes up. That drive can bring good results, but avoid risky bets and impulse spending." },
    { ko:"주변에 사람이 몰리지만 그만큼 돈도 새기 쉬운 하루예요. 지갑은 가볍게, 마음은 넉넉하게 가져가세요.",
      en:"People gather around you, but money slips away just as easily. Keep your wallet light and your heart generous." },
    { ko:"추진력이 강해지는 날이에요. 다만 남의 몫까지 떠안지 않도록 선을 분명히 그어 두세요.",
      en:"Your drive grows stronger. Just draw a clear line so you don’t end up carrying other people’s share." } ]},
  { name:{ ko:"식신", en:"Eating God" }, han:"食神", key:{ ko:"여유와 즐거움의 날", en:"A day of ease and enjoyment" }, base:[85,80,75,85,75], text:[
    { ko:"마음에 여유가 생기는 날이에요. 맛있는 음식, 좋아하는 취미처럼 작은 즐거움이 하루의 운을 끌어올려요.",
      en:"Your mind feels at ease today. Small pleasures like good food or a favorite hobby lift your luck." },
    { ko:"재능이 자연스럽게 드러나는 하루예요. 평소 손에 익은 일을 하면 칭찬이 따라와요.",
      en:"Your talents show naturally today. Do what you’re good at and praise will follow." },
    { ko:"먹을 복이 있는 날이에요. 누군가와 식사 약속을 잡으면 좋은 대화가 오갈 거예요.",
      en:"A day blessed with good food. Make a meal plan with someone and good conversation will flow." } ]},
  { name:{ ko:"상관", en:"Hurting Officer" }, han:"傷官", key:{ ko:"표현과 재치의 날", en:"A day of expression and wit" }, base:[66,72,60,62,56], text:[
    { ko:"말솜씨와 재치가 빛나는 날이에요. 아이디어를 꺼내기 좋지만, 윗사람 앞에서는 한 박자 쉬고 말하세요.",
      en:"Your words and wit shine today. It’s a good time to share ideas, but take a beat before speaking to superiors." },
    { ko:"답답했던 일을 바꾸고 싶은 마음이 커지는 하루예요. 새로운 시도는 좋지만 감정적인 말은 아껴 두세요.",
      en:"You’ll want to change what’s been frustrating you. New attempts are good, but hold back emotional words." },
    { ko:"창의력이 넘치는 날이에요. 글쓰기, 그림, 기획처럼 무언가를 만들어 내는 일에 운이 따라요.",
      en:"Creativity overflows today. Luck follows anything you make — writing, drawing, planning." } ]},
  { name:{ ko:"편재", en:"Indirect Wealth" }, han:"偏財", key:{ ko:"뜻밖의 기회의 날", en:"A day of unexpected chances" }, base:[80,75,88,70,70], text:[
    { ko:"예상하지 못한 곳에서 기회가 들어오는 날이에요. 활동 반경을 넓힐수록 운도 커져요.",
      en:"Opportunities arrive from unexpected places. The wider you roam, the bigger your luck." },
    { ko:"움직이는 만큼 얻는 하루예요. 미뤄 둔 약속이나 외출이 있다면 오늘 다녀오세요.",
      en:"You gain as much as you move today. If you’ve postponed plans or outings, go today." },
    { ko:"사람과 돈이 함께 도는 날이에요. 큰 결정보다는 가벼운 거래나 정리에 유리해요.",
      en:"People and money circulate together. Light deals and tidying up go better than big decisions." } ]},
  { name:{ ko:"정재", en:"Direct Wealth" }, han:"正財", key:{ ko:"차곡차곡 쌓는 날", en:"A day of steady building" }, base:[80,74,85,76,80], text:[
    { ko:"성실함이 보상받는 날이에요. 꼼꼼히 챙긴 일이 그대로 결과로 돌아와요.",
      en:"Diligence pays off today. What you handled carefully comes back as results." },
    { ko:"살림과 돈 관리에 좋은 하루예요. 가계부를 정리하거나 안 쓰는 구독을 정리해 보세요.",
      en:"A good day for managing money and home. Review your budget or cancel subscriptions you don’t use." },
    { ko:"안정감이 큰 날이에요. 새로운 모험보다 지금 하고 있는 일을 잘 마무리하는 데 집중하세요.",
      en:"A day of strong stability. Focus on finishing what you’re already doing rather than a new adventure." } ]},
  { name:{ ko:"편관", en:"Seven Killings" }, han:"偏官", key:{ ko:"버티면 단단해지는 날", en:"A day that makes you stronger" }, base:[56,60,55,54,66], text:[
    { ko:"책임과 압박이 함께 오는 날이에요. 힘들어도 피하지 않고 맞서면 실력이 한 단계 올라가요.",
      en:"Responsibility and pressure come together. Face it instead of avoiding it, and your skills level up." },
    { ko:"예상치 못한 일정 변경이나 부탁이 생길 수 있어요. 여유 시간을 미리 남겨 두세요.",
      en:"Sudden schedule changes or requests may pop up. Leave some spare time in advance." },
    { ko:"긴장감이 높은 하루예요. 무리한 운동이나 과로는 피하고, 일찍 쉬는 게 좋아요.",
      en:"Tension runs high today. Skip overwork and intense workouts, and rest early." } ]},
  { name:{ ko:"정관", en:"Direct Officer" }, han:"正官", key:{ ko:"인정받는 날", en:"A day of recognition" }, base:[80,80,70,75,90], text:[
    { ko:"질서와 원칙이 나를 돕는 날이에요. 맡은 일을 정석대로 처리하면 신뢰를 얻어요.",
      en:"Order and principles are on your side. Handle tasks by the book and you’ll earn trust." },
    { ko:"주변에서 인정받기 좋은 하루예요. 보고, 발표, 면접이 있다면 자신 있게 임하세요.",
      en:"A good day to be recognized. If you have a report, presentation or interview, go in with confidence." },
    { ko:"단정한 모습이 운을 부르는 날이에요. 약속 시간을 지키는 작은 성실함이 좋은 인상을 남겨요.",
      en:"A neat, tidy presence brings luck. Small diligence like being on time leaves a great impression." } ]},
  { name:{ ko:"편인", en:"Indirect Resource" }, han:"偏印", key:{ ko:"직관이 깨어나는 날", en:"A day your intuition wakes" }, base:[62,52,55,66,72], text:[
    { ko:"직감이 예민해지는 날이에요. 머릿속에 떠오른 아이디어는 바로 메모해 두세요.",
      en:"Your intuition is sharp today. Write down ideas the moment they come to you." },
    { ko:"혼자만의 시간이 필요한 하루예요. 사람 많은 곳보다 조용한 곳에서 생각을 정리해 보세요.",
      en:"You need some time alone today. Sort your thoughts somewhere quiet rather than in a crowd." },
    { ko:"새로운 공부나 낯선 분야에 끌리는 날이에요. 이것저것 벌이기보다 하나만 깊게 파 보세요.",
      en:"You’re drawn to new studies or unfamiliar fields. Dig deep into one thing instead of starting many." } ]},
  { name:{ ko:"정인", en:"Direct Resource" }, han:"正印", key:{ ko:"도움이 찾아오는 날", en:"A day help arrives" }, base:[85,70,65,85,80], text:[
    { ko:"주변의 도움과 조언이 들어오는 날이에요. 모르는 건 혼자 끙끙대지 말고 물어보세요.",
      en:"Help and advice come your way. Don’t struggle alone — ask when you don’t know." },
    { ko:"마음이 편안해지는 하루예요. 배우고 읽는 일에 집중력이 높아져요.",
      en:"A day of inner calm. Your focus for learning and reading rises." },
    { ko:"어른이나 선배에게서 좋은 소식이 올 수 있어요. 감사 인사를 전하면 운이 더 커져요.",
      en:"Good news may come from an elder or mentor. Say thank you and your luck grows further." } ]},
];
function tenGod(me, o) {
  const a = stemEl(me), b = stemEl(o), same = (me % 2) === (o % 2);
  if (a === b) return same ? 0 : 1;               // 비견·겁재
  if ((a + 1) % 5 === b) return same ? 2 : 3;     // 내가 생함: 식신·상관
  if ((a + 2) % 5 === b) return same ? 4 : 5;     // 내가 극함: 편재·정재
  if ((b + 2) % 5 === a) return same ? 6 : 7;     // 나를 극함: 편관·정관
  return same ? 8 : 9;                            // 나를 생함: 편인·정인
}

/* 오늘 일지 vs 내 일지 */
const BRANCH_REL = {
  clash: { mod:[-10,-6,-6,-12,-6], text:[
    { ko:"오늘의 일진이 내 일지와 부딪혀요(충). 이동이나 변화가 많을 수 있으니 일정을 넉넉하게 잡으세요.",
      en:"Today’s branch clashes with your day branch (Chung). Expect movement or changes — keep your schedule loose." },
    { ko:"오늘의 일진이 내 일지와 부딪혀요(충). 계획이 바뀌더라도 당황하지 말고 유연하게 대처하면 오히려 기회가 돼요.",
      en:"Today’s branch clashes with your day branch (Chung). Even if plans change, stay flexible and it can become a chance." } ]},
  six:   { mod:[8,12,5,4,6], text:[
    { ko:"오늘의 일진이 내 일지와 짝을 이뤄요(육합). 사람 사이의 일이 부드럽게 풀리는 날이에요.",
      en:"Today’s branch pairs with your day branch (Yukhap). Things between people go smoothly." },
    { ko:"오늘의 일진이 내 일지와 짝을 이뤄요(육합). 반가운 만남이나 화해의 기회가 찾아와요.",
      en:"Today’s branch pairs with your day branch (Yukhap). A welcome meeting or a chance to make up is on its way." } ]},
  three: { mod:[5,5,5,5,7], text:[
    { ko:"오늘의 일진과 내 일지가 한 무리를 이뤄요(삼합). 뜻이 맞는 사람과 힘을 모으기 좋아요.",
      en:"Today’s branch forms a trio with your day branch (Samhap). A good day to join forces with like-minded people." } ]},
  same:  { mod:[2,2,2,2,2], text:[
    { ko:"오늘은 내 일지와 같은 기운이 겹쳐요. 익숙한 방식대로 하면 마음이 편안해요.",
      en:"Today repeats the energy of your day branch. Doing things your familiar way feels comfortable." } ]},
};
function branchRel(me, tb) {
  if (me === tb) return "same";
  if ((me - tb + 12) % 12 === 6) return "clash";
  if ((me + tb) % 12 === 1) return "six";
  if (me % 4 === tb % 4) return "three";
  return null;
}

/* 분야별 문구: [높음, 보통, 낮음] */
const CATS = [
  { icon:"💗", name:P("애정","Love"), lines:[
    [P("마음이 잘 통하는 날이에요. 고백이나 진지한 대화에 좋은 타이밍이에요.","Hearts connect easily today. A great moment for a confession or a serious talk."),
     P("연인과의 사이가 한층 따뜻해져요. 작은 선물이 큰 감동이 돼요.","Things with your partner grow warmer. A small gift makes a big impression."),
     P("새로운 인연이 다가오기 좋은 날이에요. 모임 제안은 거절하지 마세요.","A good day for new connections. Don’t turn down invitations to get together.")],
    [P("무난한 하루예요. 상대의 이야기를 끝까지 들어 주는 것만으로 충분해요.","An easy, ordinary day. Simply listening all the way through is enough."),
     P("큰 변화는 없지만 안부 메시지 하나가 관계를 부드럽게 만들어요.","Not much changes, but one check-in message softens a relationship."),
     P("서두르지 않는 게 좋아요. 자연스러운 흐름에 맡겨 보세요.","Don’t rush. Let things flow naturally.")],
    [P("사소한 말에 서운해지기 쉬운 날이에요. 오해는 바로 풀어 두세요.","Small words can sting today. Clear up misunderstandings right away."),
     P("감정 기복이 생길 수 있어요. 중요한 대화는 내일로 미뤄도 괜찮아요.","Your mood may swing. It’s fine to save important talks for tomorrow."),
     P("기대가 크면 실망도 커요. 오늘은 내 마음부터 챙기세요.","Big expectations bring big disappointment. Take care of your own heart first today.")] ]},
  { icon:"💰", name:P("금전","Money"), lines:[
    [P("돈의 흐름이 좋은 날이에요. 미뤄 둔 정산을 처리하기 좋아요.","Money flows well today. Good for settling pending payments."),
     P("작은 수입이나 뜻밖의 혜택이 생길 수 있어요.","A small income or an unexpected perk may come your way."),
     P("경제 감각이 살아나요. 필요한 물건을 좋은 조건에 살 수 있어요.","Your money sense is sharp. You can get what you need on good terms.")],
    [P("들어오고 나가는 돈이 비슷한 날이에요. 계획한 만큼만 쓰세요.","What comes in and goes out is about even. Spend only what you planned."),
     P("큰 지출은 한 번 더 비교해 보고 결정하세요.","Compare once more before any big purchase."),
     P("현상 유지가 최선인 하루예요. 새로운 일은 천천히 살펴보세요.","Holding steady is best today. Look into new things slowly.")],
    [P("충동구매를 조심하세요. 장바구니에 담아 두고 내일 다시 보세요.","Watch out for impulse buys. Leave it in the cart and look again tomorrow."),
     P("돈을 빌려주거나 보증을 서는 일은 피하는 게 좋아요.","Avoid lending money or co-signing today."),
     P("예상치 못한 지출이 생길 수 있어요. 여유 자금을 남겨 두세요.","Unexpected expenses may come up. Keep some funds in reserve.")] ]},
  { icon:"💪", name:P("건강","Health"), lines:[
    [P("몸이 가볍고 활력이 넘쳐요. 가벼운 운동을 시작하기 좋아요.","You feel light and full of energy. A good day to start light exercise."),
     P("컨디션이 좋은 날이에요. 산책하며 햇볕을 쬐면 기분까지 맑아져요.","You’re in good shape. A walk in the sun will clear your mind, too."),
     P("회복력이 좋은 하루예요. 밀린 일도 거뜬히 해낼 수 있어요.","Your recovery is strong today. You can power through the backlog.")],
    [P("무리만 하지 않으면 괜찮아요. 물을 자주 마셔 주세요.","You’re fine as long as you don’t overdo it. Drink water often."),
     P("규칙적인 식사가 컨디션을 지켜 줘요.","Regular meals keep you in good shape."),
     P("오후에 피로가 몰릴 수 있어요. 틈틈이 스트레칭을 해 주세요.","Fatigue may hit in the afternoon. Stretch now and then.")],
    [P("피로가 쌓이기 쉬운 날이에요. 오늘은 일찍 잠자리에 드세요.","Fatigue builds up easily today. Go to bed early tonight."),
     P("과식과 늦은 야식은 피하는 게 좋아요.","Avoid overeating and late-night snacks."),
     P("몸이 보내는 신호에 귀 기울이세요. 쉬는 것도 실력이에요.","Listen to your body’s signals. Resting is a skill, too.")] ]},
  { icon:"📚", name:P("일·학업","Work"), lines:[
    [P("집중력이 높아 성과를 내기 좋은 날이에요.","Your focus is high — a great day to get results."),
     P("맡은 일이 순조롭게 풀려요. 중요한 일은 오전에 처리하세요.","Tasks run smoothly. Handle the important ones in the morning."),
     P("공부한 내용이 머리에 쏙쏙 들어와요. 시험이나 발표에 유리해요.","What you study sinks right in. Good for exams or presentations.")],
    [P("평소대로만 해도 충분한 날이에요. 할 일 목록을 만들면 효율이 올라가요.","Your usual pace is enough today. A to-do list boosts efficiency."),
     P("협업이 필요한 일은 미리 공유해 두면 수월해요.","Share collaborative work early and it goes more smoothly."),
     P("작은 실수만 조심하면 무난히 마무리돼요.","Just watch for small mistakes and it’ll wrap up fine.")],
    [P("일이 생각보다 더디게 풀려요. 마감은 여유 있게 잡으세요.","Things move slower than expected. Leave room before deadlines."),
     P("집중이 흐트러지기 쉬워요. 휴대폰 알림을 잠시 꺼 두세요.","Your focus scatters easily. Turn off notifications for a while."),
     P("확인을 한 번 더 하세요. 서류와 숫자 실수가 생기기 쉬워요.","Double-check your work. Mistakes in documents and numbers are likely.")] ]},
];

const QUOTES = [
  P("천천히 가도 멈추지만 않으면 돼요.","Go slowly if you must — just don’t stop."), P("오늘 웃은 횟수가 내일의 운을 만들어요.","Today’s smiles shape tomorrow’s luck."),
  P("작은 친절이 큰 행운으로 돌아와요.","A small kindness returns as great luck."), P("완벽보다 완성이 먼저예요.","Done comes before perfect."),
  P("고민될 땐 마음이 가벼워지는 쪽을 고르세요.","When in doubt, choose what makes your heart lighter."), P("오늘 할 수 있는 일은 오늘 끝내요.","Finish today what you can do today."),
  P("고마운 사람에게 한마디 전해 보세요.","Say a word of thanks to someone who helped you."), P("익숙한 길 대신 다른 길로 걸어 보세요.","Take a different road instead of the familiar one."),
  P("물 한 잔과 깊은 숨 한 번이면 충분해요.","A glass of water and a deep breath are enough."), P("기회는 준비된 사람에게 먼저 와요.","Chances find the prepared first."),
  P("남과 비교하지 말고 어제의 나와 비교하세요.","Compare yourself with yesterday’s you, not with others."), P("좋은 일은 생각보다 가까이 있어요.","Good things are closer than you think."),
  P("오늘의 실수는 내일의 경험이에요.","Today’s mistake is tomorrow’s experience."), P("좋아하는 노래 한 곡으로 하루를 시작해 보세요.","Start your day with a song you love."),
  P("정리정돈이 운의 길을 열어 줘요.","Tidying up opens the way for luck."), P("듣는 것이 말하는 것보다 많은 걸 가져다줘요.","Listening brings more than talking."),
];

export const stemEl = s => Math.floor(s / 2);           // 천간의 오행 (0목 1화 2토 3금 4수)
export const pillarName = x => `${STEMS[x.s]}${BRANCHES[x.b]}`;
export const pillarKo = x => `${STEMS_KO[x.s]}${BRANCHES_KO[x.b]}`;
export const pillarRo = x => `${STEMS_RO[x.s]}-${BRANCHES_RO[x.b]}`;
export { STEMS, STEMS_KO, BRANCHES, BRANCHES_KO, STEMS_RO, BRANCHES_RO, ANIMALS_EN, BRANCH_EL, EL, DAY_MASTER, GODS, tenGod, BRANCH_REL, branchRel, CATS, QUOTES };
