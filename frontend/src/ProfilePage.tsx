import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { signOut } from './auth'
import { useAuth } from './contexts/AuthContext'
import { ErrorMessage } from './AsyncState'
import './ProfilePage.css'

const profileKey = 'class2career.profile'

type Profile = {
  name: string
  email: string
  department: string
  grade: string
  goal: string
  introduction: string
  avatar: string
}

const emptyProfile: Profile = {
  name: '',
  email: '',
  department: '컴퓨터학부',
  grade: '1학년',
  goal: '',
  introduction: '',
  avatar: '',
}

function loadProfile(email: string): Profile {
  try {
    const saved = JSON.parse(window.localStorage.getItem(profileKey) ?? '{}') as Partial<Profile>
    return { ...emptyProfile, ...saved, email: email || saved.email || '' }
  } catch {
    return { ...emptyProfile, email }
  }
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(() => loadProfile(user?.email ?? ''))
  const [saved, setSaved] = useState(false)
  const [imageError, setImageError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const switchPending = useRef(false)
  const [showSwitchModal, setShowSwitchModal] = useState(false)
  const [switchingAccount, setSwitchingAccount] = useState(false)
  const [switchError, setSwitchError] = useState('')
  const initial = profile.name.trim().slice(0, 1) || '나'

  async function switchAccount() {
    if (switchPending.current) return
    switchPending.current = true
    setSwitchingAccount(true)
    setSwitchError('')
    try {
      const { error } = await signOut()
      if (error) {
        setSwitchError('계정에서 로그아웃하지 못했어요. 연결 상태를 확인하고 다시 시도해 주세요.')
        return
      }
      window.location.hash = '#login'
    } catch {
      setSwitchError('계정 변경을 시작하지 못했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      switchPending.current = false
      setSwitchingAccount(false)
    }
  }

  function update(field: keyof Profile, value: string) {
    setProfile((current) => ({ ...current, [field]: value }))
    setSaved(false)
  }

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    window.localStorage.setItem(profileKey, JSON.stringify(profile))
    setSaved(true)
  }

  function changeAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setImageError('이미지 파일만 선택할 수 있어요.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setImageError('2MB 이하의 이미지를 선택해 주세요.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') return
      update('avatar', reader.result)
      setImageError('')
    }
    reader.onerror = () => setImageError('이미지를 불러오지 못했어요.')
    reader.readAsDataURL(file)
  }

  function resetAvatar() {
    update('avatar', '')
    setImageError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <main className="profile-page">
      <nav className="profile-breadcrumb" aria-label="현재 위치"><a href="#dashboard">홈</a><span>/</span><span>프로필</span></nav>
      <header className="profile-intro">
        <div className="profile-avatar" aria-label="현재 프로필 사진">
          {profile.avatar ? <img src={profile.avatar} alt="" /> : <span aria-hidden="true">{initial}</span>}
        </div>
        <div><p>MY PROFILE</p><h1>프로필 설정</h1><span>학습과 진로 추천에 활용할 정보를 관리해요.</span></div>
      </header>

      <form className="profile-form" onSubmit={saveProfile}>
        <section className="profile-photo-section">
          <div><h2>프로필 사진</h2><p>기본 프로필을 사용하거나 원하는 사진을 등록할 수 있어요.</p></div>
          <div className="profile-photo-actions">
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={changeAvatar} />
            <button type="button" onClick={() => fileInputRef.current?.click()}>사진 넣기</button>
            <button className="profile-default-button" type="button" onClick={resetAvatar}>기본 프로필</button>
          </div>
          {imageError && <p className="profile-image-error" role="alert">{imageError}</p>}
        </section>
        <section>
          <h2>기본 정보</h2>
          <div className="profile-field-grid">
            <label><span>이름</span><input value={profile.name} onChange={(e) => update('name', e.target.value)} placeholder="이름을 입력하세요" required /></label>
            <label><span>이메일</span><input type="email" value={profile.email} readOnly aria-readonly="true" /></label>
            <label><span>학과</span><select value={profile.department} onChange={(e) => update('department', e.target.value)}><option>컴퓨터학부</option><option>소프트웨어학과</option><option>인공지능학과</option><option>기타</option></select></label>
            <label><span>학년</span><select value={profile.grade} onChange={(e) => update('grade', e.target.value)}><option>1학년</option><option>2학년</option><option>3학년</option><option>4학년</option><option>졸업생</option></select></label>
          </div>
        </section>
        <section>
          <h2>진로 정보</h2>
          <label><span>희망 직무</span><input value={profile.goal} onChange={(e) => update('goal', e.target.value)} placeholder="예: 프론트엔드 개발자" /></label>
          <label><span>나를 소개해 주세요</span><textarea value={profile.introduction} onChange={(e) => update('introduction', e.target.value)} placeholder="관심 분야, 학습 목표 등을 자유롭게 적어주세요" maxLength={300} /></label>
          <small>{profile.introduction.length}/300</small>
        </section>
        <section className="profile-account-section">
          <div><h2>로그인 계정</h2><p>현재 계정에서 로그아웃한 뒤 다른 계정으로 로그인할 수 있어요.</p></div>
          <button type="button" onClick={() => { setSwitchError(''); setShowSwitchModal(true) }}>다른 계정으로 로그인</button>
        </section>
        <div className="profile-actions">{saved && <span role="status">저장되었습니다.</span>}<button type="submit">프로필 저장</button></div>
      </form>
      {showSwitchModal && (
        <div className="profile-switch-backdrop" role="presentation" onMouseDown={() => { if (!switchingAccount) setShowSwitchModal(false) }}>
          <section className="profile-switch-modal" role="alertdialog" aria-modal="true" aria-labelledby="profile-switch-title" aria-describedby="profile-switch-description" onMouseDown={(event) => event.stopPropagation()}>
            <div className="profile-switch-icon" aria-hidden="true">↪</div>
            <h2 id="profile-switch-title">다른 계정으로 로그인할까요?</h2>
            <p id="profile-switch-description">현재 계정에서 로그아웃하고 로그인 화면으로 이동합니다. 이 기기에 저장된 현재 계정의 프로필과 학습 데이터도 안전하게 정리됩니다.</p>
            {switchError && <ErrorMessage message={switchError} onRetry={switchAccount} retrying={switchingAccount} compact />}
            <div className="profile-switch-actions">
              <button type="button" disabled={switchingAccount} onClick={() => setShowSwitchModal(false)}>취소</button>
              <button className="profile-switch-confirm" type="button" disabled={switchingAccount} onClick={switchAccount}>{switchingAccount ? '로그아웃 중…' : '계정 변경'}</button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
