/* site.js — interactions légères, fluides, modernes */

;(function () {
  // Footer year
  const year = document.getElementById('year')
  if (year) year.textContent = String(new Date().getFullYear())

  // Smooth scroll for internal anchors
  document.querySelectorAll('[data-scroll]').forEach((el) => {
    el.addEventListener('click', (e) => {
      const href = el.getAttribute('href') || ''
      if (!href.startsWith('#')) return
      const target = document.querySelector(href)
      if (!target) return

      e.preventDefault()
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  })

  // Header compact on scroll (premium)
  const header = document.getElementById('site-header')
  const prefersReduced =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (header && !prefersReduced) {
    let lastState = false

    const update = () => {
      // threshold: dès qu'on a scroll un peu
      const compact = window.scrollY > 24
      if (compact === lastState) return
      lastState = compact
      header.classList.toggle('is-compact', compact)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
  }

  // Reveal on scroll (IntersectionObserver)
  const revealEls = Array.from(document.querySelectorAll('.reveal'))

  if (!prefersReduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const el = entry.target
          const delay = Number(el.getAttribute('data-reveal-delay') || '0')
          el.style.transitionDelay = `${delay}ms`
          el.classList.add('is-visible')
          io.unobserve(el)
        }
      },
      { threshold: 0.12 }
    )

    revealEls.forEach((el) => io.observe(el))
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'))
  }

  // Lightbox
  const lightbox = document.getElementById('lightbox')
  const lightboxImg = document.getElementById('lightbox-img')

  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImg) return
    lightboxImg.src = src
    lightboxImg.alt = alt || 'Aperçu'
    lightbox.classList.add('is-open')
    lightbox.setAttribute('aria-hidden', 'false')
    document.body.style.overflow = 'hidden'
  }

  function closeLightbox() {
    if (!lightbox || !lightboxImg) return
    lightbox.classList.remove('is-open')
    lightbox.setAttribute('aria-hidden', 'true')
    lightboxImg.src = ''
    document.body.style.overflow = ''
  }

  document.querySelectorAll('[data-lightbox]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const src = btn.getAttribute('data-lightbox')
      const img = btn.querySelector('img')
      if (!src) return
      openLightbox(src, img ? img.alt : 'Aperçu')
    })
  })

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      const t = e.target
      if (t && t.matches && t.matches('[data-lightbox-close]')) closeLightbox()
    })
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox()
  })
})()