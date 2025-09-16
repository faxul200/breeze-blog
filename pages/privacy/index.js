import Head from 'next/head';

export async function getServerSideProps() {
  return { props: {} };
}

export default function PrivacyPage() {
  const title = '개인정보처리방침 | Breeze';
  const desc = '팍술의 골프공 블로그 개인정보처리방침 안내 페이지';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return (
    <div className="container">
      <Head>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <meta name="google-adsense-account" content="ca-pub-2930039630594930" />
        <link rel="canonical" href={`${siteUrl}/privacy`} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:url" content={`${siteUrl}/privacy`} />
      </Head>
      <article className="post-body">
        <div className="post-header" style={{paddingLeft: '0.5em'}}>
          <h1 className="post-title" style={{paddingLeft: 0, marginLeft: 0, fontSize: '1.5em', fontWeight: 700}}>개인정보처리방침</h1>
        </div>
        <div className="post-content" style={{paddingLeft: '0.5em'}}>
          <p style={{paddingLeft: 0}}>
            팍술의 골프공 블로그(이하 '회사')는 이용자의 개인정보 보호를 매우 중요하게 생각하며, 관련 법령에 따라 개인정보를 안전하게 처리하고 있습니다.<br />
            본 개인정보처리방침은 블로그 서비스 이용과 관련하여 수집하는 개인정보의 항목, 이용 목적, 보유 기간 및 관리 방침을 안내합니다.
          </p>
          <h2>1. 수집하는 개인정보 항목</h2>
          <p>회사는 다음과 같은 개인정보를 수집합니다:</p>
          <ul style={{paddingLeft: '1.5em', marginLeft: 0}}>
            <li>필수 항목: 이메일 주소, 닉네임 (댓글 작성 및 회원 서비스 이용 시)</li>
            <li>자동 수집 항목: IP 주소, 쿠키, 접속 기록, 브라우저 종류 및 OS 정보 (서비스 운영 및 통계 목적)</li>
          </ul>
          <h2>2. 개인정보 수집 및 이용 목적</h2>
          <p>수집된 개인정보는 다음 목적에 한해 사용됩니다:</p>
          <ul style={{paddingLeft: '1.5em', marginLeft: 0}}>
            <li>댓글 작성 및 소통 기능 제공</li>
            <li>서비스 운영 및 장애 대응</li>
            <li>서비스 개선을 위한 통계 분석</li>
            <li>광고 및 프로모션 관련 안내</li>
          </ul>
          <h2>3. 개인정보 보유 및 이용 기간</h2>
          <p>이용자의 개인정보는 목적 달성 시까지 보유하며, 법령에 따른 별도 보관 의무가 있는 경우 해당 기간 동안 안전하게 저장합니다.</p>
          <h2>4. 개인정보 파기 절차 및 방법</h2>
          <p>개인정보는 수집 목적 달성 후 지체 없이 파기합니다. 전자적 파일 형태의 경우 복구 불가능한 방법으로 삭제합니다.</p>
          <h2>5. 개인정보 제3자 제공</h2>
          <p>회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 법령에 근거하거나 이용자가 사전에 동의한 경우 예외가 있습니다.</p>
          <h2>6. 개인정보 보호를 위한 기술적/관리적 조치</h2>
          <ul style={{paddingLeft: '1.5em', marginLeft: 0}}>
            <li>개인정보 취급 인원 최소화 및 교육 실시</li>
            <li>개인정보 접근 권한 관리 및 접근 통제</li>
            <li>데이터 암호화 및 보안 프로그램 운영</li>
            <li>주기적인 보안 점검 및 침해 사고 대응</li>
          </ul>
          <h2>7. 개인정보 보호책임자 및 문의처</h2>
          <p>개인정보와 관련한 문의 및 불만 처리를 위해 아래와 같이 담당자를 지정하고 있습니다.</p>
          <p>
            개인정보 보호책임자: 팍술<br />
            이메일: faxul200@gmail.com
          </p>
          <h2>8. 개인정보처리방침 변경 안내</h2>
          <p>본 방침은 법령 및 내부 정책에 따라 변경될 수 있으며, 변경 시 최소 7일 전에 사이트 공지사항을 통해 안내드립니다.</p>
          <p>시행일: 2025년 07월 10일</p>
        </div>
      </article>
    </div>
  );
}



