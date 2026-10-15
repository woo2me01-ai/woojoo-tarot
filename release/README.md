# 우주 타로 — 안드로이드 출시 안내

플레이 스토어에 올리기까지 필요한 파일과 순서를 정리했어요. 위에서부터 차례로 하면 돼요.

## 0. 준비된 것 / 직접 해야 하는 것

| 구분 | 내용 | 상태 |
|---|---|---|
| 앱 ID | `com.woojoojumbbang.tarot` (출시 후 바꿀 수 없음) | ✅ |
| 버전 | versionName `1.0.0`, versionCode `1` | ✅ |
| targetSdk / minSdk | 36 / 24 (Play 요구 충족) | ✅ |
| 앱 아이콘·스플래시 | 달 + 몽실 (`npm run store:assets`로 다시 만들 수 있음) | ✅ |
| 스토어 그래픽 | `graphics/` 아이콘 512, 대표 그래픽 1024×500, 스크린샷 7장 | ✅ |
| 스토어 문구 | `store-listing.md` (한국어·영어) | ✅ |
| 정책 설문 답 | `data-safety.md` | ✅ |
| 개인정보처리방침 | 홈페이지에 앱 문단 추가 필요 → `privacy-app-section.md` | ⬜ 직접 |
| Android Studio 설치 | 빌드에 필요 | ⬜ 직접 |
| 서명 키 만들기 | 한 번만, 절대 잃어버리면 안 됨 | ⬜ 직접 |
| 실기기 테스트 | 진동·뒤로 가기·공유·음력 변환 | ⬜ 직접 |
| 비공개 테스트 (12명 × 14일) | 개인 개발자 계정 필수 조건 | ⬜ 직접 |

## 1. Android Studio 설치 (한 번만)

1. https://developer.android.com/studio 에서 받아 설치해요. JDK와 Android SDK가 같이 들어가요.
2. 처음 실행하면 나오는 **Setup Wizard**에서 Standard로 끝까지 진행해 SDK를 받아요.

## 2. 실기기 테스트

1. 휴대폰: 설정 → 휴대전화 정보 → 소프트웨어 정보 → **빌드번호 7번** 눌러 개발자 옵션 켜기 → **USB 디버깅** 켜기
2. 휴대폰을 USB로 연결하고 "USB 디버깅 허용"
3. 이 폴더에서 실행:
   ```bash
   npm run android
   ```
   빌드 후 Android Studio가 열려요. 위쪽 기기 목록에서 내 휴대폰을 고르고 ▶ Run.
4. 확인할 것
   - [ ] 첫 실행 스플래시(달 + 몽실)와 홈 화면 아이콘
   - [ ] 프로필 입력(양력·음력·윤달) → 홈
   - [ ] 오늘의 카드 뒤집을 때 진동
   - [ ] 공유하기 → 안드로이드 공유 시트 → 카카오톡으로 보내지는지
   - [ ] 안드로이드 뒤로 가기: 공유 창 닫기 → 이전 화면 → 홈에서 앱 종료
   - [ ] 마스터 탭: 달·은하수·유성, 캐릭터 움직임
   - [ ] 설정 → 테마 화이트/다크, 언어 English
   - [ ] 앱을 껐다 켜도 기록·마스터·설정이 남아 있는지

## 3. 서명 키 만들기 (한 번만, 가장 중요)

플레이 스토어에 올리는 파일은 **업로드 키**로 서명해야 해요. 이 키를 잃어버리면 Google에 재설정 요청을 해야 하니 꼭 백업하세요.

**방법 A — Android Studio에서 (쉬움)**
1. `npm run android`로 Android Studio를 열어요.
2. 메뉴 **Build → Generate Signed App Bundle / APK** → **Android App Bundle** → Next
3. Key store path 옆 **Create new...**
   - 저장 위치: `C:\dev\woojoo-tarot\android\woojoo-tarot-upload.jks`
   - 비밀번호 2개(키스토어·키), Alias: `upload`, 유효기간 25년 이상, 이름/조직 입력
4. 계속 진행하면 서명된 `.aab`가 만들어져요 (보통 `android/app/release/app-release.aab`).

**방법 B — 명령어로 매번 서명되게**
1. `android/keystore.properties.example`을 `android/keystore.properties`로 복사하고 비밀번호를 채워요.
2. 이후엔 이 명령 하나로 서명된 출시 파일이 만들어져요:
   ```bash
   npm run android:sync
   ```
   ```bash
   cd android && gradlew.bat bundleRelease
   ```
   결과: `android/app/build/outputs/bundle/release/app-release.aab`

> `.jks` 파일과 `keystore.properties`는 깃에 올라가지 않게 막아 두었어요. **USB·클라우드 등 이 컴퓨터 밖에 백업**하고 비밀번호도 따로 적어 두세요.

## 4. 개인정보처리방침 올리기

`privacy-app-section.md`의 문단을 홈페이지 저장소(Homepage maker)의 `privacy/index.html`에 추가하고 배포해요.
Play Console에는 `https://woojoojumbbang.com/privacy/`를 등록해요.

## 5. Play Console에서 앱 만들기

https://play.google.com/console → **앱 만들기**
- 앱 이름: `우주 타로`
- 기본 언어: 한국어 – ko-KR
- 앱 / 무료
- 선언 체크(개발자 프로그램 정책, 미국 수출 법규)

그다음 **대시보드의 "앱 설정" 할 일**을 차례로 채워요:
1. 개인정보처리방침 → URL
2. 앱 액세스 권한, 광고, 콘텐츠 등급, 타겟층, 데이터 보안, 정부 앱 등 → `data-safety.md` 답 그대로
3. 앱 카테고리·연락처 → `store-listing.md` 표
4. 스토어 등록정보 → `store-listing.md` 문구 + `graphics/` 이미지

## 6. 비공개 테스트 (개인 개발자 계정 필수: 테스터 12명 이상 × 14일 연속)

2023년 11월 이후 만든 개인 계정은 이걸 통과해야 프로덕션 출시를 신청할 수 있어요.

1. **테스트 → 비공개 테스트 → 트랙 만들기** (이름 예: 알파)
2. **테스터** 탭 → 이메일 목록 만들기 → 테스터 12명 이상의 **Gmail 주소** 추가 (여유 있게 15~20명 권장)
3. **새 버전 만들기** → `app-release.aab` 업로드 → 버전 이름 `1.0.0 (1)` → 출시 노트 예:
   ```
   우주 타로 첫 테스트 버전이에요. 오늘의 카드, 타로 주제 8가지, 사주·별자리 운세, 나만의 타로 마스터를 써 보고 불편한 점을 알려 주세요.
   ```
4. **검토를 위해 전송** → Google 검토(보통 수 시간~며칠)
5. 통과하면 **테스터 참여 링크**를 테스터들에게 보내요. 각자 링크에서 "테스터 되기" → 플레이 스토어에서 설치.
6. **12명 이상이 14일 동안 계속 참여**해야 해요 (중간에 빠지면 날짜가 다시 셀 수 있어요).

> 일정: 12월 8일 출시 목표라면 **11월 16일까지 비공개 테스트 시작** → 11월 30일 14일 충족 → 프로덕션 신청(검토 최대 7일).

## 7. 프로덕션 출시

1. 대시보드 → **프로덕션 액세스 신청** → 테스트 경험 설문 답변
2. 승인되면 **프로덕션 → 새 버전 만들기** → 같은 `.aab`(또는 고친 새 버전) 업로드
3. 국가: 대한민국 (+원하면 전체)
4. 검토 전송 → 승인되면 스토어에 공개 🎉

## 8. 업데이트할 때마다

1. 코드 수정 후 `android/app/build.gradle`의 **versionCode를 1 올리고**(2, 3, …) versionName도 바꿔요(예: 1.0.1). 설정 화면의 버전(`src/screens/settings.js` VERSION)도 같게.
2. `npm run android:sync` → 서명된 `.aab` 빌드
3. Play Console에서 새 버전 업로드

## 파일 목록

```
release/
├─ README.md                 ← 이 안내
├─ store-listing.md          ← 스토어 문구(한/영), 카테고리, 연락처
├─ data-safety.md            ← 앱 콘텐츠 설문 답
├─ privacy-app-section.md    ← 홈페이지 개인정보처리방침에 추가할 문단
└─ graphics/
   ├─ icon-512.png                    (앱 아이콘)
   ├─ feature-graphic-1024x500.png    (그래픽 이미지)
   └─ screenshots/01~07.png           (휴대전화 스크린샷 1080×1920)
```

그래픽을 다시 만들려면: `npm run store:assets` (아이콘·스플래시·대표 그래픽), `npm run store:screens` (스크린샷, 크롬 필요)
