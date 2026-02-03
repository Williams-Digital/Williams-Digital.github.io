// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Close mobile nav on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// Menu tabs
const tabs = document.querySelectorAll('.menu-tab');
const items = document.querySelectorAll('.menu-item');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const category = tab.dataset.tab;
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    items.forEach(item => {
      item.style.display = item.dataset.category === category ? '' : 'none';
    });
  });
});

// Scroll fade-in
const observerOptions = { threshold: 0.15 };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.section').forEach(section => {
  section.classList.add('fade-up');
  observer.observe(section);
});
