import Head from 'next/head';

export async function getServerSideProps() {
  return { props: {} };
}

export default function TermsPage() {
  const title = '이용약관 | 팍술의 골프공 블로그';
  const desc = '팍술의 골프공 블로그 서비스 이용약관 안내 페이지';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return (
    <div className="container">
      <Head>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <meta name="google-adsense-account" content="ca-pub-2930039630594930" />
        <link rel="canonical" href={`${siteUrl}/terms`} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:url" content={`${siteUrl}/terms`} />
      </Head>
      <article className="post-body">
        <div className="post-header" style={{paddingLeft: '0.5em'}}>
          <h1 className="post-title" style={{paddingLeft: 0, marginLeft: 0, fontSize: '1.5em', fontWeight: 700}}>이용약관</h1>
        </div>
        <div className="post-content" style={{paddingLeft: '0.5em'}}>
          <p style={{paddingLeft: 0}}>
            본 약관은 팍술의 골프공 블로그(이하 '회사')가 운영하는 블로그 및 관련 서비스(이하 '서비스') 이용과 관련하여 회사와 방문자 간의 권리와 의무를 규정하는 것을 목적으로 합니다.
          </p>
          <h2>제1조 (목적)</h2>
          <p>이 약관은 회사가 제공하는 블로그 서비스 이용과 관련하여 회사와 방문자 간의 권리, 의무 및 책임사항을 규정합니다.</p>
          <h2>제2조 (용어의 정의)</h2>
          <p>이 약관에서 사용하는 주요 용어의 정의는 다음과 같습니다.</p>
          <ul style={{paddingLeft: '1.5em', marginLeft: 0}}>
            <li>'서비스'란 회사가 운영하는 블로그 및 관련 웹사이트를 의미합니다.</li>
            <li>'방문자'란 서비스를 이용하는 모든 사용자를 의미하며, 회원가입 절차는 별도로 없습니다.</li>
            <li>'콘텐츠'란 회사가 서비스 내에 게시하는 글, 이미지, 영상 등 모든 정보를 뜻합니다.</li>
          </ul>
          <h2>제3조 (약관의 효력 및 변경)</h2>
          <ol style={{paddingLeft: '1.5em', marginLeft: 0}}>
            <li>본 약관은 서비스 이용에 동의하는 모든 방문자에게 적용됩니다.</li>
            <li>회사는 관련 법령에 위배되지 않는 범위 내에서 약관을 변경할 수 있으며, 변경 시 적용일자 및 사유를 명시하여 사이트 초기화면 또는 공지사항에 7일 전부터 공지합니다.</li>
          </ol>
          <h2>제4조 (서비스의 제공 및 변경)</h2>
          <ol style={{paddingLeft: '1.5em', marginLeft: 0}}>
            <li>회사는 블로그 게시글 제공, 정보 공유, 댓글 기능 등 서비스를 운영합니다.</li>
            <li>회사는 서비스 내용 및 운영시간 등을 사전 고지 후 변경할 수 있습니다.</li>
          </ol>
          <h2>제5조 (서비스 이용 제한 및 중단)</h2>
          <ol style={{paddingLeft: '1.5em', marginLeft: 0}}>
            <li>회사는 시스템 점검, 장애, 기타 불가피한 사유로 서비스 제공을 일시 중단할 수 있습니다.</li>
            <li>서비스 중단 시 회사는 공지사항 또는 이메일 등으로 사전 안내합니다.</li>
          </ol>
          <h2>제6조 (게시물 관리)</h2>
          <ol style={{paddingLeft: '1.5em', marginLeft: 0}}>
            <li>방문자가 작성한 댓글 및 게시물은 공서양속에 반하지 않아야 하며, 타인의 권리를 침해해서는 안 됩니다.</li>
            <li>회사는 관련 법령 또는 서비스 정책에 위반되는 게시물을 사전 통지 없이 삭제하거나 접근을 제한할 수 있습니다.</li>
          </ol>
          <h2>제7조 (개인정보보호)</h2>
          <ol style={{paddingLeft: '1.5em', marginLeft: 0}}>
            <li>회사는 방문자의 개인정보 보호를 위해 개인정보처리방침을 별도로 운영하며, 관련 법령을 준수합니다.</li>
            <li>개인정보의 수집 및 이용에 관한 사항은 개인정보처리방침을 참고하시기 바랍니다.</li>
          </ol>
          <h2>제8조 (면책조항)</h2>
          <ol style={{paddingLeft: '1.5em', marginLeft: 0}}>
            <li>회사는 천재지변, 서버 장애 등 불가항력으로 인한 서비스 중단에 대해 책임을 지지 않습니다.</li>
            <li>방문자의 부주의 또는 불법 행위로 인한 손해에 대해 회사는 책임을 지지 않습니다.</li>
            <li>서비스 이용과 관련하여 발생하는 분쟁에 대해 회사는 법령이 정하는 바에 따라 책임을 집니다.</li>
          </ol>
          <h2>제9조 (분쟁 해결)</h2>
          <ol style={{paddingLeft: '1.5em', marginLeft: 0}}>
            <li>서비스 이용과 관련한 분쟁 발생 시 양 당사자는 성실히 협의하여 해결합니다.</li>
            <li>협의가 어려운 경우 대한민국 법률을 따르며, 회사 소재지 관할 법원을 전속 관할 법원으로 합니다.</li>
          </ol>
          <p className="effective-date" style={{marginTop: '2em'}}>
            부칙<br />
            본 약관은 2025년 07월 10일부터 시행합니다.
          </p>
        </div>
      </article>
    </div>
  );
}



