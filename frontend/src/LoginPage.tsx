import './LoginPage.css'

export default function LoginPage() {
  return (
    <main className="login-page">
      <p className="login-welcome">WELCOME</p>
      <h1>다시 만나서 반가워요!</h1>
      <p>로그인하고 나에게 맞는 학습과 직무 탐색을 이어가세요.</p>

      <form className="login-card" onSubmit={(event) => event.preventDefault()}>
        <h2>로그인</h2>

        <div>
          <label htmlFor="login-email">이메일</label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="username"
            placeholder="학교 이메일 또는 가입한 이메일을 입력하세요"
            required
          />
        </div>

        <div>
          <label htmlFor="login-password">비밀번호</label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="비밀번호를 입력하세요"
            required
          />
        </div>

        <p className="login-forgot">비밀번호를 잊으셨나요?</p>

        <button type="submit">로그인</button>

        <p className="login-signup">
            아직 계정이 없으신가요? <a href="#signup">회원가입</a>
        </p>
      </form>
    </main>
  );
}