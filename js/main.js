// Точка входа
window.addEventListener('load', () => {
  setTimeout(() => {
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.classList.add('hidden');
  }, 800);

  if (typeof lucide !== 'undefined') lucide.createIcons();
  
  if (typeof loadGlobalSettings === 'function') loadGlobalSettings();
  if (typeof checkUserState === 'function') checkUserState();
  if (typeof loadPublicBiographies === 'function') loadPublicBiographies();
  if (typeof loadNews === 'function') loadNews();
  if (typeof loadCommunityPlayers === 'function') loadCommunityPlayers();
  
  if (typeof loadDonateSettings === 'function') loadDonateSettings();
  if (typeof loadDonations === 'function') loadDonations();
  if (typeof loadGallery === 'function') loadGallery();
});
