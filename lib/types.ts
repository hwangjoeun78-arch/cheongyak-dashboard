// ============================================================
// 1. 분양정보 조회 서비스 (ApplyhomeInfoDetailSvc)
//    endpoint: getAPTLttotPblancDetail
// ============================================================
export interface SaleItem {
  HOUSE_MANAGE_NO: string       // 주택관리번호
  PBLANC_NO: string             // 공고번호
  HOUSE_NM: string              // 주택명
  HOUSE_SECD: string            // 주택구분코드
  HOUSE_SECD_NM: string         // 주택구분코드명
  HOUSE_DTL_SECD: string        // 주택상세구분코드
  HOUSE_DTL_SECD_NM: string     // 주택상세구분코드명
  RENT_SECD: string             // 분양구분코드
  RENT_SECD_NM: string          // 분양구분코드명
  SUBSCRPT_AREA_CODE: string    // 공급지역코드
  SUBSCRPT_AREA_CODE_NM: string // 공급지역명
  HSSPLY_ADRES: string          // 공급위치
  TOT_SUPLY_HSHLDCO: string     // 공급규모
  RCRIT_PBLANC_DE: string       // 모집공고일 (YYYY-MM-DD)
  RCEPT_BGNDE: string           // 청약접수시작일
  RCEPT_ENDDE: string           // 청약접수종료일
  SPSPLY_RCEPT_BGNDE: string    // 특별공급 접수시작일
  SPSPLY_RCEPT_ENDDE: string    // 특별공급 접수종료일
  PRZWNER_PRESNATN_DE: string   // 당첨자발표일
  CNTRCT_CNCLS_BGNDE: string    // 계약시작일
  CNTRCT_CNCLS_ENDDE: string    // 계약종료일
  HMPG_ADRES: string            // 홈페이지주소
  CNSTRCT_ENTRPS_NM: string     // 건설업체명
  BSNSMBY_NM: string            // 사업주체명
  MDAT_TRGET_AREA_SECD: string  // 투기과열지구여부
  PARCPRC_ULS_AT: string        // 분양가상한제여부
}

// ============================================================
// 2. 경쟁률 조회 서비스 (ApplyhomeInfoCmpetRtSvc)
//    endpoint: getAPTLttotPblancCmpet
// ============================================================
export interface CompetitionItem {
  HOUSE_MANAGE_NO: number       // 주택관리번호
  PBLANC_NO: number             // 공고번호
  MODEL_NO: string              // 모델번호
  HOUSE_TY: string              // 주택형
  SUPLY_HSHLDCO: number         // 공급세대수
  SUBSCRPT_RANK_CODE: number    // 순위 (1 or 2)
  RESIDE_SECD: string           // 거주코드
  RESIDE_SENM: string           // 거주지역명
  REQ_CNT: string               // 접수건수
  CMPET_RATE: string            // 경쟁률
}

// ============================================================
// 3. 청약 신청·당첨자 정보 조회 서비스 (ApplyhomeStatSvc)
//    endpoint: getAPTPrzwnerAreaStat (지역별 당첨자)
// ============================================================
export interface WinnerAreaItem {
  STAT_DE: string               // 제공연월 (YYYYMM)
  SUBSCRPT_AREA_CODE: string    // 공급지역코드
  SUBSCRPT_AREA_CODE_NM: string // 공급지역명
  AGE_30: number                // 30대 이하 당첨건수
  AGE_40: number                // 40대 당첨건수
  AGE_50: number                // 50대 당첨건수
  AGE_60: number                // 60대 이상 당첨건수
}

// 연령별 당첨자 (getAPTPrzwnerAgeStat)
export interface WinnerAgeItem {
  STAT_DE: string
  AGE_30: number
  AGE_40: number
  AGE_50: number
  AGE_60: number
}

// 지역별 신청자 (getAPTReqstAreaStat)
export interface ApplicantAreaItem {
  STAT_DE: string
  SUBSCRPT_AREA_CODE: string
  SUBSCRPT_AREA_CODE_NM: string
  AGE_30: number
  AGE_40: number
  AGE_50: number
  AGE_60: number
}

// ============================================================
// 공통 API 응답 래퍼
// ============================================================
export interface ApiResponse<T> {
  items: T[]
  matchCount: number   // ★ 필터 적용된 실제 결과 수 (KPI/페이지네이션에 사용)
  totalCount: number   // 전체 데이터 수 (필터 무관 — UI에서 사용 X)
  pageNo: number
  numOfRows: number
  cached?: boolean
  fetchedAt?: number
}
