/* 스프레드(카드 배열)와 테마 타로 8종
   풀이 = 테마의 자리별 서두(lead) + 카드의 주제별 풀이(topic) */
import { P } from "../lib/util.js";

export const SPREADS = {
  daily:  P(["오늘의 카드"], ["Card of the day"]),
  one:    P(["답"], ["Answer"]),
  three:  P(["과거", "현재", "미래"], ["Past", "Present", "Future"]),
  mind:   P(["그 사람의 생각", "그 사람의 감정", "앞으로의 행동"], ["Their thoughts", "Their feelings", "What they’ll do"]),
  flow:   P(["지금 상황", "걸림돌", "결과"], ["The situation", "The obstacle", "The outcome"]),
  choice: P(["지금 상황", "A를 고르면", "B를 고르면", "조언"], ["The situation", "If you choose A", "If you choose B", "Advice"]),
};
export const FREE_SPREADS = ["one", "three"];

export const THEMES = [
  { id:"inner-mind", icon:"💭", topic:"love", spread:"mind",
    title:P("속마음", "Their true feelings"), desc:P("그 사람은 나를 어떻게 생각할까?", "What do they really think of me?"),
    lead:[P("그 사람이 당신을 떠올릴 때의 생각이에요.", "This is what goes through their mind when they think of you."),
          P("겉으로 드러내지 않은 마음 깊은 곳의 감정이에요.", "These are the feelings they keep beneath the surface."),
          P("앞으로 그 사람은 이런 모습으로 움직일 거예요.", "This is how they’re likely to act next.")] },
  { id:"some", icon:"💘", topic:"love", spread:"mind",
    title:P("썸 타로", "Is it a crush?"), desc:P("우리 사이, 썸일까? 그 사람의 관심도", "Is this a spark? How interested are they?"),
    lead:[P("그 사람이 지금 우리 사이를 이렇게 보고 있어요.", "This is how they see the two of you right now."),
          P("당신을 향한 관심의 온도는 이 정도예요.", "This is the temperature of their interest in you."),
          P("가까워지려면 이런 흐름을 기대해 볼 수 있어요.", "If you get closer, this is the flow you can expect.")] },
  { id:"reunion", icon:"🔁", topic:"love", spread:"three",
    title:P("재회", "Getting back together"), desc:P("우리, 다시 만날 수 있을까?", "Can we find our way back?"),
    lead:[P("헤어짐에 영향을 준 지난 흐름이에요.", "This is the past flow that led to the parting."),
          P("지금 두 사람 사이에 남아 있는 기운이에요.", "This is the energy still between you now."),
          P("다시 이어질 가능성은 이렇게 흘러가요.", "This is how the chance of reconnecting unfolds.")] },
  { id:"solo-love", icon:"🌷", topic:"love", spread:"three",
    title:P("솔로 연애운", "Love for singles"), desc:P("나에게 다가올 인연은 어떤 모습일까?", "What kind of love is coming my way?"),
    lead:[P("지금까지 연애에 영향을 준 나의 모습이에요.", "This is the part of you that has shaped your love life so far."),
          P("지금 내 연애운의 상태예요.", "This is where your love luck stands now."),
          P("곧 다가올 인연은 이런 모습이에요.", "This is what your coming love looks like.")] },
  { id:"money-flow", icon:"💰", topic:"money", spread:"three",
    title:P("금전 흐름", "Money flow"), desc:P("앞으로 내 돈의 흐름은 어떻게 될까?", "Where is my money heading?"),
    lead:[P("지금의 금전 상황을 만든 지난 습관이에요.", "These are the past habits behind your current finances."),
          P("지금 돈이 흐르는 모습이에요.", "This is how your money is flowing now."),
          P("앞으로 몇 달의 금전 흐름이에요.", "This is your money flow over the coming months.")] },
  { id:"interview", icon:"📝", topic:"work", spread:"flow",
    title:P("면접·합격", "Interviews & exams"), desc:P("이번에는 붙을 수 있을까?", "Will I pass this time?"),
    lead:[P("지금 나의 준비 상태예요.", "This is how prepared you are right now."),
          P("합격을 가로막을 수 있는 부분이에요.", "This is what could stand in your way."),
          P("결과는 이런 흐름으로 다가와요.", "This is how the result is shaping up.")] },
  { id:"career", icon:"🧭", topic:"work", spread:"flow",
    title:P("진로·이직", "Career & job change"), desc:P("지금 이 길이 나에게 맞을까?", "Is this the right path for me?"),
    lead:[P("지금 일과 진로에서 내가 서 있는 자리예요.", "This is where you stand in your work and path."),
          P("변화를 망설이게 만드는 걸림돌이에요.", "This is what makes you hesitate to change."),
          P("움직였을 때 기대할 수 있는 결과예요.", "This is what you can expect if you make a move.")] },
  { id:"choice-ab", icon:"⚖️", topic:null, spread:"choice", ab:true,
    title:P("A/B 선택", "A or B?"), desc:P("둘 중 무엇을 고르는 게 나을까?", "Which of the two should I choose?"),
    lead:[P("지금 선택 앞에 놓인 상황이에요.", "This is the situation you face."),
          P("A를 고르면 이런 흐름이 펼쳐져요.", "If you choose A, this is how things unfold."),
          P("B를 고르면 이런 흐름이 펼쳐져요.", "If you choose B, this is how things unfold."),
          P("어느 쪽이든 기억해 둘 조언이에요.", "Whichever you pick, keep this advice in mind.")] },
];
export const themeById = id => THEMES.find(x => x.id === id) || null;

// 홈 화면 바로가기 4개
export const QUICK_THEMES = ["inner-mind", "some", "reunion", "money-flow"];

export const CHOICE_SUM = {
  a:    P("A 쪽 흐름이 더 밝아요. 조언 카드를 참고해 A로 마음을 정해 봐도 좋아요.", "A’s flow is brighter. With the advice card in mind, you could settle on A."),
  b:    P("B 쪽 흐름이 더 밝아요. 조언 카드를 참고해 B로 마음을 정해 봐도 좋아요.", "B’s flow is brighter. With the advice card in mind, you could settle on B."),
  even: P("두 선택의 기운이 비슷해요. 정답보다 조언 카드가 말하는 태도가 더 중요해요.", "Both choices feel similar. The attitude in the advice card matters more than the ‘right’ answer."),
};
