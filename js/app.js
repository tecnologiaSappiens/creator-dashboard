// Main Application Logic
class DashboardApp {
    constructor() {
        this.api = new DashboardAPI();
        this.currentReport = 'general';
        this.charts = {}; // Store chart instances
    }

    // Initialize the dashboard
    async init() {
        try {
            // Show loading state
            this.showLoading();

            // Fetch data for both reports from static files
            console.log('📊 Initializing dashboard...');
            const generalData = await this.api.fetchAllData('general');
            const blomeData = await this.api.fetchAllData('blome');

            // Store data
            this.generalData = generalData;
            this.blomeData = blomeData;

            // Get last update time
            const lastUpdate = await this.api.getLastUpdate();
            if (lastUpdate) {
                console.log(`📅 Data last updated: ${new Date(lastUpdate).toLocaleString('pt-BR')}`);
            }

            // Render initial report
            this.renderReport('general');

            // Hide loading state
            this.hideLoading();

            console.log('✅ Dashboard loaded successfully!');
        } catch (error) {
            console.error('❌ Error loading dashboard:', error);
            this.hideLoading();
            this.showError('Falha ao carregar os dados do dashboard. Por favor, tente novamente mais tarde.');
        }
    }

    // Show loading indicator
    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('hidden');
        }
    }

    // Hide loading indicator
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }

    // Show error message
    showError(message) {
        alert(message);
    }

    // Switch between reports
    switchReport(reportType) {
        this.currentReport = reportType;
        this.renderReport(reportType);
    }

    // Render a specific report
    renderReport(reportType) {
        const data = reportType === 'general' ? this.generalData : this.blomeData;
        
        if (!data) {
            console.error('No data available for report:', reportType);
            return;
        }

        // Update all sections
        this.updateBigNumbers(data.bigNumbers, reportType);
        this.updateUserTable(data.userMetrics, reportType);
        this.updateTopUsersTable(data.userRankings, reportType);
        this.updateCharts(data, reportType);
    }

    // Update big number cards
    updateBigNumbers(bigNumbers, reportType) {
        const suffix = reportType === 'general' ? 'general' : 'blome';
        const totalFlashcards = reportType === 'general' ? 611 : 65;

        // Update main stat numbers
        const totalUsers = document.getElementById(`total-users-${suffix}`);
        const activeUsers = document.getElementById(`active-users-${suffix}`);
        const inactiveUsers = document.getElementById(`inactive-users-${suffix}`);
        const totalFlashcardsEl = document.getElementById(`total-flashcards-${suffix}`);

        if (totalUsers) totalUsers.textContent = bigNumbers.totalUsersWithAccess || 0;
        if (activeUsers) activeUsers.textContent = bigNumbers.totalActiveUsers || 0;
        if (inactiveUsers) inactiveUsers.textContent = (bigNumbers.totalUsersWithAccess - bigNumbers.totalActiveUsers) || 0;
        if (totalFlashcardsEl) totalFlashcardsEl.textContent = totalFlashcards;

        // Update activation rate
        const activationRate = bigNumbers.activationRatePercentage || 0;
        const progressFill = document.getElementById(`activation-rate-${suffix}`);
        const activationText = document.getElementById(`activation-text-${suffix}`);
        
        if (progressFill) {
            progressFill.style.width = `${Math.max(activationRate, 10)}%`;
            progressFill.textContent = `${activationRate.toFixed(2)}%`;
        }
        if (activationText) {
            activationText.innerHTML = `<strong>${bigNumbers.totalActiveUsers} de ${bigNumbers.totalUsersWithAccess} usuários</strong> estão ativamente utilizando ${reportType === 'general' ? 'a plataforma' : 'o módulo Bloomé'}.`;
        }

        // Update engagement stats
        const totalStudied = document.getElementById(`total-studied-${suffix}`);
        const accuracyRate = document.getElementById(`accuracy-rate-${suffix}`);
        
        // Calculate total flashcards studied (sum from user metrics)
        const totalStudiedCount = this.calculateTotalStudied(reportType);
        
        if (totalStudied) totalStudied.textContent = totalStudiedCount;
        if (accuracyRate) accuracyRate.textContent = `${(bigNumbers.globalAccuracyRatePercentage || 0).toFixed(2)}%`;

        // Update completion rate
        const completionRate = bigNumbers.globalCompletionRatePercentage || 0;
        const completionFill = document.getElementById(`completion-rate-${suffix}`);
        const completionText = document.getElementById(`completion-text-${suffix}`);
        
        if (completionFill) {
            completionFill.style.width = `${Math.max(completionRate, 10)}%`;
            completionFill.textContent = `${completionRate.toFixed(2)}%`;
        }
        if (completionText) {
            const avgPerUser = bigNumbers.totalActiveUsers > 0 
                ? totalStudiedCount / bigNumbers.totalActiveUsers 
                : 0;
            completionText.innerHTML = `<strong>Média de ${avgPerUser.toFixed(2)} flashcards por usuário ativo</strong> (${completionRate.toFixed(2)}% do ${reportType === 'general' ? 'produto' : 'módulo'} de ${totalFlashcards} flashcards)`;
        }

        // Update dates
        const currentDate = new Date().toLocaleDateString('pt-BR', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
        const reportDate = document.getElementById(`report-date-${suffix}`);
        const footerDate = document.getElementById(`footer-date-${suffix}`);
        
        if (reportDate) reportDate.textContent = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        if (footerDate) footerDate.textContent = `Data: ${currentDate}`;
    }

    // Calculate total flashcards studied from user metrics
    calculateTotalStudied(reportType) {
        const data = reportType === 'general' ? this.generalData : this.blomeData;
        if (!data || !data.userMetrics) return 0;
        
        return data.userMetrics.reduce((sum, user) => sum + (user.totalFlashcardsStudied || 0), 0);
    }

    // Update user table
    updateUserTable(userMetrics, reportType) {
        const tableBodyId = reportType === 'general' ? 'userTableBody1' : 'userTableBody2';
        const tableBody = document.getElementById(tableBodyId);

        if (!tableBody || !userMetrics) return;

        const totalFlashcards = reportType === 'general' ? 611 : 65;
        
        // Clear existing rows
        tableBody.innerHTML = '';

        // Add new rows
        userMetrics.forEach(user => {
            const percentage = ((user.totalFlashcardsStudied / totalFlashcards) * 100).toFixed(2);
            const badge = user.isActive ? 
                `<span class="active-badge">Ativo</span>` : 
                `<span class="inactive-badge">Inativo</span>`;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.accountName}</td>
                <td>${badge}</td>
                <td>${user.totalFlashcardsStudied}</td>
                <td>${percentage}%</td>
                <td>${user.accuracyRatePercentage.toFixed(2)}%</td>
                <td>${reportType === 'general' ? user.currentStreakDays : user.studyDaysCount} dia${(reportType === 'general' ? user.currentStreakDays : user.studyDaysCount) !== 1 ? 's' : ''}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Update top users table
    updateTopUsersTable(rankings, reportType) {
        if (!rankings || !rankings.topAccuracy) return;

        const tableBodyId = reportType === 'general' ? 'topUsersTableBody1' : 'topUsersTableBody2';
        const tableBody = document.getElementById(tableBodyId);
        const totalFlashcards = reportType === 'general' ? 611 : 65;

        if (!tableBody) return;

        // Clear existing rows
        tableBody.innerHTML = '';

        // Get data for the report
        const data = reportType === 'general' ? this.generalData : this.blomeData;
        if (!data || !data.userMetrics) return;

        // Sort users by flashcards studied
        const topUsers = [...data.userMetrics]
            .filter(u => u.isActive && u.totalFlashcardsStudied > 0)
            .sort((a, b) => b.totalFlashcardsStudied - a.totalFlashcardsStudied)
            .slice(0, 5);

        // Add rows
        topUsers.forEach((user, index) => {
            const medals = ['🥇', '🥈', '🥉', '', ''];  // Empty strings for 4th and 5th
            const percentage = ((user.totalFlashcardsStudied / totalFlashcards) * 100).toFixed(2);
            const streakValue = reportType === 'general' ? user.currentStreakDays : user.studyDaysCount;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${medals[index]} ${index + 1}º</td>
                <td>${user.accountName}</td>
                <td>${user.totalFlashcardsStudied}</td>
                <td><strong>${percentage}%</strong></td>
                <td>${user.accuracyRatePercentage.toFixed(2)}%</td>
                <td>${streakValue} dia${streakValue !== 1 ? 's' : ''}</td>
    `;
            tableBody.appendChild(row);
        });
    }

    // Update charts
    updateCharts(data, reportType) {
        const chartPrefix = reportType === 'general' ? '1' : '2';
        
        // Update engagement chart (active vs inactive)
        this.updateEngagementChart(data.bigNumbers, `engagementChart${chartPrefix}`);
        
        // Update top users chart
        this.updateTopUsersChart(data.userMetrics, `topUsersChart${chartPrefix}`, reportType);
        
        // Update accuracy chart
        this.updateAccuracyChart(data.userMetrics, `accuracyChart${chartPrefix}`);
    }

    // Update engagement donut chart
    updateEngagementChart(bigNumbers, chartId) {
        const ctx = document.getElementById(chartId);
        if (!ctx) return;

        // Destroy existing chart if it exists
        if (this.charts[chartId]) {
            this.charts[chartId].destroy();
        }

        // Create new chart
        this.charts[chartId] = new Chart(ctx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Usuários Ativos', 'Usuários Inativos'],
                datasets: [{
                    data: [
                        bigNumbers.totalActiveUsers,
                        bigNumbers.totalUsersWithAccess - bigNumbers.totalActiveUsers
                    ],
                    backgroundColor: ['#4CAF50', '#FF5252'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {font: {size: 14, family: 'Outfit'}, padding: 20}
                    },
                    title: {
                        display: true,
                        text: 'Distribuição de Usuários Ativos vs Inativos',
                        font: {size: 18, family: 'Outfit', weight: '600'},
                        padding: 20
                    }
                }
            }
        });
    }

    // Update top users bar chart
    updateTopUsersChart(userMetrics, chartId, reportType) {
        const ctx = document.getElementById(chartId);
        if (!ctx || !userMetrics) return;

        // Destroy existing chart
        if (this.charts[chartId]) {
            this.charts[chartId].destroy();
        }

        // Get top 5 users by flashcards studied
        const topUsers = [...userMetrics]
            .filter(u => u.isActive && u.totalFlashcardsStudied > 0)
            .sort((a, b) => b.totalFlashcardsStudied - a.totalFlashcardsStudied)
            .slice(0, 5);

        // Create new chart
        this.charts[chartId] = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: topUsers.map(u => u.accountName.split(' ')[0]),
                datasets: [{
                    label: 'Flashcards Estudados',
                    data: topUsers.map(u => u.totalFlashcardsStudied),
                    backgroundColor: '#6001AE',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {display: false},
                    title: {
                        display: true,
                        text: 'Top 5 Usuários por Flashcards Estudados',
                        font: {size: 18, family: 'Outfit', weight: '600'},
                        padding: 20
                    }
                },
                scales: {
                    y: {beginAtZero: true, ticks: {font: {family: 'Outfit'}}},
                    x: {ticks: {font: {family: 'Outfit'}}}
                }
            }
        });
    }

    // Update accuracy distribution chart
    updateAccuracyChart(userMetrics, chartId) {
        const ctx = document.getElementById(chartId);
        if (!ctx || !userMetrics) return;

        // Destroy existing chart
        if (this.charts[chartId]) {
            this.charts[chartId].destroy();
        }

        // Filter active users with accuracy > 0
        const activeUsers = userMetrics.filter(u => u.isActive && u.accuracyRatePercentage > 0);

        // Create new chart
        this.charts[chartId] = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: activeUsers.map(u => u.accountName.split(' ')[0]),
                datasets: [{
                    label: 'Taxa de Acerto (%)',
                    data: activeUsers.map(u => u.accuracyRatePercentage),
                    backgroundColor: '#8B3FD9',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {display: false},
                    title: {
                        display: true,
                        text: 'Taxa de Acerto por Usuário Ativo',
                        font: {size: 18, family: 'Outfit', weight: '600'},
                        padding: 20
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) { return value + '%'; },
                            font: {family: 'Outfit'}
                        }
                    },
                    x: {ticks: {font: {family: 'Outfit'}}}
                }
            }
        });
    }
}

// Initialize app when page loads
window.addEventListener('DOMContentLoaded', () => {
    window.dashboardApp = new DashboardApp();
    window.dashboardApp.init();
});