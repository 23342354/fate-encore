/* ── 스토리의 막 ──────────────────────────────────────────
   스토리 화면에서 서곡 아래 가로 네 칸으로 그려진다. 위에서부터 순서대로.
   막 하나가 한 사람의 루트다 — 같은 성배전쟁이 누구를 따라가느냐에 따라 다르게 갈라진다.

   { no: '1', title: '제1막', sub: '루트 이름', lead: '주인공', route: [ … ], script: [ … ] }

   - route 도 script 도 없으면 잠긴 막이다. 부제 자리에 '비공개' 가 나온다.
   - route 를 넣으면 열린 막이 되고, 누르면 그 막의 루트 차트(갈래와 엔딩 지도)가 열린다.
   - script 를 넣으면(route 없이) 누르면 서곡과 같은 플레이어로 재생된다.
     줄의 종류는 prologue.js 맨 위 설명과 같다. 끝까지 보면 CLEAR(fe-chapter-<no>).
   - sub 는 루트 이름이다. 열린 막의 칸과 루트 차트 제목 옆에 나온다.
   - lead 는 그 루트의 주인공이다. 루트 차트 머리말에 'OO의 루트' 로 나온다.

   ── 루트 차트 (route) ─────────────────────────────────────
   위에서 아래로 흐르는 큰 줄기(본편)다. 줄 하나가 칸 하나.
   칸은 격자가 아니라 진짜 별자리처럼 흩어져 그려진다. 막 번호와 화면 폭으로 모양이 정해진다.

     { type:'start' }                          막의 시작
     { type:'scene' }                          장면
     { type:'choice', branches:[ 갈래, 갈래 ] } 선택지. 갈래는 줄기 옆으로 뻗는다
                                               (첫 갈래는 오른쪽, 둘째는 왼쪽 — 두 개까지)
     { type:'end', kind:'bad' }                엔딩. kind — bad · normal · true · next
                                               보통 줄기의 끝은 그 루트의 엔딩(true 등)이다.
                                               next 는 '다음 막으로' 화살표 (이어지는 막일 때)

   갈래는 옆으로 이어지는 칸들의 배열이다. 예) [ { type:'scene' }, { type:'end', kind:'bad' } ]
   어떤 칸에든 label:'이름' 을 적으면 그 이름이 나온다. 적지 않으면 공개 전이라
   분기 1 · BAD END 01 같은 번호만 나온다. 엔딩 번호는 위에서부터 저절로 매겨진다.

   ── 엔딩 내용 ──────────────────────────────────────────────
   엔딩 칸에 title(엔딩 이름)과 text(본문)를 적으면, 차트에서 그 별을 눌렀을 때
   엔딩 카드로 들어간다. text 는 문자열 하나 또는 문단 배열. \n 은 줄바꿈, **굵게**.
   적지 않은 엔딩도 누를 수 있지만 '아직 공개되지 않은 엔딩' 카드가 나온다.
     { type:'end', kind:'bad', title:'엔딩 이름', text:'본문' } */
window.CHAPTERS = [
  { no: '1', title: '제1막', sub: 'Once Upon a Wish', lead: '오스카 조로아스터',
    route: [
      { type: 'start' },
      { type: 'scene' },
      { type: 'choice', branches: [
        [ { type: 'end', kind: 'bad', title: '당신 없는 커튼콜',
            text: '당신을 위한 자비는 대본에 쓰여 있지 않았다. 그가 고개를 숙이는 동안, 당신의 자리에는 침묵만이 남았다.' } ],
      ] },
      { type: 'scene' },
      { type: 'choice', branches: [
        [ { type: 'scene' }, { type: 'end', kind: 'bad', title: '요람의 주인',
            text: '그는 당신이 떠날 아침을 두려워했다. 당신에게 아침이 영영 오지 않기를 바란 적은 없었다.' } ],
        [ { type: 'end', kind: 'bad', title: '가장 안전한 무덤',
            text: '이곳은 오스카 조로아스터의 가난한 꿈. 당신을 위해 지어진 이 세계에서, 깨어나겠다는 말만은 용서받지 못한다.' } ],
      ] },
      { type: 'scene' },
      { type: 'scene' },
      { type: 'choice', branches: [
        [ { type: 'end', kind: 'bad' } ],
      ] },
      { type: 'scene' },
      { type: 'choice', branches: [
        [ { type: 'scene' }, { type: 'end', kind: 'bad' } ],
        [ { type: 'scene' }, { type: 'end', kind: 'bad' } ],
      ] },
      { type: 'scene' },
      { type: 'end', kind: 'true' },
    ] },
  { no: '2', title: '제2막' },
  { no: '3', title: '제3막' },
  { no: '4', title: '제4막' },
];
