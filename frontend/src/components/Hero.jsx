function Hero() {
  const scrollToProducts = () => {
    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-accent-soft)',
        borderBottom: '1px solid var(--color-border)'
      }}
    >
      <div className="container py-5">
        <div className="row align-items-center py-4">
          <div className="col-lg-7">
            <div className="eyebrow mb-3">New arrivals, every week</div>
            <h1
              className="font-display mb-3"
              style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', lineHeight: 1.1, color: 'var(--color-ink)' }}
            >
              Everything you need,<br />nothing you don't.
            </h1>
            <p className="mb-4" style={{ color: 'var(--color-muted)', fontSize: '1.05rem', maxWidth: '480px' }}>
              Thoughtfully sourced products across electronics, fashion, home,
              and more — all in one place.
            </p>
            <button className="btn-boutique" onClick={scrollToProducts}>
              Shop Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
