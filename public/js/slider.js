let slideIndex = 0;
const slides = document.querySelectorAll(".slide");

function showSlides() {
  // Hide all slides
  slides.forEach(slide => slide.classList.remove("active"));

  // Show current slide
  slides[slideIndex].classList.add("active");

  // Move to next slide
  slideIndex = (slideIndex + 1) % slides.length;
}

// Auto change slide every 3 seconds
setInterval(showSlides, 3000);

// Initialize first slide
document.addEventListener("DOMContentLoaded", () => {
  slides[slideIndex].classList.add("active");
});
