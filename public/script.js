document.addEventListener('DOMContentLoaded', () => {
    const statusGrid = document.getElementById('status-grid');
    const lastUpdatedTime = document.getElementById('last-updated-time');
    const currentYear = document.getElementById('current-year');

    currentYear.textContent = new Date().getFullYear();

    async function fetchUptimeStatus() {
        try {
            // Mengambil status.json dari root repositori (GitHub Pages/Cloudflare Pages)
            // Tambahkan timestamp untuk menghindari cache browser
            const response = await fetch('/status.json?t=' + new Date().getTime());
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            statusGrid.innerHTML = ''; // Clear loading state or previous cards

            if (data.length === 0) {
                statusGrid.innerHTML = '<p class="loading-state">No server status data available yet. Please wait for the first check.</p>';
                return;
            }

            data.forEach(server => {
                const card = document.createElement('div');
                card.className = `status-card`;

                let statusClass = '';
                let statusIcon = '';
                let statusTextDisplay = '';

                if (server.status === 'UP') {
                    statusClass = 'up';
                    statusIcon = '✅';
                    statusTextDisplay = 'Online';
                } else if (server.status === 'DOWN') {
                    statusClass = 'down';
                    statusIcon = '❌';
                    statusTextDisplay = 'Offline';
                } else { // Fallback, though GitHub Actions should provide UP/DOWN
                    statusClass = 'checking';
                    statusIcon = '⏳';
                    statusTextDisplay = 'Checking...';
                }

                card.innerHTML = `
                    <h2>${server.name}</h2>
                    <div class="status-indicator ${statusClass}">${statusIcon}</div>
                    <span class="status-text ${statusClass}">${statusTextDisplay}</span>
                    <div class="details">
                        <p>URL/IP: <strong>${server.url}</strong></p>
                        <p>Latency: <strong>${server.latency}</strong></p>
                    </div>
                `;
                statusGrid.appendChild(card);
            });

            // Update last updated timestamp
            if (data[0] && data[0].timestamp) {
                const date = new Date(data[0].timestamp);
                lastUpdatedTime.textContent = date.toLocaleString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric',
                    hour: '2-digit', minute: '2-digit', second: '2-digit',
                    timeZoneName: 'short'
                });
            } else {
                lastUpdatedTime.textContent = 'N/A';
            }

        } catch (error) {
            console.error("Failed to fetch server status:", error);
            statusGrid.innerHTML = `<div class="loading-state" style="color: var(--status-down);">
                                        ❌ Failed to load status. Please check console for errors.
                                    </div>`;
        }
    }

    // Fetch status initially
    fetchUptimeStatus();
    // Refresh status every 30 seconds
    setInterval(fetchUptimeStatus, 30000);
});
