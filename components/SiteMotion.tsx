'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
export function SiteMotion() {
  const path = usePathname();
  useEffect(() => {
    if (path.startsWith('/admin')) return;
    let disposed = false;
    let cleanup = () => {};
    void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{gsap}, {ScrollTrigger}]) => {
      if (disposed) return;
      gsap.registerPlugin(ScrollTrigger);
      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const root = document.querySelector('main');
        if (!root) return;
        const timeline = gsap.timeline({defaults:{duration:0.7, ease:'power2.out'}});
        if (root.querySelector('.hero')) {
          timeline.from('.hero .eyebrow',{opacity:0,y:10})
            .from('.title-line > span',{yPercent:105, stagger:0.1},0.1)
            .from('.hero-word',{opacity:0,stagger:0.07,duration:0.45},0.2)
            .from('.hero-title-end',{opacity:0,y:12},0.3)
            .from('.hero-image-mask',{clipPath:'inset(0 0 100% 0)',duration:1.1},0.1)
            .from('.hero-copy > p:not(.eyebrow), .art-label, .image-index',{opacity:0,y:12,stagger:0.07},0.45)
            .from('.hero .actions > *',{opacity:0,y:12,stagger:0.08},0.75);
        }
        root.querySelectorAll('.reveal, .page-intro').forEach(element => {
          gsap.from(element,{opacity:0,y:20,duration:0.75,scrollTrigger:{trigger:element,start:'top 94%',once:true}});
        });
        const seen = new Set<string>();
        const context = gsap.context(() => {},root);
        const animateCards = () => context.add(() => {
          const cards = Array.from(root.querySelectorAll('.product-card')).filter(card => {
            const key = card.querySelector('a')?.getAttribute('href') || '';
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          if (cards.length) ScrollTrigger.batch(cards,{start:'top 98%',once:true,onEnter: batch => {
            context.add(() => { gsap.from(batch,{opacity:0,y:16,stagger:0.055,duration:0.55,clearProps:'all'}); });
          }});
        });
        animateCards();
        const observer = new MutationObserver(animateCards);
        observer.observe(root,{childList:true,subtree:true});
        return () => { observer.disconnect(); context.revert(); };
      });
      media.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        document.querySelectorAll('.institutional-image img').forEach(image => {
          gsap.fromTo(image,{y:-8},{y:8,ease:'none',scrollTrigger:{trigger:image,start:'top bottom',end:'bottom top',scrub:1}});
        });
      });
      cleanup = () => media.revert();
    }).catch(() => { /* Content remains visible if motion cannot load. */ });
    return () => { disposed=true; cleanup(); };
  },[path]);
  return null;
}
