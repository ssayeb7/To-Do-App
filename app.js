if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(function(registration) {
        console.log('Service Worker registered with scope:', registration.scope);
  
        registration.onupdatefound = function() {
          const installingWorker = registration.installing;
          installingWorker.onstatechange = function() {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New update available
                const updateNotification = document.createElement('div');
                updateNotification.innerText = 'New update available. Please refresh the page.';
                updateNotification.style.position = 'fixed';
                updateNotification.style.bottom = '10px';
                updateNotification.style.left = '10px';
                updateNotification.style.backgroundColor = '#007aff';
                updateNotification.style.padding = '10px';
                document.body.appendChild(updateNotification);
              }
            }
          };
        };
      }).catch(function(error) {
        console.error('Service Worker registration failed:', error);
      });
  }
  
  function updateOnlineStatus() {
    const offlineStatus = document.getElementById('offline-status');
    const onlineStatus = document.getElementById('online-status');
    if (navigator.onLine) {
      offlineStatus.style.display = 'none';
      onlineStatus.style.display = 'block';
      setTimeout(() => {
        onlineStatus.style.display = 'none';
      }, 3000);
    } else {
      offlineStatus.style.display = 'block';
      onlineStatus.style.display = 'none';
    }
  }
  
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();
  
  // Delete button functionality
  const deleteButton = document.getElementById('delete-button');
  const deletePopup = document.getElementById('delete-popup');
  const confirmDelete = document.getElementById('confirm-delete');
  const cancelDelete = document.getElementById('cancel-delete');
  const successMessage = document.getElementById('success-message');
  
  deleteButton.addEventListener('click', () => {
    deletePopup.style.display = 'block';
  });
  
  cancelDelete.addEventListener('click', () => {
    deletePopup.style.display = 'none';
  });
  
  confirmDelete.addEventListener('click', () => {
    // Clear local storage
    localStorage.clear();
  
    // Clear caches
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          return caches.delete(cache);
        })
      );
    }).then(() => {
      // Optionally, unregister the service worker
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => {
            registration.unregister();
          });
        });
      }
      // Show success message and reload the page after a delay
      successMessage.style.display = 'block';
      setTimeout(() => {
        location.reload();
      }, 3000);
    }).catch(error => {
      console.error('Error clearing caches:', error);
    });
  });
  