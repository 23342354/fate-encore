/* ── 스토리의 막 ──────────────────────────────────────────
   스토리 화면에서 서곡 아래 가로 네 칸으로 그려진다. 위에서부터 순서대로.

   { no: '1', title: '제1막', sub: '부제', route: [ … ], script: [ … ] }

   - route 도 script 도 없으면 잠긴 막이다. 부제 자리에 '비공개' 가 나온다.
   - route 를 넣으면 열린 막이 되고, 누르면 그 막의 루트 차트(갈래와 엔딩 지도)가 열린다.
   - script 를 넣으면(route 없이) 누르면 서곡과 같은 플레이어로 재생된다.
     줄의 종류는 prologue.js 맨 위 설명과 같다. 끝까지 보면 CLEAR(fe-chapter-<no>).
   - sub 는 열린 막에만 보인다.

   ── 루트 차트 (route) ─────────────────────────────────────
   위에서 아래로 흐르는 큰 줄기(본편)다. 줄 하나가 칸 하나.

     { type:'start' }                          막의 시작
     { type:'scene' }                          장면
     { type:'choice', branches:[ 갈래, 갈래 ] } 선택지. 갈래는 줄기 옆으로 뻗는다
                                               (첫 갈래는 오른쪽, 둘째는 왼쪽 — 두 개까지)
     { type:'end', kind:'bad' }                엔딩. kind — bad · normal · true · next
                                               next 는 '다음 막으로' (줄기의 끝에 둔다)

   갈래는 옆으로 이어지는 칸들의 배열이다. 예) [ { type:'scene' }, { type:'end', kind:'bad' } ]
   어떤 칸에든 label:'이름' 을 적으면 그 이름이 나온다. 적지 않으면 공개 전이라
   분기 1 · BAD END 01 같은 번호만 나온다. 엔딩 번호는 위에서부터 저절로 매겨진다. */
window.CHAPTERS = [
  { no: '1', title: '제1막', sub: '루트 차트',
    route: [
      { type: 'start' },
      { type: 'scene' },
      { type: 'choice', branches: [
        [ { type: 'end', kind: 'bad' } ],
      ] },
      { type: 'scene' },
      { type: 'choice', branches: [
        [ { type: 'scene' }, { type: 'end', kind: 'bad' } ],
        [ { type: 'end', kind: 'bad' } ],
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
      { type: 'end', kind: 'next' },
    ] },
  { no: '2', title: '제2막' },
  { no: '3', title: '제3막' },
  { no: '4', title: '제4막' },
];
