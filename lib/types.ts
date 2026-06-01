// 분양정보 조회 서비스
export interface SaleItem {
  houseManageNo: string      // 주택관리번호
  houseName: string          // 단지명
  houseSecd: string          // 주택구분코드
  houseSecd_nm: string       // 주택구분명
  sido: string               // 시도
  gugun: string              // 구군
  dong: string               // 동
  hssplyAdres: string        // 공급위치
  totSuplyHshldco: string    // 공급규모(총)
  rceptBgnde: string         // 청약접수시작일
  rceptEndde: string         // 청약접수종료일
  przwnerPresnatnDe: string  // 당첨자발표일
  cntrctCnclsBgnde: string   // 계약시작일
  cntrctCnclsEndde: string   // 계약종료일
  hmpgAdres: string          // 홈페이지주소
  bsnsMbyNm: string          // 사업주체명
  mdatTrgetAreaSecd: string  // 투기과열지구여부
  rentSehouseYn: string      // 임대세대포함여부
  mdhsTy: string             // 중대형평형여부
}

export interface SaleListResponse {
  items: SaleItem[]
  totalCount: number
  pageNo: number
  numOfRows: number
}

// 경쟁률 조회 서비스
export interface CompetitionItem {
  houseManageNo: string    // 주택관리번호
  houseName: string        // 단지명
  sido: string             // 시도
  gugun: string            // 구군
  rceptBgnde: string       // 청약접수시작일
  rceptEndde: string       // 청약접수종료일
  gnrlRnk1CrspaQu: string  // 일반공급1순위경쟁률
  gnrlRnk2CrspaQu: string  // 일반공급2순위경쟁률
  spsplyRceptBgnde: string // 특별공급접수시작일
  spsplyRceptEndde: string // 특별공급접수종료일
}

export interface SpecialSupplyItem {
  houseManageNo: string      // 주택관리번호
  houseName: string          // 단지명
  sido: string
  gugun: string
  mfmnHhldco: string         // 다자녀가구 공급세대수
  mfmnRcept: string          // 다자녀가구 신청자
  nwwdHhldco: string         // 신혼부부 공급세대수
  nwwdRcept: string          // 신혼부부 신청자
  lfefstsHhldco: string      // 생애최초 공급세대수
  lfefstsRcept: string       // 생애최초 신청자
  eldlyprntHhldco: string    // 노부모부양 공급세대수
  eldlyprntRcept: string     // 노부모부양 신청자
  insttRcmdtnHhldco: string  // 기관추천 공급세대수
  insttRcmdtnRcept: string   // 기관추천 신청자
}

// 당첨자 정보 조회 서비스
export interface WinnerItem {
  houseManageNo: string   // 주택관리번호
  houseName: string       // 단지명
  sido: string
  gugun: string
  houseSecd_nm: string    // 주택구분명
  houseTy: string         // 주택형
  suplyHhldco: string     // 공급세대수
  cnpclAplcnt: string     // 취소후보자수
  przwnerPresnatnDe: string // 당첨자발표일
  spsplyPrzwner: string   // 특별공급당첨자
  gnrlPrzwner: string     // 일반공급당첨자
}

export interface ApiResponse<T> {
  items: T[]
  totalCount: number
  pageNo: number
  numOfRows: number
}
