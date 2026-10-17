function Hero() {
  const scrollToProducts = () => {
    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      className="hero-banner"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600')"
      }}
    >
      <div className="hero-overlay" />

      <div
        className="page-container position-relative"
        style={{ paddingTop: 'clamp(4rem, 10vw, 7rem)', paddingBottom: 'clamp(4rem, 10vw, 7rem)' }}
      >
        <div style={{ maxWidth: '560px' }}>
          <div className="eyebrow mb-3" style={{ color: '#E8ECE6' }}>The New Season Edit</div>
          <h1
            className="font-display mb-3"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', lineHeight: 1.1, color: '#fff' }}
          >
            Style, curated<br />for every you.
          </h1>
          <p className="mb-4" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem' }}>
            Fashion, footwear, and accessories for men, women, and kids —
            thoughtfully chosen, effortlessly styled.
          </p>
          <button className="btn-boutique" onClick={scrollToProducts}>
            Explore the Edit
          </button>
        </div>
      </div>
    </div>
  );
}

export default Hero;