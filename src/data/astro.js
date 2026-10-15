/* 별자리 × 타로 연결 — 골든 돈(Golden Dawn) 점성 대응을 따름
   · 별자리마다 수호 메이저 카드 1장 (guardian)
   · 모든 카드에 원소 (마이너는 수트, 메이저는 대응 별자리·행성)
   · 결과 화면: 수호 카드가 나오면 GUARDIAN_MSG, 아니면 ELEMENT_MATCH[별자리 원소][카드 원소] */
import { P } from "../lib/util.js";

export const ELEMENTS = {
  fire:  { name:P("불","Fire"),   ic:"🔥" },
  earth: { name:P("흙","Earth"),  ic:"🌿" },
  air:   { name:P("공기","Air"),  ic:"💨" },
  water: { name:P("물","Water"),  ic:"💧" },
};
// 별자리 순서(양자리 0 … 물고기자리 11)는 불·흙·공기·물이 차례로 돌아요
export const SIGN_ELEMENT = i => ["fire", "earth", "air", "water"][i % 4];

// 별자리 → 수호 메이저 카드 번호
export const GUARDIAN = [4, 5, 6, 7, 8, 9, 11, 13, 14, 15, 17, 18];

// 메이저 22장의 원소 (별자리 카드는 그 별자리의 원소, 행성 카드는 전통 대응)
const MAJOR_ELEMENT = ["air","air","water","earth","fire","earth","air","water","fire","earth","fire",
                       "air","water","water","fire","earth","fire","air","water","fire","fire","earth"];
const SUIT_ELEMENT = { wands:"fire", cups:"water", swords:"air", pents:"earth" };
export const cardElement = (card, i) => card.suit ? SUIT_ELEMENT[card.suit.file] : MAJOR_ELEMENT[i];

export const GUARDIAN_MSG = [
  P("황제는 양자리의 수호 카드예요. 당신 안의 리더십이 깨어나는 신호이니, 오늘은 주도권을 잡아 보세요.",
    "The Emperor is Aries’ guardian card. Your inner leader is waking up — take the lead today."),
  P("교황은 황소자리의 수호 카드예요. 믿을 수 있는 조언과 오래된 지혜가 당신을 돕고 있어요.",
    "The Hierophant is Taurus’ guardian card. Trusted advice and old wisdom are on your side."),
  P("연인은 쌍둥이자리의 수호 카드예요. 중요한 선택 앞에서 마음이 통하는 사람이 곁에 있어요.",
    "The Lovers is Gemini’s guardian card. Someone who truly understands you stands beside you at this crossroads."),
  P("전차는 게자리의 수호 카드예요. 지키고 싶은 것을 위해 앞으로 나아갈 힘이 주어졌어요.",
    "The Chariot is Cancer’s guardian card. You’ve been given the strength to move forward for what you want to protect."),
  P("힘은 사자자리의 수호 카드예요. 부드러운 용기로 어떤 상황도 다스릴 수 있는 날이에요.",
    "Strength is Leo’s guardian card. With gentle courage, you can handle anything today."),
  P("은둔자는 처녀자리의 수호 카드예요. 조용히 스스로를 돌아볼 때 가장 정확한 답이 보여요.",
    "The Hermit is Virgo’s guardian card. The clearest answer appears when you quietly look within."),
  P("정의는 천칭자리의 수호 카드예요. 균형 잡힌 판단이 공정한 결과로 돌아올 거예요.",
    "Justice is Libra’s guardian card. A balanced judgment will come back as a fair result."),
  P("죽음은 전갈자리의 수호 카드예요. 끝은 곧 새로운 시작이에요. 낡은 것을 보내 줄 용기가 생겨요.",
    "Death is Scorpio’s guardian card. Every ending is a new beginning — you’ll find the courage to let go."),
  P("절제는 사수자리의 수호 카드예요. 서두르지 않고 조화를 찾을 때 멀리 갈 수 있어요.",
    "Temperance is Sagittarius’ guardian card. Find harmony without rushing and you’ll go far."),
  P("악마는 염소자리의 수호 카드예요. 나를 묶고 있던 것을 알아차리는 순간 더 높이 오를 수 있어요.",
    "The Devil is Capricorn’s guardian card. The moment you see what binds you, you can climb higher."),
  P("별은 물병자리의 수호 카드예요. 희망이 반짝이는 신호이니 꿈꾸던 일을 믿고 나아가세요.",
    "The Star is Aquarius’ guardian card. Hope is shining — trust your dream and move toward it."),
  P("달은 물고기자리의 수호 카드예요. 직감이 가장 예민해지는 때이니 꿈과 느낌에 귀 기울이세요.",
    "The Moon is Pisces’ guardian card. Your intuition is at its sharpest — listen to your dreams and feelings."),
];

// [별자리 원소][카드 원소] → 한 줄
export const ELEMENT_MATCH = {
  fire: {
    fire:  P("같은 불의 기운이라 추진력이 두 배예요. 망설이던 일을 오늘 시작해 보세요.", "Fire meets fire — your drive doubles. Start what you’ve been putting off."),
    earth: P("불의 열정에 흙의 현실감이 더해져요. 계획을 숫자로 적으면 실행이 쉬워져요.", "Earth grounds your fire. Write your plan in numbers and it gets easier to act."),
    air:   P("바람이 불씨를 키우듯 주변의 말과 아이디어가 당신을 움직여요. 대화에서 힌트를 찾으세요.", "Like wind feeding a flame, others’ words and ideas move you. Look for hints in conversation."),
    water: P("물이 불을 식히듯 감정이 앞길을 막을 수 있어요. 한 박자 쉬고 마음을 먼저 들여다보세요.", "Water cools fire — feelings may slow you down. Pause and look at your heart first."),
  },
  earth: {
    fire:  P("흙 위에 불이 붙듯 굳어 있던 일이 움직이기 시작해요. 작은 변화를 받아들여 보세요.", "Fire on earth — stuck things start to move. Welcome a small change."),
    earth: P("같은 흙의 기운이라 차근차근 쌓은 것이 결과로 돌아와요. 꾸준함이 오늘의 무기예요.", "Earth meets earth — what you built step by step pays off. Steadiness is your weapon today."),
    air:   P("흙과 바람은 결이 달라 생각이 많아질 수 있어요. 고민은 짧게, 손에 잡히는 것부터 하세요.", "Earth and air pull different ways, so you may overthink. Keep it short and start with what’s in reach."),
    water: P("물이 흙을 적시듯 마음이 촉촉해지는 흐름이에요. 가까운 사람에게 다정함을 표현해 보세요.", "Water softens earth — your heart opens up. Show some tenderness to someone close."),
  },
  air: {
    fire:  P("바람이 불을 키우듯 생각이 곧바로 행동으로 이어져요. 떠오른 아이디어를 바로 실행해 보세요.", "Air fans the fire — thoughts turn straight into action. Try your idea right away."),
    earth: P("가벼운 바람에 흙의 무게가 실려요. 아이디어를 현실적인 계획으로 정리하기 좋은 때예요.", "Earth gives your air some weight. A good time to turn ideas into a real plan."),
    air:   P("같은 공기의 기운이라 머리가 맑고 말이 잘 통해요. 연락과 대화에 운이 따라요.", "Air meets air — your mind is clear and words flow. Luck follows messages and talks."),
    water: P("바람이 물결을 일으키듯 감정이 출렁일 수 있어요. 머리보다 마음이 원하는 쪽을 살펴보세요.", "Wind stirs the water — feelings may sway. Check what your heart wants, not just your head."),
  },
  water: {
    fire:  P("물과 불이 만나 김이 오르듯 감정이 뜨거워져요. 충동적으로 정하기보다 하루만 기다려 보세요.", "Water meets fire and steam rises — feelings run hot. Wait a day before deciding."),
    earth: P("물이 흙을 만나 싹을 틔우듯 마음을 쏟은 일이 자라나요. 정성이 결실로 이어지는 흐름이에요.", "Water on earth sprouts seeds — what you care for grows. Your devotion bears fruit."),
    air:   P("물 위에 바람이 스치듯 마음이 이리저리 흔들릴 수 있어요. 남의 말보다 내 직감을 믿으세요.", "Wind over water — your heart may waver. Trust your intuition over others’ words."),
    water: P("같은 물의 기운이라 직감과 공감이 깊어져요. 마음이 이끄는 대로 움직여도 좋아요.", "Water meets water — intuition and empathy deepen. Follow where your heart leads."),
  },
};

/* 뽑힌 카드 + 내 별자리 → 결과 화면의 별자리 한 줄 */
export function zodiacNote(sign, card, cardIndex) {
  if (sign == null) return null;
  if (GUARDIAN[sign] === cardIndex) return { guardian:true, text:GUARDIAN_MSG[sign] };
  const se = SIGN_ELEMENT(sign), ce = cardElement(card, cardIndex);
  return { guardian:false, signEl:se, cardEl:ce, text:ELEMENT_MATCH[se][ce] };
}
