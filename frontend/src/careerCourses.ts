export type CareerCourseConnection = {
  code: string
  concepts: string
}

export const careerCourseConnections: Record<string, CareerCourseConnection[]> = {
  '프론트엔드 개발자': [
    { code: 'ITEC0416', concepts: '웹 서비스 구현과 사용자 인터페이스' },
    { code: 'COMP0224', concepts: '소프트웨어 구조와 설계 원칙' },
    { code: 'COME0331', concepts: '자료 구조와 알고리즘 기초' },
    { code: 'COMP0322', concepts: '데이터 모델링과 데이터베이스 활용' },
    { code: 'COMP0422', concepts: '협업 개발과 소프트웨어 품질' },
    { code: 'COMP0455', concepts: '사용자 경험과 지능형 인터페이스' },
  ],
  '백엔드 개발자': [
    { code: 'COME0331', concepts: '자료 구조와 알고리즘 기초' },
    { code: 'COMP0322', concepts: '데이터 모델링과 데이터베이스 활용' },
    { code: 'COMP0312', concepts: '프로세스와 메모리 관리' },
    { code: 'COMP0414', concepts: '네트워크 구조와 통신 원리' },
    { code: 'COMP0422', concepts: '시스템 설계와 테스트' },
    { code: 'COMP0341', concepts: '인증·인가와 웹 보안' },
    { code: 'GLSO0227', concepts: '확장 가능한 클라우드 환경' },
  ],
  'AI 엔지니어': [
    { code: 'MTED0231', concepts: '벡터와 행렬 연산' },
    { code: 'COME0311', concepts: '확률 분포와 통계적 추론' },
    { code: 'ITEC0417', concepts: '기계학습 모델과 학습 방법' },
    { code: 'MOBI0224', concepts: '신경망과 딥러닝 모델' },
    { code: 'COMP0324', concepts: '인공지능의 핵심 원리' },
    { code: 'CAIB0234', concepts: '신경망 구조와 학습 원리' },
  ],
  '데이터 분석가': [
    { code: 'COME0311', concepts: '기술 통계와 가설 검정' },
    { code: 'COMP0322', concepts: '데이터 저장과 SQL' },
    { code: 'COMP0333', concepts: '파이썬 기반 데이터 분석' },
    { code: 'ITEC0419', concepts: '데이터 과학의 기초 방법론' },
    { code: 'COMP0462', concepts: '데이터 패턴 탐색과 분석' },
    { code: 'ITEC0417', concepts: '예측 모델과 성능 평가' },
  ],
  'UI/UX 디자이너': [
    { code: 'COMP0455', concepts: '사용자 경험과 인터랙션 설계' },
    { code: 'COMP0435', concepts: '디지털 콘텐츠와 시각 표현' },
    { code: 'COMP0413', concepts: '컴퓨터 그래픽과 시각화 원리' },
    { code: 'ITEC0416', concepts: '웹 화면 구현과 인터랙션' },
    { code: 'COMP0436', concepts: '증강현실 기반 사용자 경험' },
  ],
  '클라우드 엔지니어': [
    { code: 'COMP0312', concepts: '프로세스와 시스템 자원 관리' },
    { code: 'COMP0414', concepts: '네트워크 구조와 통신 원리' },
    { code: 'EECS0312', concepts: '네트워크 서비스 프로그래밍' },
    { code: 'GLSO0227', concepts: '가상화와 클라우드 인프라' },
    { code: 'ELEC0462', concepts: '운영체제 기반 시스템 개발' },
    { code: 'COMP0345', concepts: '인프라 보안의 기초' },
  ],
}
