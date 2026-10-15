// 캐릭터 시트 파일과 포즈 번호(extract-chars --debug 미리보기의 번호)
//   front 정면 · left 왼쪽 옆모습(오른쪽은 좌우 반전해서 써요) · back 뒷모습 · walk 걷기 · run 달리기
//   smile 미소(몸 전체가 그려진 것만) · laugh 웃음 · cry 울음 · angry 화남
// gap/line: 연필선이 흐리거나 틈이 큰 시트의 배경 지우기 조정 · solid: 아랫부분이 열린 얼굴 그림이라 안쪽을 흰색으로 채울 포즈
// row2: 시트 아랫줄 포즈 배율(자동 계산이 틀릴 때) · faceW: 얼굴만 그린 표정의 너비(정면 키에 대한 비율)
// cut: 옆 포즈의 장식이 붙어 온 부분을 지울 사각형(그림에 대한 비율) · scale: 포즈별 크기 배율
// cx: 꼬리 뺀 몸 가운데를 손으로 정한 값(그림 너비에 대한 비율) — 꼬리가 몸만큼 두꺼워 자동 계산이 틀리는 포즈만
// partial: 몸이 다 안 그려진 포즈(얼굴만 그린 건 자동). 기본 모습과 누를 때 반응엔 안 쓰고 결과 표정에만 써요
// dir: 걷기·달리기 그림이 바라보는 쪽(l 왼쪽 · r 오른쪽). 걸어갈 방향과 다르면 좌우 반전해요
const STD = { front:0, left:1, back:3, walk:4, run:5 };
export const CHAR_SHEETS = [
  { id:"blackcat", dir:"l", file:"Gemini_Generated_Image_black cat.png",        poses:{ ...STD, laugh:6, cry:8, angry:10 }, cx:{ front:.43 } },
  { id:"griffin",  dir:"l", file:"Gemini_Generated_Image_Griffin.png", gap:7, line:236, poses:{ ...STD, laugh:6, cry:7, smile:8, angry:9 },
    cut:{ smile:[.82, .55, 1, .78] }, scale:{ smile:1.05 } },   // 미소 옆에 붙은 화남 콧김 지우기 · 기본 모습(미소)이 작아 5% 키워요
  { id:"panda",    dir:"l", file:"Gemini_Generated_Image_panda bear.png",       poses:{ ...STD, laugh:6, cry:7, smile:8, angry:9 }, partial:["smile", "laugh"] },   // 미소·웃음은 상반신만
  { id:"puppy",    dir:"l", file:"Gemini_Generated_Image_puppy.png",            poses:{ ...STD, laugh:6, cry:7, angry:8 } },
  { id:"bluecat",  dir:"l", file:"Gemini_Generated_Image_russian blue cat.png", poses:{ ...STD, laugh:6, cry:7, smile:8, angry:9 } },
  { id:"skunk",    dir:"r", file:"Gemini_Generated_Image_skunk.png",            poses:{ ...STD, laugh:6, cry:7, angry:9 }, faceW:.62, cx:{ front:.28, back:.32 } },
  // 다람쥐 화남 얼굴은 머리 윗선이 끊겨 있어 안 써요 (아쉬운 결과엔 우는 얼굴)
  { id:"squirrel", dir:"l", file:"Gemini_Generated_Image_squirrel.png", gap:9, line:228, poses:{ ...STD, laugh:6, cry:7 }, faceW:.75, cx:{ front:.3, left:.28, back:.32 } },
  { id:"unicorn",  dir:"l", file:"Gemini_Generated_Image_unicon.png", gap:5, line:226, poses:{ ...STD, laugh:6, cry:7, angry:9 }, solid:["laugh", "cry", "angry"], faceW:.7, partial:["laugh", "cry", "angry"] },
  { id:"crow",     dir:"r", file:"Gemini_Generated_Image_white Crow.png",       poses:{ ...STD, laugh:6, cry:7, smile:8, angry:9 } },
  { id:"stork",    dir:"r", file:"Gemini_Generated_Image_white Stork.png",      poses:{ ...STD, laugh:6, cry:7, smile:8, angry:9 } },
  { id:"tiger",    dir:{ walk:"l", run:"r" }, file:"Gemini_Generated_Image_white Tiger.png", poses:{ ...STD, laugh:6, cry:7, smile:8, angry:9 } },
  { id:"elephant", dir:"r", file:"Gemini_Generated_Image_white elephant.png",   poses:{ ...STD, laugh:6, cry:7, angry:8 } },
];
