/* ===========================================================
   Fate / Encore — 마스터 설정
   -----------------------------------------------------------
   마스터 설정은 전부 여기서 고친다. 이름을 열쇠로 삼는다.
   이름은 main.js 의 ROSTER 에 적힌 master 와 글자가 같아야 한다.
   어느 서번트와 짝인지는 ROSTER 가 정하므로 여기에는 적지 않는다.

   비워 두면 프로필에 "—" 가 뜬다.
   line 은 프로필 아래 인용칸에 나오는 한마디. 비우면 칸이 사라진다.
   bio / lore 의 글은 cast.js 와 같은 규칙을 따른다.
     · 문단 하나가 배열 항목 하나
     · 「 『 " 로 시작하고 닫는 따옴표로 끝나는 문단은 대사체
     · **별 두 개** 로 감싼 부분은 강조
   lore 는 설정 탭. 덩어리마다 heading(소제목) · text(문단 배열),
   필요하면 table { head:[...], rows:[[...]] } 로 표를 넣는다.

   항목 — gender 성별 / age 나이 / height 신장 / weight 체중
          affiliation 소속 · 직업 / magic 마술 계통
   =========================================================== */

window.MASTERS = {
  "이치노세 류가": {
    "gender": "",
    "age": "",
    "height": "",
    "weight": "",
    "affiliation": "",
    "magic": "",
    "line": "",
    "bio": [],
    "lore": []
  },
  "마키오카 모쿠렌": {
    "gender": "",
    "age": "",
    "height": "",
    "weight": "",
    "affiliation": "",
    "magic": "",
    "line": "",
    "bio": [],
    "lore": []
  },
  "릴리안 루스텔리아": {
    "gender": "",
    "age": "",
    "height": "",
    "weight": "",
    "affiliation": "",
    "magic": "",
    "line": "",
    "bio": [],
    "lore": []
  },
  "오즈 누벨": {
    "gender": "",
    "age": "",
    "height": "",
    "weight": "",
    "affiliation": "",
    "magic": "",
    "line": "",
    "bio": [],
    "lore": []
  }
};
