---
name: Fate / Encore
description: 발신인 없는 초대장으로 시작하는 제6차 성배전쟁 — 크림 종이와 코발트 잉크, 밤하늘의 천문 기록
colors:
  cobalt: "#2350AE"
  cobalt-deep: "#142F72"
  cobalt-soft: "#4E7FE6"
  cobalt-bright: "#5A88EC"
  print-cobalt: "#1D3F92"
  voice-cobalt: "#1E3C80"
  gold-leaf: "#C9A75E"
  gold-pale: "#D8C58E"
  gold-aged: "#B89A55"
  cream-paper: "#EFE8D8"
  cream-paper-light: "#F3EEE3"
  cream-paper-shade: "#E6DFCE"
  note-paper: "#F2EDE1"
  surface: "#EFEADF"
  surface-shade: "#E2DBC9"
  text: "#1E2438"
  text-dim: "#5E6683"
  ink: "#08090B"
  night: "#081236"
  night-deep: "#070A18"
  night-raised: "#0B1A4A"
  silver-on-night: "#E9EEFA"
  star-glow: "#9DB8FF"
  star-glow-alt: "#8FB0FF"
  danger: "#E0302A"
typography:
  display:
    fontFamily: "Italiana, IbmPlexSans, sans-serif"
    fontWeight: 400
    letterSpacing: "0.07em"
  headline:
    fontFamily: "Nanum Myeongjo, IbmPlexSans, serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.3
  latin:
    fontFamily: "Instrument Serif, Nanum Myeongjo, serif"
    fontSize: "1.05rem"
    fontWeight: 400
    letterSpacing: "0.06em"
  body:
    fontFamily: "IbmPlexSans, IBM Plex Sans KR, Apple SD Gothic Neo, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.85
  prose:
    fontFamily: "Pretendard, Pretendard Variable, system-ui, sans-serif"
    fontWeight: 400
  label:
    fontFamily: "Instrument Serif, Nanum Myeongjo, serif"
    fontSize: "0.72rem"
    fontWeight: 400
    letterSpacing: "0.2em"
  pixel:
    fontFamily: "DotGothic16, IbmPlexSans, monospace"
    fontWeight: 400
rounded:
  hairline: "2px"
  tab: "0.35rem"
  panel: "0.6rem"
  band: "1.1rem"
  pill: "999px"
  round: "50%"
spacing:
  pad: "clamp(.75rem, 2.5vw, 1.75rem)"
  gutter: "clamp(1.25rem, 5vw, 4rem)"
  measure: "34rem"
  rule-line: "1.75rem"
components:
  button-tab:
    backgroundColor: "{colors.cobalt-deep}"
    textColor: "{colors.cream-paper-light}"
    typography: "{typography.body}"
    rounded: "{rounded.tab}"
  button-tab-light:
    backgroundColor: "{colors.note-paper}"
    textColor: "{colors.cobalt-deep}"
    rounded: "{rounded.tab}"
  button-ghost:
    backgroundColor: "{colors.note-paper}"
    textColor: "{colors.cobalt-deep}"
    rounded: "{rounded.tab}"
  button-ghost-hover:
    backgroundColor: "{colors.cobalt-deep}"
    textColor: "{colors.cream-paper-light}"
  hud-chip:
    backgroundColor: "{colors.note-paper}"
    textColor: "{colors.text}"
    rounded: "{rounded.tab}"
  dock-tip:
    backgroundColor: "{colors.cream-paper}"
    textColor: "{colors.cobalt-deep}"
    rounded: "{rounded.pill}"
    height: "28px"
  lobby-panel:
    backgroundColor: "rgba(8,13,38,.6)"
    textColor: "{colors.silver-on-night}"
  ticket:
    backgroundColor: "{colors.cream-paper-light}"
    textColor: "{colors.print-cobalt}"
---

# Design System: Fate / Encore

## Overview

**Creative North Star: "발신인 없는 초대장"**

모든 화면은 누군가 보낸, 손에 쥘 수 있는 종이 유물이다. 활판 인쇄된 입장권, 테이프로 붙인 기록장, 도장 찍힌 신분증, 금박 띠, 줄 노트. 낮의 화면(캐스트·소환·스토리·정보·프로필)은 결 있는 크림 종이 위에 코발트 잉크로 찍은 천문 노트이고, 로비는 그 초대장을 받아 든 밤, 남색으로 가라앉은 우키하 거리 위에 은빛 별과 코발트 빛이 뜬 하늘이다. 종이와 밤하늘, 이 두 면이 시스템의 전부다.

화면은 모바일 게임 클라이언트처럼 움직인다. 스크롤하지 않고 하단의 밤하늘 독으로 화면을 통째로 바꾸며, 로비에서는 독이 숨고 양옆의 메뉴 판이 그 역할을 맡는다. 밀도는 중간(5/10)이고 구성의 대담함은 7, 움직임은 6이다. 장식은 많지만 모두 종이의 물성(결, 절취선, 우표 물결, 바느질 선, 테이프의 톱니)이나 천문(별, 달의 위상, 성도, 궤도 점선)에서 나온다.

부품은 만지면 물리적으로 반응한다. 입장권 그루터기는 마우스를 올리면 절취선에서 반쯤 들리고 누르면 뜯겨 떨어진다. 버튼은 눌리면 1px 내려앉는다. 이전 테마의 검은 하드 오프셋 그림자와 청록·적갈 리버스 톤으로 되돌아가지 않는다.

**Key Characteristics:**
- 두 면: 크림 종이 + 코발트 잉크(낮) / 남색 밤하늘 + 은빛·코발트 빛(로비·독)
- 금박은 테이프·실·테두리의 얇은 선으로만, 면으로 칠하지 않는다
- 한글 제목은 나눔명조 800, 라틴은 Instrument Serif 이탤릭과 Italiana 대문자
- 종이 유물 부품: 입장권, 기록장, 신분증, 도장, 테이프, 인덱스 탭
- 정직한 상태: 못 불러온 것은 문양이나 문구로 못 불러왔다고 보여 준다

## Colors

로고에서 뽑은 코발트 잉크 한 계열이 주인공이고, 금박은 그 곁의 얇은 빛, 크림 종이와 남색 밤이 바탕이다.

### Primary
- **Star Chart Cobalt** (cobalt): 낮 화면의 기본 잉크. 제목 앞 별, 라틴 부제, 링크, 독의 소환 메달 중심.
- **Midnight Ink Cobalt** (cobalt-deep): 버튼 바탕, 펜 글씨, 강조(`strong`), 독 말풍선 글자. 크림 위에서 본문 대비를 맡는 짙은 코발트.
- **Letterpress Cobalt** (print-cobalt): 입장권 활판 인쇄 잉크와 그 위의 이중선.
- **Voice Cobalt** (voice-cobalt): 대사체 문단의 세로선과 대사 글자.
- **Lit Cobalt** (cobalt-soft, cobalt-bright): 메달·원반 그라데이션의 밝은 중심. 글자에는 쓰지 않는다.

### Secondary
- **Gold Leaf** (gold-leaf): 독 띠의 금테, 금실 바느질 점선, 장 번호 원의 테두리, 현재 화면을 가리키는 금빛 별.
- **Pale Gilt** (gold-pale), **Aged Gilt** (gold-aged): 리본과 여백선. 금박 테이프는 이 둘을 섞은 100° 그라데이션(`#B8914A → #EED9A0 → #C29B52 → #E4CB8A`)이다.

### Tertiary
- **Starlight** (star-glow, star-glow-alt): 밤하늘 위의 강조. 로비 칩 아이콘, 공개 수(4/7), NEW 빛점, 은빛 별의 후광.
- **Signal Red** (danger): 오류 상태 전용(배경음악을 못 불러옴). 장식에 쓰지 않는다.

### Neutral
- **Cream Paper** (cream-paper, -light, -shade): 바탕 종이. 위아래로 옅게 그라데이션하고 `grain.svg` 결을 얹는다.
- **Note Paper** (note-paper, surface, surface-shade): 기록장·쪽지·HUD 칩·밝은 버튼의 종이.
- **Night Ink Text** (text): 크림 위 본문. **Faded Ink** (text-dim): 보조 문구, 잠긴 막.
- **Pitch Ink** (ink): 신분증·카세트 같은 고정 부품의 외곽선.
- **Deep Night** (night, night-deep, night-raised): 독 띠의 세로 그라데이션(`#16307E → night-raised → night`)과 로비 패널 유리.
- **Silver on Night** (silver-on-night): 밤 위의 글자와 이중선.

### Named Rules
**The Two Surfaces Rule.** 모든 면은 크림 종이이거나 밤하늘이다. 회색 카드, 흰 카드, 그 중간의 세 번째 바탕을 만들지 않는다.

**The Gilt Thread Rule.** 금은 선이다. 테이프, 실, 테두리, 작은 별로만 쓰고 넓은 면을 금색으로 칠하지 않는다.

**The Token Ladder Rule.** 실제 색 값은 `--p-*`(원색)에만 있고, 화면은 `--color-*`(역할)만 쓴다. 새 색이 필요하면 원색을 추가하고 역할을 이어 준다.

## Typography

**Display Font:** Italiana (라틴 대문자)
**Headline Font:** Nanum Myeongjo 800 (한글 제목)
**Body Font:** IBM Plex Sans KR (`IbmPlexSans`, 200·300·400·450·500·600)
**Prose Font:** Pretendard (서곡과 긴 산문)
**Label Font:** Instrument Serif (라틴 부제·라벨, 이탤릭과 넓은 자간 대문자)
**Pixel Font:** DotGothic16 (창 제목줄·파일 이름)

**Character:** 명조의 묵직한 한글 제목과 가는 라틴 세리프가 인쇄물·초대장의 격식을 맡고, IBM Plex Sans KR이 게임 UI의 또렷함을 맡는다.

### Hierarchy
- **Display** (Italiana 400, 자간 0.07em, 대문자): 입장권 제목, 라틴 제호 같은 장식 대문자.
- **Headline** (Nanum Myeongjo 800, 1.5rem, 1.3): 화면 제목. 앞에 코발트 별 하나, 아래에 굵은 선 + 가는 선의 이중선.
- **Latin** (Instrument Serif 이탤릭, 약 1.05rem, 자간 0.06em): 제목 옆 라틴 부제(Dramatis Personae, Story), 코발트.
- **Body** (IBM Plex Sans KR 400, 1.0625rem, 1.85): 프로필·설정 본문. 한국어는 `word-break: keep-all`로 어절 단위 줄바꿈.
- **Label** (Instrument Serif, 0.62–0.82rem, 자간 0.12–0.3em, 대문자): 입장권 칸 이름, SUMMON, Servant/Master 같은 영문 꼬리표.

### Named Rules
**The 600 Ceiling Rule.** IBM Plex Sans KR의 가장 굵은 자족은 600이다. 그보다 굵게 지정하지 않는다(가짜 볼드가 생긴다). 더 굵은 한글이 필요하면 나눔명조 800을 쓴다.

**The Bilingual Label Rule.** 한글 이름 곁에는 라틴 세리프 꼬리표가 붙는다(캐스트 · Dramatis Personae, 소환 · Summon). 라틴은 장식이고 한글이 정보다.

## Layout

화면은 뷰포트 하나에 고정된다(`body { overflow: hidden }`). 화면 전환은 하단 독이 하고, 각 화면 안에서만 필요할 때 세로로 스크롤한다. 주소 해시(`#cast`, `#story`)가 화면을 가리킨다.

- **여백:** 바깥 여백 `pad`(clamp .75–1.75rem), 큰 여백 `gutter`(clamp 1.25–4rem), 산문 폭 `measure`(34rem). 줄 노트 간격 1.75rem.
- **로비(가로, 60rem 이상 또는 낮은 가로 화면):** 가운데에서 살짝 왼쪽에 서번트가 바닥에 붙어 서고, 왼쪽 위 아이콘 단, 오른쪽에 너비 clamp(16.5rem, 24vw, 21.5rem)의 메뉴 판 묶음(서곡 포스터 → 입장권 → 서번트/마스터 칸 → 소환), 왼쪽 아래 카세트, 아래 가운데 자막.
- **로비(폰 세로, 60rem 미만):** 오른쪽 메뉴가 판을 벗고 아이콘 단으로 줄어들며, 서번트가 가운데로 온다. 소환은 맨 아래의 빛나는 메달.
- **낮 화면:** 화면 제목 + 한 줄 설명, 이중선 아래로 내용. 캐스트는 기록장 카드 2열, 스토리는 장 목록 1열.
- **낮은 화면(높이 30rem·50rem 이하)** 에서는 달, 부제, 보조 문구부터 숨긴다.

## Elevation & Depth

평평한 종이를 겹쳐 쌓은 깊이다. 그림자는 종이가 바탕에서 살짝 떠 있는 정도로만 쓰고, 밤하늘에서는 그림자 대신 코발트 빛(glow)이 깊이를 만든다.

### Shadow Vocabulary
- **Paper Lift** (`0 1px 0 rgba(8,9,11,.05), 0 .7rem 1.4rem -.7rem rgba(10,16,44,.32)`): 낮 화면의 모든 종이 부품(칩, 버튼, 기록장). 눌리면 사라진다.
- **Photo Border** (`0 0 0 .55rem #FDFCF8, 0 0 0 calc(.55rem + 1px) rgba(8,9,11,.18)` + Paper Lift): 사진처럼 흰 테두리를 두른 초상.
- **Night Glass** (`inset 0 0 0 3px rgba(8,13,38,.45), inset 0 0 0 4px rgba(222,230,250,.2), 0 0 1.6rem -.4rem rgba(58,104,232,.5)`): 로비 메뉴 판의 은빛 이중선과 코발트 후광. 호버 시 후광이 2.2rem·.75로 커진다.
- **Star Halo** (`drop-shadow(0 0 .45rem rgba(58,104,232,.75))`): 밤 위의 아이콘과 별.

### Named Rules
**The No Hard Offset Rule.** 검은 하드 오프셋 그림자(`3px 3px 0 var(--ink)` 류)는 예전 테마의 흔적이다. 새 부품에 쓰지 않는다. 종이는 부드럽게 뜨고, 밤은 빛난다.

## Shapes

모서리는 종이를 오린 정도로 작다. 탭과 버튼은 .35rem, 기록장 판은 .6rem 안팎, 독 띠의 위 모서리만 1.1rem로 둥글다. 원(50%)은 도장·메달·달·번호 원에, 알약(999px)은 말풍선과 HUD 플레이어 표식에만 쓴다.

형태의 개성은 모서리보다 가장자리에서 나온다. 테이프의 톱니 끝(`clip-path`), 입장권의 우표 물결과 반달 홈과 절취 구멍(mask), 절취선·바느질 선의 점선, 인덱스 탭. 새 부품도 반듯한 사각형에 이런 종이 가장자리 하나를 더하는 방식으로 만든다.

## Components

### Buttons
손으로 넘기는 종이 탭.
- **Shape:** 살짝 둥근 탭 모서리(.35rem)
- **Primary (gbtn):** 짙은 코발트 바탕에 흰 글씨, 같은 색 1px 테두리, Paper Lift 그림자.
- **Light (gbtn--light):** 노트 종이 바탕에 짙은 코발트 글씨.
- **Ghost (fbtn):** 노트 종이 바탕, 코발트 테두리와 글씨, 굵기 600. 호버하면 코발트로 채워진다.
- **Active:** 1px 내려앉고 그림자가 사라진다. 포커스는 짙은 코발트 2px 외곽선(간격 3px).

### Chips (HUD)
- **Style:** 노트 종이 바탕, 반투명 잉크 1px 테두리, .35rem 모서리, Paper Lift. BGM · 영주 · 참전 수.
- **State:** BGM은 재생·정지·대기(라벨이 은은하게 깜빡)·오류(라벨이 붉게)를 따로 보여 준다. 로비에서는 테두리와 바탕을 벗고 밤 위 은빛 글자 띠가 된다.

### Cards / Containers — 서번트 기록장
- **Corner Style:** 작은 종이 모서리
- **Background:** 줄 노트(1.75rem 간격 코발트 10% 선) 위 노트 종이
- **Shadow Strategy:** Paper Lift
- **Details:** 위에 금박 테이프, 사진 칸, 진명·클래스·마스터 줄, 바코드, 미공개는 붉은 사각 도장 "미공개"와 가린 이름. 마스터는 신분증 카드(모양 고정).

### Inputs / Fields
소식지 이메일 입력 하나뿐이다. 터치 화면에서 높이 44px 이상.

### Navigation — 밤하늘 독
- **Style:** 화면 아래 남색 띠(별가루 + 위쪽 코발트 빛 + 세로 그라데이션), 금테 1px, 안쪽 은빛 가는 선, 위 모서리 1.1rem.
- **Items:** 홈 · 캐스트 · (가운데 소환 메달) · 스토리 · 정보. 아이콘은 은빛 66% 불투명도, 현재 화면은 흰색 + 코발트 후광 + 아래 금빛 별.
- **Magnify:** 커서와의 거리에 따라 아이콘이 코사인 곡선으로 커진다(최대 1.32배, 양옆 둘까지). 이름 말풍선 하나(크림 종이, 짙은 코발트 나눔명조 12px, 금테 알약)가 아이콘 사이를 160ms로 미끄러진다.
- **Summon medal:** 크림 테두리를 두른 코발트 원반, 금테 이중 고리, 30초에 한 바퀴 도는 금빛 점선 궤도.
- **Touch:** 마우스가 없으면 아이콘 아래 이름을 항상 보여 준다. 로비에서는 독을 숨긴다.

### Signature — 활판 입장권
로비의 스토리 입구. 크림 종이에 코발트 활판 잉크, 본권(77%)과 그루터기 두 장. 본권 왼쪽에 우표 물결, 오른쪽에 절취 구멍과 반달 홈, 안쪽에 코발트 이중 테두리, 세로 일련번호, 칸 나눔(제목 · 장소 · 번호), 금빛 별. 그루터기에는 코발트 밀랍 도장과 "입장". 호버 시 그루터기가 9° 들리고 도장이 돌며, 클릭하면 뜯겨 떨어진다. 크기는 컨테이너 단위(cqw)로 비례한다.

### Signature — 로비 메뉴 판
남색 유리(blur 3px) 위 은빛 이중선과 코발트 후광(Night Glass). 서곡 포스터는 궤도 타원 위 별자리, 서번트/마스터 칸은 번호 원과 점 격자, 소환 판은 둥근 글자띠 원반과 은빛 별. 오른쪽 위 달 일곱 개는 공개된 서번트 수만큼 빛난다.

### Signature — 카세트와 신분증
배경음악 카세트와 마스터 신분증은 이전부터 이어 온 고정 모양이다. 테마가 바뀌어도 형태를 바꾸지 않는다.

## Do's and Don'ts

### Do:
- **Do** 새 면을 크림 종이(cream-paper + grain.svg) 아니면 밤하늘(night 계열 + stardust/nightsky.svg) 중 하나로 만든다.
- **Do** 새 부품에 종이 가장자리 하나(테이프 톱니, 절취선, 우표 물결, 바느질 점선, 인덱스 탭)를 준다.
- **Do** 낮 화면의 그림자는 Paper Lift, 밤의 깊이는 코발트 후광으로 낸다.
- **Do** 화면 제목은 나눔명조 800 + 앞의 코발트 별 + 라틴 이탤릭 부제 + 아래 이중선으로 맞춘다.
- **Do** 색은 `--color-*` 역할 이름으로만 쓰고, 새 값은 `--p-*` 원색으로 추가한다.
- **Do** 움직임에는 `prefers-reduced-motion` 대안을 함께 둔다(별 반짝임, 궤도 회전, 그루터기 뜯기 모두 해당).
- **Do** 터치 화면에서 누르는 자리를 44px 이상으로 하되, 보이는 모양은 그대로 두고 누르는 범위만 넓힌다.
- **Do** 미공개·잠김·불러오기 실패를 도장, 점선 원, `—`, 원래 문양으로 정직하게 보여 준다.

### Don't:
- **Don't** 검은 하드 오프셋 그림자(`3px 3px 0 var(--ink)` 류)를 새로 쓰지 않는다. 예전 테마로의 회귀다.
- **Don't** 이전 리버스 톤(적갈 `#B04A33`, 세피아 노을 유리, 청록 `#366379`)으로 되돌리지 않는다.
- **Don't** 금박을 넓은 면이나 버튼 바탕에 칠하지 않는다.
- **Don't** IBM Plex Sans KR을 600보다 굵게 지정하지 않는다.
- **Don't** 밤하늘 위에 코발트 잉크 글자를 올리지 않는다(대비 약 1.8:1). 밤 위의 글자는 은빛이다.
- **Don't** 카세트와 마스터 신분증의 형태를 바꾸지 않는다.
- **Don't** Signal Red를 장식에 쓰지 않는다. 오류 전용이다.
