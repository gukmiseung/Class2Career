import './LearningPage.css'

const learningSummary = [
  { label: '수강 완료 과목', value: 0, caption: '등록한 과목 기준', primary: true },
  { label: '수강 예정 과목', value: 0, caption: '앞으로 배울 과목' },
  { label: '관심 직무', value: 0, caption: '저장한 직무' },
]

export default function LearningPage() {
  return (
    <main className="learning-page">
      <h1>나의 학습 현황</h1>

      <section className="learning-summary" aria-label="학습 현황 요약">
        {learningSummary.map((item) => (
          <article className={item.primary ? 'primary' : ''} key={item.label}>
            <h2>{item.label}</h2>
            <strong>{item.value}개</strong>
            <p>{item.caption}</p>
          </article>
        ))}
      </section>

      <section className="learning-courses" aria-labelledby="learning-courses-title">
        <p id="learning-courses-title">총 0개 과목</p>
        <div className="learning-empty">
          <div aria-hidden="true">📚</div>
          <h2>아직 등록한 과목이 없어요</h2>
          <p>수강 완료 또는 수강 예정 과목을 등록하면 이곳에서 학습 현황을 확인할 수 있어요.</p>
          <a href="#explore">과목 등록하기</a>
        </div>
      </section>
    </main>
  )
}
