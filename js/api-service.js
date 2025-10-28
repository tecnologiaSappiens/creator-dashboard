// API Service - Loads data from static JSON files (no authentication needed!)
class DashboardAPI {
    constructor() {
        this.dataPath = 'data/';
    }

    // Main function to fetch all dashboard data from static files
    async fetchAllData(reportType) {
        try {
            // Determine which set of files to load based on report type
            const prefix = reportType === 'general' ? 'general' : 'blome';
            
            console.log(`📡 Loading ${reportType} report data from static files...`);
            
            const [
                bigNumbers,
                userMetrics,
                productMetrics,
                userRankings,
                streakUsers
            ] = await Promise.all([
                this.loadJSON(`${prefix}-big-numbers.json`),
                this.loadJSON(`${prefix}-user-metrics.json`),
                this.loadJSON(`${prefix}-product-metrics.json`),
                this.loadJSON(`${prefix}-user-rankings.json`),
                this.loadJSON(`${prefix}-streak-users.json`)
            ]);

            console.log(`✅ Successfully loaded ${reportType} report data!`);

            return {
                bigNumbers,
                userMetrics,
                productMetrics,
                userRankings,
                streakUsers,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error(`❌ Error loading ${reportType} dashboard data:`, error);
            throw error;
        }
    }

    // Load a JSON file
    async loadJSON(filename) {
        const url = `${this.dataPath}${filename}`;
        
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`❌ Failed to load ${filename}:`, error.message);
            
            // Return empty/default data structure to prevent crashes
            return this.getDefaultData(filename);
        }
    }

    // Get default/empty data structure if file fails to load
    getDefaultData(filename) {
        if (filename.includes('big-numbers')) {
            return {
                totalUsersWithAccess: 0,
                totalActiveUsers: 0,
                activationRatePercentage: 0,
                globalCompletionRatePercentage: 0,
                globalAccuracyRatePercentage: 0,
                averageActiveStreakDays: 0
            };
        }
        
        if (filename.includes('user-metrics')) {
            return [];
        }
        
        if (filename.includes('user-rankings')) {
            return {
                topAccuracy: [],
                topError: []
            };
        }
        
        if (filename.includes('streak-users')) {
            return [];
        }
        
        if (filename.includes('product-metrics')) {
            return [];
        }
        
        return {};
    }

    // Get last update timestamp
    async getLastUpdate() {
        try {
            const metadata = await this.loadJSON('metadata.json');
            return metadata.lastUpdated;
        } catch (error) {
            return null;
        }
    }
}

// Export for use in other files
window.DashboardAPI = DashboardAPI;