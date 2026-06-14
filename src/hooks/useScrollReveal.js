import { useEffect } from 'react';

export const useScrollReveal = (ref, options = {}) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const { stagger = false, className = 'visible' } = options;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(className);
          
          if (stagger) {
            const children = Array.from(entry.target.children);
            children.forEach((child, index) => {
              child.style.transitionDelay = `${index * 0.1}s`;
              child.classList.add(className);
            });
          }
          
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    observer.observe(element);
    
    return () => observer.disconnect();
  }, [ref, options]);
};