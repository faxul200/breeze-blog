import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';

const CATEGORY_LIST = [
  { value: '', label: '전체' },
  { value: 'distance', label: '비거리' },
  { value: 'feel', label: '타구감' },
  { value: 'design', label: '디자인' },
];

export default function Layout({ children }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [catOpen, setCatOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const catRef = useRef(null);

  useEffect(() => {
    if (router.query.category) setCategory(router.query.category);
    if (router.query.search) setSearch(router.query.search);
  }, [router.query.category, router.query.search]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (catRef.current && !catRef.current.contains(e.target)) {
        setCatOpen(false);
      }
    }
    if (catOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [catOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    let url = '/posts';
    const params = [];
    if (category) params.push(`category=${category}`);
    if (search.trim()) params.push(`search=${encodeURIComponent(search.trim())}`);
    if (params.length) url += '?' + params.join('&');
    router.push(url);
    setMobileOpen(false);
  };

  const handleCategorySelect = (value) => {
    setCategory(value);
    setCatOpen(false);
    let url = '/posts';
    const params = [];
    if (value) params.push(`category=${value}`);
    if (search.trim()) params.push(`search=${encodeURIComponent(search.trim())}`);
    if (params.length) url += '?' + params.join('&');
    router.push(url);
    setMobileOpen(false);
  };

  const handleFooterCategory = (value) => {
    let url = '/posts';
    if (value) url += `?category=${value}`;
    router.push(url);
  };

  const selectedCat = CATEGORY_LIST.find(c => c.value === category) || CATEGORY_LIST[0];

  return (
    <div className="site-wrapper">
      <header className="site-header">
        <div className="container header-inner" style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <a href="/" className="brand" style={{fontWeight:700, fontSize:'1.25em', letterSpacing:'-0.5px', display:'flex', alignItems:'center', height:'44px', lineHeight:'44px'}}>팍술의 골프공 블로그</a>
          <button className="hamburger" aria-label="모바일 메뉴" onClick={() => setMobileOpen(v=>!v)} style={{background:'none', border:'1px solid #e2e8f0', borderRadius:8, padding:'6px 8px'}}>
            <span style={{display:'block', width:18, height:2, background:'#334155', margin:'3px 0'}}></span>
            <span style={{display:'block', width:18, height:2, background:'#334155', margin:'3px 0'}}></span>
            <span style={{display:'block', width:18, height:2, background:'#334155', margin:'3px 0'}}></span>
          </button>
          <div className="header-actions" style={{display:'flex', alignItems:'center', gap:'24px'}} data-open={mobileOpen ? 'true' : 'false'}>
            <nav className="nav-links" style={{display:'flex', alignItems:'center', gap:'24px', height:'44px'}}>
              <a href="/" style={{display:'flex', alignItems:'center', height:'44px', lineHeight:'44px'}}>홈</a>
              <div
                className={`nav-category${catOpen ? ' open' : ''}`}
                ref={catRef}
                tabIndex={0}
                style={{height:'44px', display:'flex', alignItems:'center'}}
                onBlur={() => setTimeout(() => setCatOpen(false), 120)}
              >
                <span
                  className="nav-category-label"
                  onClick={() => setCatOpen(v => !v)}
                  style={{outline:'none', height:'44px', display:'flex', alignItems:'center'}}
                >
                  카테고리
                  <span className="nav-category-arrow" style={{transform: catOpen ? 'rotate(180deg)' : 'rotate(0deg)'}}>
                    ▼
                  </span>
                </span>
                <div className="nav-category-list" style={{minWidth:100}}>
                  {CATEGORY_LIST.map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => handleCategorySelect(cat.value)}
                      style={{fontWeight: cat.value === category ? 700 : 400, color: cat.value === category ? '#0ea5e9' : undefined}}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              <a href="/about" style={{display:'flex', alignItems:'center', height:'44px', lineHeight:'44px'}}>소개</a>
            </nav>
            <form onSubmit={handleSearch} style={{display:'flex', alignItems:'center', gap:'0.5em', height:'44px'}}>
              <input
                type="text"
                placeholder="글 제목 검색..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{padding:'6px 12px', border:'1px solid #e2e8f0', borderRadius:6, fontSize:16, minWidth:140, height:'32px'}}
              />
              <button type="submit" style={{padding:'6px 16px', border:'none', borderRadius:6, background:'#0ea5e9', color:'#fff', fontWeight:600, cursor:'pointer', height:'32px'}}>검색</button>
            </form>
          </div>
        </div>
      </header>
      <main className="site-main">{children}</main>
      <footer className="site-footer">
        <div className="container" style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
          <p>© {new Date().getFullYear()} 팍술의 골프공 블로그</p>
          <div style={{display:'flex', flexDirection:'row', gap:'48px', textAlign:'right'}}>
            <div>
              <strong style={{fontWeight:600}}>카테고리</strong>
              <ul style={{listStyle:'none', padding:0, margin:'0.5em 0 0 0', display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'0.5em'}}>
                {CATEGORY_LIST.map(cat => (
                  <li key={cat.value}>
                    <button
                      type="button"
                      onClick={() => handleFooterCategory(cat.value)}
                      style={{
                        background:'none', border:'none', color:cat.value === category ? '#0ea5e9' : 'inherit', fontWeight:cat.value === category ? 700 : 400, fontSize:'1em', cursor:'pointer', padding:0
                      }}
                    >
                      {cat.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <strong style={{fontWeight:600}}>사이트 정보</strong>
              <ul style={{listStyle:'none', padding:0, margin:'0.5em 0 0 0', display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'0.5em'}}>
                <li><a href="/about">소개</a></li>
                <li><a href="/privacy">개인정보처리방침</a></li>
                <li><a href="/terms">이용약관</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
