import './CareerConceptPage.css'

type Props = { careerName: string; courseName: string; conceptSummary: string }
type Note = { definition: string; keywords: string[]; flow: string[]; example: string; checkpoint: string }

function getCourseNote(courseName: string, summary: string): Note {
  if (courseName.includes('자료구조')) return {
    definition: '자료구조는 데이터를 목적에 맞는 형태로 배치하고 저장하여 효율적으로 사용하는 방법을 배우는 과목이에요. 배열, 연결 리스트, 스택, 큐, 트리, 그래프의 동작 원리를 비교하고, 검색·추가·삭제처럼 자주 수행하는 연산에 어떤 구조가 적합한지 판단합니다. 데이터의 양이 커질수록 구조 선택에 따른 속도와 메모리 차이가 커지기 때문에 실제 서비스의 성능을 설계하는 기초가 돼요.',
    keywords: ['배열과 연결 리스트', '스택과 큐', '트리와 그래프', '시간 복잡도'],
    flow: ['문제에서 자주 하는 연산 찾기', '연산 비용이 낮은 구조 선택하기', '입력 크기에 따른 성능 확인하기'],
    example: '브라우저의 뒤로 가기는 스택, 알림 처리 순서는 큐, 친구 관계 추천은 그래프로 표현할 수 있어요.',
    checkpoint: '배열과 연결 리스트의 탐색·삽입 비용 차이를 말할 수 있는지 확인해 보세요.',
  }
  if (courseName.includes('데이터베이스')) return {
    definition: '데이터베이스는 서비스에서 발생하는 데이터를 일관되고 안전하게 저장하고, 필요한 정보를 정확하게 조회하도록 설계하는 과목이에요. 현실의 사용자·상품·주문 같은 대상을 테이블과 관계로 표현하고 SQL로 데이터를 다루며, 정규화로 중복을 줄이고 트랜잭션으로 여러 작업의 신뢰성을 지킵니다. 인덱스와 쿼리 실행 과정까지 이해하면 데이터가 많아져도 빠른 서비스를 설계할 수 있어요.',
    keywords: ['관계형 모델', 'SQL', '정규화', '인덱스와 트랜잭션'],
    flow: ['업무의 데이터와 관계 찾기', '테이블과 키 설계하기', 'SQL로 조회하고 무결성 검증하기'],
    example: '쇼핑몰의 회원·상품·주문을 각각 테이블로 나누고 키로 연결해 주문 내역을 조회합니다.',
    checkpoint: '기본 키와 외래 키의 역할, JOIN이 필요한 이유를 설명해 보세요.',
  }
  if (courseName.includes('네트워크')) return {
    definition: '컴퓨터 네트워크는 서로 다른 기기가 정해진 규칙에 따라 데이터를 주고받는 전체 과정을 배우는 과목이에요. 주소를 찾는 DNS, 신뢰성 있는 전송을 담당하는 TCP/IP, 웹의 요청과 응답을 정의하는 HTTP가 계층별로 어떻게 협력하는지 이해합니다. 이를 바탕으로 통신 지연, 연결 실패, 보안 문제의 원인을 추적하고 안정적인 서비스를 설계할 수 있어요.',
    keywords: ['TCP/IP', 'HTTP', 'DNS', '라우팅과 보안'],
    flow: ['주소 찾기', '연결 만들기', '요청과 응답 보내기', '오류와 지연 확인하기'],
    example: '웹 주소를 입력하면 DNS가 서버 주소를 찾고, 브라우저가 HTTP 요청을 보내 응답 화면을 받아요.',
    checkpoint: 'URL 입력 후 화면이 나타날 때까지의 흐름을 순서대로 적어 보세요.',
  }
  return {
    definition: `${courseName}은(는) ${summary}을 중심으로 핵심 원리와 문제 해결 방법을 배우는 과목이에요. 단순히 용어를 암기하는 데서 끝나지 않고, 각 개념이 어떤 조건에서 동작하며 서로 어떻게 연결되는지를 작은 예제로 확인합니다. 이후 실제 직무에서 만나는 요구사항을 분석하고 적절한 방법을 선택·적용한 뒤 결과를 검증하는 힘을 기를 수 있어요.`,
    keywords: summary.split(/\s*[·,]\s*|\s+와\s+|\s+과\s+/).filter(Boolean).slice(0, 4),
    flow: ['핵심 용어와 원리 이해하기', '작은 예제로 동작 과정 따라가기', '직무와 연결된 문제에 직접 적용하기'],
    example: '직무에서 요구사항을 작은 단위로 나누고, 배운 개념을 적용한 뒤 결과를 검증하는 방식으로 활용해요.',
    checkpoint: `${summary}의 핵심 원리를 다른 사람에게 예시와 함께 설명할 수 있는지 확인해 보세요.`,
  }
}

export default function CareerConceptPage({ careerName, courseName, conceptSummary }: Props) {
  const note = getCourseNote(courseName, conceptSummary)
  return (
    <main className="career-concept-page">
      <nav className="career-concept-breadcrumb" aria-label="현재 위치">
        <a href="#career">직무 탐색</a><span>/</span>
        <a href={`#career-${encodeURIComponent(careerName)}`}>{careerName}</a><span>/</span>
        <span aria-current="page">{courseName}</span>
      </nav>
      <header className="career-concept-intro">
        <p>{careerName} · 과목 노트</p><h1>{courseName}</h1><span>{conceptSummary}</span>
      </header>
      <article className="course-notebook" aria-label={`${courseName} 상세 개념 노트`}>
        <section><span className="note-label">01. 한 줄 개념</span><h2>{courseName}이란?</h2><p>{note.definition}</p></section>
        <section><span className="note-label">02. 핵심 키워드</span><ul className="note-keywords">{note.keywords.map((word) => <li key={word}># {word}</li>)}</ul></section>
        <section><span className="note-label">03. 공부 흐름</span><ol className="note-flow">{note.flow.map((step, i) => <li key={step}><b>{i + 1}</b>{step}</li>)}</ol></section>
        <section className="note-example"><span className="note-label">04. {careerName} 실무 예시</span><p>{note.example}</p></section>
        <aside className="note-checkpoint"><strong>✓ 학습 체크</strong><p>{note.checkpoint}</p></aside>
      </article>
      <a className="back-to-career" href={`#career-${encodeURIComponent(careerName)}`}>← {careerName}의 다른 과목 보기</a>
    </main>
  )
}
