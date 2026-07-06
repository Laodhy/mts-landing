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
    if (typeof umami !== 'undefined') umami.track('apercu-screenshot')
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

  // Calendly event tracking
  window.addEventListener('message', (e) => {
    const ev = e.data && e.data.event
    if (!ev || !ev.startsWith('calendly')) return
    if (typeof umami === 'undefined') return
    if (ev === 'calendly.event_type_viewed') umami.track('calendly-vue')
    if (ev === 'calendly.date_and_time_selected') umami.track('calendly-creneau-choisi')
    if (ev === 'calendly.event_scheduled') umami.track('demo-reservee')
  })

  // Mobile nav toggle
  const navToggle = document.querySelector('.nav-toggle')
  const mainNav = document.getElementById('main-nav')

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('is-open')
      navToggle.setAttribute('aria-expanded', String(isOpen))
      navToggle.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu')
    })

    // Ferme le menu au clic sur un lien
    mainNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('is-open')
        navToggle.setAttribute('aria-expanded', 'false')
        navToggle.setAttribute('aria-label', 'Ouvrir le menu')
      })
    })
  }

  // YouTube video tracking
  if (document.getElementById('yt-player')) {
    let ytTracked = false
    window.onYouTubeIframeAPIReady = function () {
      new YT.Player('yt-player', {
        events: {
          onStateChange(e) {
            if (e.data === YT.PlayerState.PLAYING && !ytTracked) {
              ytTracked = true
              if (typeof umami !== 'undefined') umami.track('video-lecture')
            }
          }
        }
      })
    }
    const ytScript = document.createElement('script')
    ytScript.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(ytScript)
  }

  // Scroll depth — sections clés
  if ('IntersectionObserver' in window) {
    const scrollSections = [
      ['#quotidienne', 'section-quotidienne'],
      ['#presentation', 'section-probleme'],
      ['#solution', 'section-solution'],
      ['#demo', 'section-demo'],
      ['.testimonials-section', 'section-temoignage'],
      ['#tarifs', 'section-tarifs'],
      ['.pro-footer', 'section-footer'],
    ]
    const sectionMap = new Map()
    const scrollIo = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const name = sectionMap.get(entry.target)
          if (name && typeof umami !== 'undefined') umami.track(name)
          scrollIo.unobserve(entry.target)
        }
      },
      { threshold: 0.3 }
    )
    for (const [selector, name] of scrollSections) {
      const el = document.querySelector(selector)
      if (!el) continue
      sectionMap.set(el, name)
      scrollIo.observe(el)
    }
  }
})()