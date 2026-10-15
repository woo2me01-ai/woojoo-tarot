/* 타로 마스터 12종 — image/Charactor 시트에서 잘라낸 정면 그림(public/chars/<id>/front.webp)
   ar: 정면 그림 가로/세로 비율 · size: 화면에 보이는 크기 배율(기본 1) · 포즈별 크기는 data/poses.json (extract-chars가 만들어요) */
import { P } from "../lib/util.js";

const M = (id, ar, name, kind, gift, size = 1) => ({ id, ar, name, kind, gift, size, img:`chars/${id}/front.webp` });

export const MASTERS = [
  M("blackcat", 1.129, P("루나", "Luna"),     P("검은 고양이", "Black cat"),       P("밤에 더 잘 보이는 직관", "Intuition that sharpens at night")),
  M("griffin",  1.025, P("그리포", "Gryffo"),  P("그리핀", "Griffin"),             P("하늘에서 내려다보는 큰 흐름", "Sees the big picture from the sky")),
  M("panda",    0.817, P("몽실", "Mongsil"),   P("판다", "Panda"),                 P("느긋하게 풀어 주는 연애운", "Unhurried love readings")),
  M("puppy",    1.017, P("콩이", "Kong"),      P("강아지", "Puppy"),               P("사람 사이의 인연 읽기", "Reads the ties between people")),
  M("bluecat",  0.985, P("블루", "Blue"),      P("러시안 블루", "Russian blue"),   P("차분하게 짚는 일·학업운", "Calm advice on work and study")),
  M("skunk",    0.856, P("향기", "Posy"),      P("스컹크", "Skunk"),               P("나쁜 기운은 휙 날려 보내기", "Blows bad luck away"), 1.05),
  M("squirrel", 1.231, P("도토리", "Dotori"),  P("다람쥐", "Squirrel"),            P("차곡차곡 모으는 금전운", "Saving-up money luck")),
  M("unicorn",  0.719, P("유니", "Uni"),       P("유니콘", "Unicorn"),             P("꿈과 소원을 비춰 보기", "Lights up dreams and wishes")),
  M("crow",     1.006, P("눈송이", "Snowy"),   P("흰 까마귀", "White crow"),       P("숨은 소식을 물어 오기", "Brings back hidden news")),
  M("stork",    0.563, P("새벽", "Dawn"),      P("흰 황새", "White stork"),        P("새로운 시작을 알려 주기", "Heralds new beginnings")),
  M("tiger",    1.050, P("범이", "Bumi"),      P("백호", "White tiger"),           P("용기가 필요한 순간의 한마디", "A word when you need courage")),
  M("elephant", 1.152, P("코코", "Coco"),      P("흰 코끼리", "White elephant"),   P("오래 기억하는 행운의 기록", "Remembers every lucky sign")),
];

export const masterOf = id => MASTERS.find(m => m.id === id) || null;

/* 성장 5단계 — 하루 최대 20XP(출석 15 + 오늘의 카드 5), 매일 들어오면 약 6개월(180일)째에 그랜드 마스터
   (꼬마 10일 · 견습 40일 · 수석 90일 · 그랜드 180일) */
export const XP_ATTEND = 15, XP_CARD = 5;
export const STAGES = [
  { xp:0,    scale:.62, name:P("아기 점술가", "Baby seer") },
  { xp:200,  scale:.72, name:P("꼬마 점술가", "Little seer") },
  { xp:800,  scale:.82, name:P("견습 마스터", "Apprentice master") },
  { xp:1800, scale:.91, name:P("수석 마스터", "Senior master") },
  { xp:3600, scale:1,   name:P("그랜드 마스터", "Grand master") },
];
