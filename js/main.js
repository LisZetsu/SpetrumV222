// Точка входа — запускает всё после загрузки страницы

window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('preloader').classList.add('hidden');
  }, 800);
});

lucide.createIcons();
loadGlobalSettings();
checkUserState();
loadPublicBiographies();
loadNews();
loadCommunityPlayers();
if (typeof loadDonateSettings === 'function') loadDonateSettings();
if (typeof loadDonations === 'function') loadDonations();
if (typeof loadGallery === 'function') loadGallery();
