// Set launch date (36 hours from now)
const launchDate = new Date();
launchDate.setHours(launchDate.getHours() + 36);

// Current active theme
let currentTheme = 1;
const totalThemes = 2;

// Auto-rotate themes every 10 seconds
const themeRotationInterval = 10000; // 10 seconds

// Update countdown for all themes
function updateCountdown() {
  const now = new Date().getTime();
  const distance = launchDate.getTime() - now;

  // Calculate time units
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  // Format numbers with leading zeros
  const formatNumber = (num) => num.toString().padStart(2, '0');

  // Update Theme 1 (Flip Counter)
  updateFlipCounter('days-1', formatNumber(days));
  updateFlipCounter('hours-1', formatNumber(hours));
  updateFlipCounter('minutes-1', formatNumber(minutes));
  updateFlipCounter('seconds-1', formatNumber(seconds));

  // Update Theme 2 (Terminal)
  updateElement('days-2', formatNumber(days));
  updateElement('hours-2', formatNumber(hours));
  updateElement('minutes-2', formatNumber(minutes));
  updateElement('seconds-2', formatNumber(seconds));

  // Check if countdown is finished
  if (distance < 0) {
    clearInterval(countdownInterval);
    document.querySelectorAll('.countdown').forEach(el => {
      el.innerHTML = '<h1 style="color: inherit; font-size: 3rem;">🎉 We\'re Live! 🎉</h1>';
    });
  }
}

// Update flip counter with animation
function updateFlipCounter(id, newValue) {
  const element = document.getElementById(id);
  const backElement = document.getElementById(id + '-back');
  
  if (element && element.textContent !== newValue) {
    if (backElement) {
      backElement.textContent = newValue;
    }
    
    const card = element.closest('.flip-card-inner');
    if (card) {
      card.style.transform = 'rotateX(180deg)';
      setTimeout(() => {
        element.textContent = newValue;
        card.style.transform = 'rotateX(0deg)';
      }, 300);
    } else {
      element.textContent = newValue;
    }
  }
}

// Update regular element
function updateElement(id, value) {
  const element = document.getElementById(id);
  if (element && element.textContent !== value) {
    element.textContent = value;
  }
}

// Change theme with smooth transition
function changeTheme(nextTheme) {
  const currentThemeEl = document.querySelector('.theme-container.active');
  const nextThemeEl = document.querySelector(`.theme-${nextTheme}`);
  
  if (currentThemeEl && nextThemeEl) {
    // Fade out current theme
    currentThemeEl.classList.add('fade-out');
    
    setTimeout(() => {
      currentThemeEl.classList.remove('active', 'fade-out');
      nextThemeEl.classList.add('active');
      currentTheme = nextTheme;
    }, 800);
  }
}

// Auto-rotate themes
function autoRotateThemes() {
  let nextTheme = currentTheme + 1;
  if (nextTheme > totalThemes) {
    nextTheme = 1;
  }
  changeTheme(nextTheme);
}

// Handle form submissions with database
function setupForms() {
  const forms = document.querySelectorAll('.notify-form');
  forms.forEach(form => {
    const button = form.querySelector('button');
    const input = form.querySelector('input[type="email"]');
    
    if (button && input) {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        const email = input.value.trim();
        
        if (email && validateEmail(email)) {
          // Disable button during submission
          button.disabled = true;
          button.textContent = 'Subscribing...';
          
          // Send to backend
          try {
            const response = await fetch('/api/subscribe', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            
            if (data.success) {
              showNotification(data.message, 'success');
              input.value = '';
              // Update subscriber count if displayed
              updateSubscriberCount();
            } else {
              showNotification(data.message, 'error');
            }
          } catch (error) {
            console.error('Subscription error:', error);
            showNotification('Network error. Please try again later.', 'error');
          } finally {
            // Re-enable button
            button.disabled = false;
            button.textContent = getButtonText(button);
          }
        } else {
          showNotification('Please enter a valid email address.', 'error');
        }
      });
      
      // Submit on Enter key
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          button.click();
        }
      });
    }
  });
}

// Get original button text
function getButtonText(button) {
  const buttonTexts = ['NOTIFY ME', 'GET NOTIFIED', 'Subscribe', 'Notify Me', '[SUBSCRIBE]'];
  for (let text of buttonTexts) {
    if (button.classList.contains(text.toLowerCase().replace(/\s/g, '-'))) {
      return text;
    }
  }
  // Return based on theme
  if (button.classList.contains('notify-btn')) return 'NOTIFY ME';
  if (button.classList.contains('neon-btn')) return 'GET NOTIFIED';
  if (button.classList.contains('gradient-btn')) return 'Subscribe';
  if (button.classList.contains('glass-btn')) return 'Notify Me';
  if (button.classList.contains('terminal-btn')) return '[SUBSCRIBE]';
  return 'NOTIFY ME';
}

// Update subscriber count
async function updateSubscriberCount() {
  try {
    const response = await fetch('/api/subscribers/count');
    const data = await response.json();
    
    if (data.success) {
      // You can display this count somewhere on the page if needed
      console.log(`Total subscribers: ${data.count}`);
    }
  } catch (error) {
    console.error('Error fetching subscriber count:', error);
  }
}

// Email validation
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Show notification
function showNotification(message, type = 'success') {
  // Remove existing notification
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 30px;
    left: 50%;
    transform: translateX(-50%) translateY(-100px);
    background: ${type === 'success' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)'};
    color: white;
    padding: 20px 40px;
    border-radius: 50px;
    font-size: 1rem;
    font-weight: 600;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    animation: slideDown 0.5s ease forwards;
  `;
  
  document.body.appendChild(notification);
  
  // Add slide animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideDown {
      to { transform: translateX(-50%) translateY(0); }
    }
    @keyframes slideUp {
      from { transform: translateX(-50%) translateY(0); opacity: 1; }
      to { transform: translateX(-50%) translateY(-100px); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
  
  // Remove notification after 4 seconds
  setTimeout(() => {
    notification.style.animation = 'slideUp 0.5s ease forwards';
    setTimeout(() => notification.remove(), 500);
  }, 4000);
}

// Create animated particles for theme 4
function createParticles() {
  const particlesContainer = document.getElementById('particles-js');
  if (particlesContainer) {
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 4 + 2}px;
        height: ${Math.random() * 4 + 2}px;
        background: rgba(255, 255, 255, ${Math.random() * 0.5 + 0.3});
        border-radius: 50%;
        top: ${Math.random() * 100}%;
        left: ${Math.random() * 100}%;
        animation: particleFloat ${Math.random() * 10 + 10}s linear infinite;
        animation-delay: ${Math.random() * 5}s;
      `;
      particlesContainer.appendChild(particle);
    }
  }
}

// Video Introduction Handling with Sequential Playback
function setupVideoIntro() {
  const videoOverlay = document.getElementById('videoOverlay');
  const introVideo = document.getElementById('introVideo');
  const skipBtn = document.getElementById('skipBtn');
  const enterBtn = document.getElementById('enterBtn');
  const videoFallback = document.querySelector('.video-fallback');
  
  let currentVideoIndex = 0;
  const videoSources = [
    'Something Big is Coming Soon..mp4'
  ];
  
  // Don't check session storage - always show video on refresh
  // if (sessionStorage.getItem('videoWatched') === 'true') {
  //   hideVideoOverlay();
  //   return;
  // }
  
  // Function to play next video
  function playNextVideo() {
    if (currentVideoIndex < videoSources.length) {
      introVideo.src = videoSources[currentVideoIndex];
      introVideo.load();
      
      // Add a small delay to ensure video is loaded
      setTimeout(() => {
        const playPromise = introVideo.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            console.log('Video playing successfully');
          }).catch(error => {
            console.log('Autoplay prevented for video ' + (currentVideoIndex + 1), error);
            // Try with muted
            introVideo.muted = true;
            introVideo.play().catch(err => {
              console.log('Still failed, trying next or showing fallback');
              currentVideoIndex++;
              if (currentVideoIndex < videoSources.length) {
                playNextVideo();
              } else {
                showFallback();
              }
            });
          });
        }
      }, 100);
    } else {
      // All videos played
      finishVideoSequence();
    }
  }
  
  // Show fallback animation
  function showFallback() {
    introVideo.style.display = 'none';
    videoFallback.classList.add('show');
  }
  
  // Finish video sequence
  function finishVideoSequence() {
    // Don't save to session storage so video plays on every refresh
    // sessionStorage.setItem('videoWatched', 'true');
    hideVideoOverlay();
  }
  
  // Handle video end - play next video
  introVideo.addEventListener('ended', () => {
    currentVideoIndex++;
    if (currentVideoIndex < videoSources.length) {
      // Play next video
      playNextVideo();
    } else {
      // All videos finished
      finishVideoSequence();
    }
  });
  
  // Handle video load error
  introVideo.addEventListener('error', () => {
    console.log('Video ' + (currentVideoIndex + 1) + ' failed to load');
    currentVideoIndex++;
    if (currentVideoIndex < videoSources.length) {
      // Try next video
      playNextVideo();
    } else {
      // No more videos, show fallback
      showFallback();
    }
  });
  
  // Skip button handler - skip all videos
  skipBtn.addEventListener('click', () => {
    finishVideoSequence();
  });
  
  // Enter button handler (for fallback)
  if (enterBtn) {
    enterBtn.addEventListener('click', () => {
      finishVideoSequence();
    });
  }
  
  // Start playing first video
  playNextVideo();
}

function hideVideoOverlay() {
  const videoOverlay = document.getElementById('videoOverlay');
  videoOverlay.classList.add('hidden');
  
  // Remove overlay from DOM after animation
  setTimeout(() => {
    if (videoOverlay && videoOverlay.parentNode) {
      videoOverlay.style.display = 'none';
    }
  }, 1000);
}

// Initialize everything
function init() {
  // Setup video intro first
  setupVideoIntro();
  
  // Setup countdown
  updateCountdown();
  const countdownInterval = setInterval(updateCountdown, 1000);
  
  // Setup forms
  setupForms();
  
  // Create particles
  createParticles();
  
  // Start auto-rotation
  themeRotationTimer = setInterval(autoRotateThemes, themeRotationInterval);
  
  // Add keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      let nextTheme = currentTheme + 1;
      if (nextTheme > totalThemes) nextTheme = 1;
      changeTheme(nextTheme);
    } else if (e.key === 'ArrowLeft') {
      let prevTheme = currentTheme - 1;
      if (prevTheme < 1) prevTheme = totalThemes;
      changeTheme(prevTheme);
    }
  });
  
  // Prevent theme rotation when user interacts
  let userInteractionTimeout;
  document.addEventListener('mousemove', () => {
    clearTimeout(userInteractionTimeout);
    userInteractionTimeout = setTimeout(() => {
      // Resume auto-rotation after 3 seconds of inactivity
    }, 3000);
  });
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Global timer variable
let countdownInterval;
let themeRotationTimer;