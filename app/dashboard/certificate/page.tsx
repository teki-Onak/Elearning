'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2, Award, Download, ArrowLeft, CheckCircle, XCircle } from 'lucide-react'

export default function CertificatePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const courseId = searchParams.get('courseId')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const certRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!courseId) return
    const load = async () => {
      setLoading(true)
      const res = await fetch('/api/student/certificate?courseId=' + courseId)
      const d = await res.json()
      setData(d)
      setLoading(false)
    }
    load()
  }, [courseId])

  const handlePrint = () => {
    window.print()
  }

  if (!courseId) return (
    <div className="card text-center py-20">
      <p className="text-slate-400">No course selected.</p>
    </div>
  )

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  )

  if (data?.error) return (
    <div className="card text-center py-20">
      <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
      <p className="text-white font-semibold mb-1">Certificate Unavailable</p>
      <p className="text-slate-400 text-sm">{data.error}</p>
    </div>
  )

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        {data?.isEligible && (
          <button onClick={handlePrint} className="btn-primary flex items-center gap-2">
            <Download className="w-4 h-4" /> Download Certificate
          </button>
        )}
      </div>

      {!data?.isEligible ? (
        <div className="card border border-amber-800/40 bg-amber-900/10 text-center py-12">
          <XCircle className="w-14 h-14 text-amber-400 mx-auto mb-4" />
          <h2 className="text-white font-bold text-xl mb-2">Not Yet Eligible</h2>
          <p className="text-slate-400 mb-4">You need at least 80% overall progress to receive a certificate.</p>
          <div className="max-w-xs mx-auto">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Your Progress</span>
              <span className="text-white font-bold">{data?.overallProgress}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-amber-500 transition-all"
                style={{ width: data?.overallProgress + '%' }}
              />
            </div>
            <p className="text-slate-500 text-xs mt-2">Need 80% to unlock certificate</p>
          </div>
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mt-6">
            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
              <p className="text-white font-bold">{data?.completedLessons}/{data?.totalLessons}</p>
              <p className="text-slate-400 text-xs">Notes Read</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
              <p className="text-white font-bold">{data?.passedCats}/{data?.totalCats}</p>
              <p className="text-slate-400 text-xs">CATs Passed</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="card border border-emerald-800/40 bg-emerald-900/10 flex items-center gap-3 py-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <p className="text-emerald-400 text-sm font-medium">
              Congratulations! You have completed this course with {data?.overallProgress}% progress.
            </p>
          </div>

          {/* Certificate */}
          <div ref={certRef} className="print-area bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div style={{
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
              padding: '60px',
              textAlign: 'center',
              fontFamily: 'Georgia, serif',
              position: 'relative',
            }}>
              {/* Border decoration */}
              <div style={{
                position: 'absolute', inset: '16px',
                border: '2px solid rgba(167,139,250,0.4)',
                borderRadius: '12px',
                pointerEvents: 'none',
              }} />
              <div style={{
                position: 'absolute', inset: '20px',
                border: '1px solid rgba(167,139,250,0.2)',
                borderRadius: '10px',
                pointerEvents: 'none',
              }} />

              {/* Logo & Title */}
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '40px' }}>🎓</span>
              </div>
              <h1 style={{ color: '#a78bfa', fontSize: '14px', letterSpacing: '4px', textTransform: 'uppercase', margin: '0 0 4px' }}>
                EduFlow Learning Platform
              </h1>
              <h2 style={{ color: '#e2e8f0', fontSize: '36px', fontWeight: 'bold', margin: '16px 0 8px' }}>
                Certificate of Completion
              </h2>
              <div style={{ width: '80px', height: '3px', background: 'linear-gradient(90deg, #7c3aed, #a78bfa)', margin: '0 auto 24px' }} />

              <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>
                This is to certify that
              </p>
              <h3 style={{ color: '#ffffff', fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px', fontStyle: 'italic' }}>
                {data?.student?.name}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>
                has successfully completed the course
              </p>
              <h4 style={{ color: '#a78bfa', fontSize: '24px', fontWeight: 'bold', margin: '0 0 24px' }}>
                {data?.course?.title}
              </h4>

              {/* Stats */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '32px' }}>
                {[
                  { label: 'Progress', value: data?.overallProgress + '%' },
                  { label: 'Notes Read', value: data?.completedLessons + '/' + data?.totalLessons },
                  { label: 'CATs Passed', value: data?.passedCats + '/' + data?.totalCats },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <div style={{ color: '#a78bfa', fontSize: '22px', fontWeight: 'bold' }}>{s.value}</div>
                    <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ width: '80px', height: '1px', background: 'rgba(167,139,250,0.3)', margin: '0 auto 24px' }} />

              {/* Signatures */}
              <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '120px', height: '1px', background: '#4f46e5', margin: '0 auto 8px' }} />
                  <p style={{ color: '#e2e8f0', fontSize: '13px', margin: 0 }}>{data?.hod}</p>
                  <p style={{ color: '#64748b', fontSize: '11px', margin: '2px 0 0' }}>Head of Department</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '120px', height: '1px', background: '#4f46e5', margin: '0 auto 8px' }} />
                  <p style={{ color: '#e2e8f0', fontSize: '13px', margin: 0 }}>EduFlow Admin</p>
                  <p style={{ color: '#64748b', fontSize: '11px', margin: '2px 0 0' }}>Platform Director</p>
                </div>
              </div>

              <p style={{ color: '#475569', fontSize: '11px', marginTop: '16px' }}>
                Issued on {new Date(data?.completedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                &nbsp;·&nbsp; Certificate ID: CERT-{data?.course?.id?.slice(-8).toUpperCase()}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
