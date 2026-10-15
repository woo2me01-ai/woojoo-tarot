/* 별자리 데이터 — 웹(fortune/index.html)에서 옮겨 옴 */
import { P } from "../lib/util.js";

const SIGNS = [
  { name:P("양자리","Aries"),        sym:"♈", dates:P("3월 21일 ~ 4월 19일","Mar 21 – Apr 19"),   color:P("빨강","Red"),        hex:"#fb7185",
    about:P("앞장서는 용기와 솔직함이 매력인 개척자예요. 망설이기보다 먼저 부딪혀 보는 쪽이에요.","A pioneer with courage and honesty. You’d rather jump in first than hesitate.") },
  { name:P("황소자리","Taurus"),     sym:"♉", dates:P("4월 20일 ~ 5월 20일","Apr 20 – May 20"),   color:P("초록","Green"),      hex:"#6ee7a8",
    about:P("느긋해 보여도 한번 정하면 끝까지 가는 끈기가 있어요. 좋은 음식과 편안함을 아는 사람이에요.","You may seem easygoing, but once you decide, you see it through. You know the value of good food and comfort.") },
  { name:P("쌍둥이자리","Gemini"),   sym:"♊", dates:P("5월 21일 ~ 6월 21일","May 21 – Jun 21"),   color:P("노랑","Yellow"),     hex:"#fde68a",
    about:P("호기심이 많고 말솜씨가 좋아 어디서나 대화의 중심이 돼요. 새로운 소식에 누구보다 빨라요.","Curious and quick with words, you’re the heart of any conversation. You hear the news before anyone else.") },
  { name:P("게자리","Cancer"),       sym:"♋", dates:P("6월 22일 ~ 7월 22일","Jun 22 – Jul 22"),   color:P("은색","Silver"),     hex:"#e5e7eb",
    about:P("정이 많고 가까운 사람을 지키는 따뜻한 마음을 가졌어요. 집과 가족이 큰 힘이 돼요.","Warm and caring, you protect the people close to you. Home and family are your strength.") },
  { name:P("사자자리","Leo"),        sym:"♌", dates:P("7월 23일 ~ 8월 22일","Jul 23 – Aug 22"),   color:P("금색","Gold"),       hex:"#fcd34d",
    about:P("밝은 에너지로 주변을 환하게 만드는 타고난 주인공이에요. 마음이 넓고 의리가 있어요.","A natural star who lights up every room. Big-hearted and loyal.") },
  { name:P("처녀자리","Virgo"),      sym:"♍", dates:P("8월 23일 ~ 9월 22일","Aug 23 – Sep 22"),   color:P("베이지","Beige"),    hex:"#e7d3a8",
    about:P("섬세하고 꼼꼼해서 작은 차이도 놓치지 않아요. 남을 돕는 데서 보람을 느껴요.","Delicate and thorough, you never miss the small details. Helping others gives you joy.") },
  { name:P("천칭자리","Libra"),      sym:"♎", dates:P("9월 23일 ~ 10월 22일","Sep 23 – Oct 22"),  color:P("분홍","Pink"),       hex:"#f9a8d4",
    about:P("균형 감각이 뛰어나고 사람 사이를 부드럽게 이어 줘요. 아름다운 것을 알아보는 눈이 있어요.","With a fine sense of balance, you connect people gently. You have an eye for beauty.") },
  { name:P("전갈자리","Scorpio"),    sym:"♏", dates:P("10월 23일 ~ 11월 22일","Oct 23 – Nov 22"), color:P("자주","Plum"),       hex:"#c084fc",
    about:P("깊이 있는 집중력과 강한 직감을 지녔어요. 한번 마음을 주면 끝까지 지켜요.","Deep focus and strong intuition. Once you give your heart, you keep it.") },
  { name:P("사수자리","Sagittarius"),sym:"♐", dates:P("11월 23일 ~ 12월 21일","Nov 23 – Dec 21"), color:P("보라","Purple"),     hex:"#a78bfa",
    about:P("자유롭고 낙천적이라 늘 새로운 세계로 떠날 준비가 돼 있어요. 솔직한 유머가 매력이에요.","Free-spirited and optimistic, always ready to set off for new worlds. Your honest humor is your charm.") },
  { name:P("염소자리","Capricorn"),  sym:"♑", dates:P("12월 22일 ~ 1월 19일","Dec 22 – Jan 19"),  color:P("갈색","Brown"),      hex:"#c8a07a",
    about:P("목표를 향해 묵묵히 오르는 책임감 강한 노력파예요. 시간이 지날수록 빛나는 사람이에요.","A responsible, hardworking climber headed for the goal. You shine brighter with time.") },
  { name:P("물병자리","Aquarius"),   sym:"♒", dates:P("1월 20일 ~ 2월 18일","Jan 20 – Feb 18"),   color:P("하늘색","Sky blue"), hex:"#7dd3fc",
    about:P("독창적인 생각으로 남들이 못 본 길을 먼저 찾아내요. 친구를 소중히 여기는 자유로운 영혼이에요.","Your original thinking finds paths others miss. A free spirit who treasures friends.") },
  { name:P("물고기자리","Pisces"),   sym:"♓", dates:P("2월 19일 ~ 3월 20일","Feb 19 – Mar 20"),   color:P("청록","Teal"),       hex:"#5eead4",
    about:P("상상력과 공감 능력이 풍부한 다정한 몽상가예요. 예술적인 감각이 뛰어나요.","A gentle dreamer full of imagination and empathy, with a fine artistic sense.") },
];
const TXT = "︎";   // 기호를 그림 이모지가 아닌 글자로 표시
// 오늘 달이 지나는 자리(내 별자리 기준 1~12번째) — base: [총운, 애정, 금전, 건강, 일·학업]
const HOUSES = [
  { area:P("나 자신","Self"), key:P("나를 드러내는 날","A day to shine as yourself"), base:[82,72,68,80,76], text:[
    P("달이 내 별자리에 머물러 감정과 직감이 또렷해지는 날이에요. 하고 싶은 말이 있다면 오늘 꺼내 보세요.","The Moon is in your sign, so your feelings and instincts are clear. If there’s something you want to say, say it today."),
    P("나에게 시선이 모이는 하루예요. 첫인상이 중요한 자리라면 평소보다 조금 더 신경 써 보세요.","Eyes are on you today. If first impressions matter, put in a little extra care.") ]},
  { area:P("재물","Money"), key:P("실속을 챙기는 날","A day to secure what counts"), base:[74,62,88,72,74], text:[
    P("돈과 물건, 내가 가진 것에 마음이 가는 날이에요. 지출을 정리하면 새는 돈이 보여요.","Your mind turns to money and belongings. Review your spending and you’ll spot the leaks."),
    P("작은 실속이 쌓이는 하루예요. 오래 쓸 물건을 고르기 좋아요.","Small gains add up today. A good time to choose things that last.") ]},
  { area:P("소통","Communication"), key:P("말과 소식의 날","A day of words and news"), base:[76,74,66,72,80], text:[
    P("연락과 대화가 활발해지는 날이에요. 미뤄 둔 답장을 보내면 일이 술술 풀려요.","Messages and conversations pick up. Send that overdue reply and things will flow."),
    P("가까운 곳으로의 짧은 이동이나 배움에 운이 따라요. 메모하는 습관이 도움이 돼요.","Short trips nearby and learning are favored. Taking notes will help.") ]},
  { area:P("가정","Home"), key:P("집과 마음을 돌보는 날","A day to care for home and heart"), base:[66,70,60,74,58], text:[
    P("바깥보다 집이 편한 날이에요. 방을 정리하거나 가족과 시간을 보내면 마음이 채워져요.","Home feels better than outside today. Tidy your room or spend time with family to recharge."),
    P("감정이 예민해질 수 있어요. 익숙한 공간에서 충전하는 게 좋아요.","You may feel sensitive. Recharge in a familiar place.") ]},
  { area:P("즐거움·연애","Joy & Romance"), key:P("설렘과 즐거움의 날","A day of joy and butterflies"), base:[88,92,70,78,68], text:[
    P("즐거운 일이 생기기 쉬운 날이에요. 좋아하는 일에 시간을 쓰면 운이 더 커져요.","Fun things happen easily today. Spend time on what you love and your luck grows."),
    P("설레는 만남이나 연락이 기대되는 하루예요. 표현을 아끼지 마세요.","A heart-fluttering meeting or message may come. Don’t hold back your feelings.") ]},
  { area:P("건강·일상","Health & Routine"), key:P("생활을 정돈하는 날","A day to tidy up your life"), base:[68,58,66,84,82], text:[
    P("할 일을 하나씩 정리하기 좋은 날이에요. 작은 루틴이 큰 차이를 만들어요.","A good day to clear tasks one by one. Small routines make a big difference."),
    P("몸과 생활 습관을 돌보기 좋은 하루예요. 가벼운 운동과 충분한 물이 도움이 돼요.","Take care of your body and habits today. Light exercise and plenty of water help.") ]},
  { area:P("관계","Partnership"), key:P("관계가 빛나는 날","A day relationships shine"), base:[80,88,68,70,72], text:[
    P("함께하는 사람과의 호흡이 좋아지는 날이에요. 협력하면 혼자일 때보다 멀리 가요.","You click with the people around you. Together you’ll go further than alone."),
    P("상대의 입장에서 생각해 보면 관계가 한층 가까워져요. 약속을 잡기에도 좋은 날이에요.","See things from the other person’s side and you’ll grow closer. A good day to make plans together, too.") ]},
  { area:P("깊은 마음","Inner Depths"), key:P("깊이 들여다보는 날","A day to look deeper"), base:[60,66,74,58,64], text:[
    P("겉보다 속을 살피게 되는 날이에요. 마음속 고민을 정리하면 답이 보여요.","You look beneath the surface today. Sort out what’s on your mind and the answer appears."),
    P("감정이 깊어지는 하루예요. 남의 돈이나 함께하는 일은 꼼꼼히 확인하세요.","Feelings run deep today. Double-check anything involving shared money or joint work.") ]},
  { area:P("배움·여행","Learning & Travel"), key:P("멀리 보는 날","A day to look far ahead"), base:[80,70,66,76,82], text:[
    P("시야가 넓어지는 날이에요. 새로운 공부나 여행 계획을 세우기 좋아요.","Your horizons widen. A good day to plan new studies or a trip."),
    P("평소 관심 없던 분야에서 영감을 얻을 수 있어요. 낯선 것에 마음을 열어 보세요.","You may find inspiration in an unfamiliar field. Open your mind to something new.") ]},
  { area:P("일·명예","Career"), key:P("목표에 다가가는 날","A day closer to your goals"), base:[84,64,78,68,92], text:[
    P("일과 목표에 집중력이 높아지는 날이에요. 중요한 결정을 내리기 좋아요.","Your focus on work and goals rises. A good day for important decisions."),
    P("노력이 눈에 띄는 하루예요. 주변의 인정을 받을 수 있어요.","Your efforts get noticed today. You may win recognition from those around you.") ]},
  { area:P("친구·희망","Friends & Hopes"), key:P("친구와 함께하는 날","A day with friends"), base:[82,78,74,76,74], text:[
    P("친구와 모임에서 좋은 기운을 얻는 날이에요. 오랜만에 연락해 보세요.","You gain good energy from friends and gatherings. Reach out to someone you haven’t talked to in a while."),
    P("바라던 일이 한 걸음 가까워지는 하루예요. 함께 꿈을 나눌 사람을 찾아보세요.","A wish comes one step closer. Look for someone to share your dreams with.") ]},
  { area:P("휴식","Rest"), key:P("쉬어 가는 날","A day to pause and recharge"), base:[56,58,56,62,54], text:[
    P("에너지가 안으로 모이는 날이에요. 무리하기보다 푹 쉬며 내일을 준비하세요.","Your energy turns inward. Rest well and prepare for tomorrow instead of pushing yourself."),
    P("혼자만의 시간이 큰 힘이 되는 하루예요. 일기를 쓰거나 조용히 생각을 정리해 보세요.","Time alone gives you strength today. Try journaling or quietly sorting your thoughts.") ]},
];
const ZCAT_LINES = [   // [높음, 보통, 낮음]
  [P("호감을 표현하면 좋은 반응이 돌아와요.","Show your interest and you’ll get a warm response."), P("편안한 대화가 관계를 이어 줘요.","Easy conversation keeps the connection going."), P("말투 하나에 오해가 생길 수 있어요. 한 번 더 부드럽게 말해 보세요.","One wrong tone can cause a misunderstanding. Say it once more, gently.")],
  [P("계획에 없던 작은 이득이 생길 수 있어요.","A small, unplanned gain may come your way."), P("꼭 필요한 곳에만 쓰면 무난해요.","Spend only where you must and you’ll be fine."), P("충동적인 결제는 하루만 미뤄 보세요.","Put impulse payments off for just one day.")],
  [P("몸이 가벼워요. 걷기나 스트레칭으로 기운을 이어 가세요.","You feel light. Keep the energy going with a walk or stretching."), P("충분한 수면이 컨디션을 지켜 줘요.","Enough sleep keeps you in good shape."), P("피곤이 쌓이기 쉬워요. 오늘은 무리하지 마세요.","Fatigue piles up easily. Don’t push yourself today.")],
  [P("집중이 잘 되는 날이에요. 어려운 일부터 처리하세요.","Your focus is great today. Tackle the hard tasks first."), P("평소 페이스를 지키면 충분해요.","Keep your usual pace and that’s enough."), P("실수가 생기기 쉬워요. 마무리 전에 한 번 더 확인하세요.","Mistakes are likely. Check once more before you wrap up.")],
];
const LUCKY_ITEMS = [P("손수건","Handkerchief"),P("이어폰","Earphones"),P("노트","Notebook"),P("텀블러","Tumbler"),P("핸드크림","Hand cream"),P("책갈피","Bookmark"),
  P("동전","Coin"),P("머리끈","Hair tie"),P("선글라스","Sunglasses"),P("볼펜","Pen"),P("손목시계","Wristwatch"),P("작은 거울","Small mirror"),
  P("사탕","Candy"),P("에코백","Tote bag"),P("우산","Umbrella"),P("열쇠고리","Keychain"),P("립밤","Lip balm"),P("엽서","Postcard")];

export { SIGNS, TXT, HOUSES, ZCAT_LINES, LUCKY_ITEMS };
