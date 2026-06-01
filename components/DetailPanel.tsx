'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { SaleItem } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import StatusBadge, { getStatus } from '@/components/ui/StatusBadge'
import Dday from '@/components/ui/Dday'

// 모집공고→청약접수→당첨발표→계약 일정 트랙
function ScheduleTrack({ item }: { item: SaleItem }) {
  const steps = [
    { label: '모집공고', date: item.RCRIT_PBLANC_DE },
    { label: '청약접수', date: item.RCEPT_BGNDE },
    { label: '당첨발표', date: item.PRZWNER_PRESNATN_DE },
    { label: '계약', date: item.CNTRCT_CNCLS_BGNDE },
  ]
  const toDate = (s: string) => {
    if (!s) return null
    const c = s.replace(/-/g, '')
    if (c.length < 8) return null
    return new Date(Number(c.slice(0,4)), Number(c.slice(4,6)) - 1, Number(c.slice(6,8)))
  }
  const today = new Date(); today.setHours(0,0,0,0)

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
      {steps.map((s, i) => {
        const d = toDate(s.date)
        const done = d ? today > d : false
        const prev = toDate(steps[i-1]?.date)
        const isNow = d ? (today <= d && (i === 0 || (prev && today > prev))) : false
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            {i < steps.length - 1 && (
              <div style={{ position: 'absolute', top: 7, left: '50%', right: '-50%', height: 2, background: done ? 'var(--primary)' : 'var(--border-2)' }} />
            )}
            <div style={{
              width: 15, height: 15, borderRadius: '50%', position: 'relative', zIndex: 1,
              background: done ? 'var(--primary)' : 'var(--surface)',
              border: `2px solid ${done || isNow ? 'var(--primary)' : 'var(--border-3)'}`,
              boxShadow: isNow ? 'var(--sh-focus)' : 'none', display: 'grid', placeItems: 'center',
            }}>
              {isNow && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)' }} />}
            </div>
            <div style={{ marginTop: 7, fontSize: 11.5, fontWeight: isNow ? 800 : 600, color: isNow ? 'var(--primary-ink)' : done ? 'var(--ink-2)' : 'var(--ink-4)' }}>{s.label}</div>
            <div className="num" style={{ marginTop: 1, fontSize: 11, color: 'var(--ink-3)' }}>{formatDate(s.date)}</div>
          </div>
        )
      })}
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{label}</span>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', textAlign: 'right' }}>{value || '-'}</span>
    </div>
  )
}

export default function DetailPanel({
  item,
  onClose,
}: {
  item: SaleItem | null
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (item) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [item, onClose])

  if (!item) return null

  return (
    <>
      {/* 오버레이 */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(11,26,59,.4)', zIndex: 60,
        animation: 'cy-fade .2s',
      }} />
      {/* 패널 */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(480px, 92vw)', zIndex: 61,
        background: 'var(--surface)', boxShadow: 'var(--sh-lg, -16px 0 44px rgba(11,26,59,.18))',
        overflowY: 'auto', animation: 'cy-slide-in .25s cubic-bezier(.2,.7,.3,1)',
      }}>
        <div className="sticky top-0 flex items-center justify-between p-5"
          style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', zIndex: 1 }}>
          <div className="flex items-center gap-2">
            <StatusBadge status={getStatus(item.RCEPT_BGNDE, item.RCEPT_ENDDE)} />
            <Dday dateStr={item.RCEPT_ENDDE} label="마감" />
          </div>
          <button onClick={onClose} aria-label="닫기"
            style={{ display: 'grid', placeItems: 'center', width: 36, height: 36, borderRadius: 'var(--r-sm)', color: 'var(--ink-3)' }}
            className="hover:bg-[var(--bg-2)]">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', lineHeight: 1.3 }}>{item.HOUSE_NM}</h2>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4 }}>{item.HSSPLY_ADRES || item.SUBSCRPT_AREA_CODE_NM}</p>
          </div>

          {/* 일정 트랙 */}
          <div className="cy-panel" style={{ padding: 18 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-2)', marginBottom: 16 }}>청약 일정</h3>
            <ScheduleTrack item={item} />
          </div>

          {/* 상세 정보 */}
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-2)', marginBottom: 4 }}>분양 정보</h3>
            <Row label="주택구분" value={`${item.HOUSE_SECD_NM ?? '-'} / ${item.HOUSE_DTL_SECD_NM ?? '-'}`} />
            <Row label="공급규모" value={item.TOT_SUPLY_HSHLDCO ? `${Number(item.TOT_SUPLY_HSHLDCO).toLocaleString()}세대` : '-'} />
            <Row label="공급지역" value={item.SUBSCRPT_AREA_CODE_NM} />
            <Row label="사업주체" value={item.BSNSMBY_NM} />
            <Row label="건설업체" value={item.CNSTRCT_ENTRPS_NM} />
            <Row label="투기과열지구" value={item.MDAT_TRGET_AREA_SECD === 'Y' ? '해당' : '미해당'} />
            <Row label="분양가상한제" value={item.PARCPRC_ULS_AT === 'Y' ? '적용' : '미적용'} />
            <Row label="특별공급 접수" value={item.SPSPLY_RCEPT_BGNDE ? `${formatDate(item.SPSPLY_RCEPT_BGNDE)} ~ ${formatDate(item.SPSPLY_RCEPT_ENDDE)}` : '-'} />
            <Row label="계약기간" value={item.CNTRCT_CNCLS_BGNDE ? `${formatDate(item.CNTRCT_CNCLS_BGNDE)} ~ ${formatDate(item.CNTRCT_CNCLS_ENDDE)}` : '-'} />
            <Row label="주택관리번호" value={<span className="font-mono">{item.HOUSE_MANAGE_NO}</span>} />
          </div>

          <div className="flex gap-2">
            {item.HMPG_ADRES && (
              <a href={item.HMPG_ADRES} target="_blank" rel="noopener noreferrer"
                className="flex-1 text-center"
                style={{ padding: '11px', borderRadius: 'var(--r-sm)', background: 'var(--primary)', color: '#fff', fontSize: 14, fontWeight: 700 }}>
                청약홈 공고 보기 →
              </a>
            )}
            <a href={`/competition?hmn=${item.HOUSE_MANAGE_NO}`}
              className="flex-1 text-center"
              style={{ padding: '11px', borderRadius: 'var(--r-sm)', background: 'var(--bg-2)', color: 'var(--ink)', fontSize: 14, fontWeight: 700 }}>
              경쟁률 보기
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
