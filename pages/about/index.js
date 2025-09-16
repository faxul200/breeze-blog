import Head from 'next/head';
import { useRef, useState } from 'react';

export async function getServerSideProps() {
  return { props: {} };
}

export default function AboutPage() {
  const title = '블로그 소개 | 골프공 리뷰 블로그';
  const desc = '골프공 리뷰, 장비, 팁 등 골프 애호가를 위한 블로그 소개 페이지';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // EmailJS 연동
  const [sending, setSending] = useState(false);
  const [resultMsg, setResultMsg] = useState('');
  const subjectRef = useRef();
  const messageRef = useRef();

  const sendEmail = async (e) => {
    e.preventDefault();
    setSending(true);
    setResultMsg('');
    try {
      if (!window.emailjs) {
        setResultMsg('메일 전송 라이브러리 로딩 실패');
        setSending(false);
        return;
      }
      await window.emailjs.send(
        'service_mu3oyft',
        'template_cb157nk',
        {
          title: subjectRef.current.value,
          name: '',
          message: messageRef.current.value,
          email: 'faxul200@gmail.com',
        }
      );
      setResultMsg('메일이 성공적으로 전송되었습니다.');
      subjectRef.current.value = '';
      messageRef.current.value = '';
    } catch (err) {
      setResultMsg('메일 전송 중 오류가 발생했습니다.');
    } finally {
      setSending(false);
    }
  };

  // emailjs CDN 동적 로드
  if (typeof window !== 'undefined' && !window.emailjs) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js';
    script.onload = () => window.emailjs && window.emailjs.init('fpGrAUrUSR8MEHynw');
    document.body.appendChild(script);
  }

  return (
    <div className="container">
      <Head>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={`${siteUrl}/about`} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:url" content={`${siteUrl}/about`} />
      </Head>
      <article className="post-body">
        <h1 className="post-title-detail">블로그 소개</h1>
        <div className="post-content">
          <p>안녕하세요! 저는 골프공에 진심인 골프 애호가입니다.<br />
            이 블로그는 다양한 브랜드의 골프공을 직접 사용해보고,<br />
            그 느낌과 성능을 솔직하게 정리한 리뷰 전문 블로그입니다.</p>

          <h2>👨‍🏫 리뷰 기준</h2>
          <ul>
            <li>실제 필드 또는 연습장에서 직접 사용 후 작성</li>
            <li>타구감, 비거리, 정렬선, 디자인 등을 기준으로 분석</li>
            <li>가능한 실제 사진과 데이터를 첨부합니다</li>
          </ul>

          <h2>💬 블로그 목적</h2>
          <ul>
            <li>골프공 선택에 어려움을 겪는 분들을 위해</li>
            <li>초보자부터 중상급자까지 쉽게 이해할 수 있도록</li>
            <li>골프공 외에도 관련 장비, 팁도 함께 다룰 예정입니다</li>
          </ul>

          <div className="contact-section" style={{marginTop:'2.5rem', maxWidth:500}}>
            <h2>관리자에게 메일보내기</h2>
            <form onSubmit={sendEmail}>
              <div className="form-group" style={{marginBottom:'1rem'}}>
                <label htmlFor="contact-subject">제목입력</label>
                <input type="text" id="contact-subject" ref={subjectRef} className="form-control" placeholder="제목을 입력하세요" required style={{width:'100%',padding:8}} />
              </div>
              <div className="form-group" style={{marginBottom:'1rem'}}>
                <label htmlFor="contact-email">관리자이메일</label>
                <input type="email" id="contact-email" className="form-control" value="faxul200@gmail.com" readOnly style={{width:'100%',padding:8,background:'#f5f5f5'}} />
              </div>
              <div className="form-group" style={{marginBottom:'1rem'}}>
                <label htmlFor="contact-message">메일내용입력</label>
                <textarea id="contact-message" ref={messageRef} className="form-control" rows={6} placeholder="메세지를 입력하세요" required style={{width:'100%',padding:8}} />
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <button type="submit" className="btn btn-primary" style={{padding:'8px 24px'}} disabled={sending}>Send Email</button>
                {sending && (
                  <span style={{display:'flex',alignItems:'center',height:24}}>
                    <img src="/progress.gif" alt="loading" style={{width:24,height:24,objectFit:'contain'}} />
                  </span>
                )}
              </div>
            </form>
            {resultMsg && (
              <div style={{marginTop:'1rem', color: resultMsg.includes('성공적으로') ? '#22c55e' : undefined}}>{resultMsg}</div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}



