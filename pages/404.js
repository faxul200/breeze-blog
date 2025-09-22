import Link from 'next/link';
import Head from 'next/head';

export default function Custom404() {
  return (
    <div className="notfound-container">
      <Head>
        <title>페이지를 찾을 수 없습니다 | 팍술의 골프공 블로그</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="notfound-content">
        <h1>404</h1>
        <h2>페이지를 찾을 수 없습니다</h2>
        <p>
          요청하신 페이지가 존재하지 않거나, <br />
          주소가 잘못 입력되었습니다.<br />
          <span style={{color:'#0ea5e9', fontWeight:600}}>팍술의 골프공 블로그</span>는 다양한 골프공 리뷰와 정보를 제공합니다.<br />
          아래 버튼을 눌러 홈으로 돌아가세요.
        </p>
        <Link href="/" className="notfound-home-btn">
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
