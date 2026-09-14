'use client'

import { useEffect } from 'react'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Story from '@/components/Story'
import Facilities from '@/components/Facilities'
import PoolHouse from '@/components/PoolHouse'
import Queue from '@/components/Queue'
import CTA from '@/components/CTA'
import Footer from '@/components/Footer'

export default function Page() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('[data-reveal]')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' })
    elements.forEach((element) => observer.observe(element))

    const parallaxElements = document.querySelectorAll<HTMLElement>('[data-parallax]')
    const parallaxCenters = new WeakMap<HTMLElement, number>()
    const measureParallax = () => {
      parallaxElements.forEach((element) => {
        const rect = element.getBoundingClientRect()
        parallaxCenters.set(element, rect.top + rect.height / 2 + window.scrollY)
      })
    }

    let ticking = false
    const updateScrollMotion = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const scrollY = window.scrollY
        const viewCenter = window.innerHeight / 2
        parallaxElements.forEach((element) => {
          const center = parallaxCenters.get(element) ?? viewCenter
          const distance = (viewCenter - (center - scrollY)) * 0.08
          element.style.setProperty('--parallax-y', `${distance}px`)
        })
        ticking = false
      })
    }
    measureParallax()
    updateScrollMotion()
    window.addEventListener('scroll', updateScrollMotion, { passive: true })
    window.addEventListener('resize', measureParallax)
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', updateScrollMotion)
      window.removeEventListener('resize', measureParallax)
    }
  }, [])

  return (
    <main className="min-h-screen overflow-hidden bg-[#FDFBF7] pt-[72px] text-[#222222]">
      <Header />
      <Hero />
      <Story />
      <Facilities />
      <PoolHouse />
      <Queue />
      <CTA />
      <Footer />
    </main>
  )
}