/**
 * Test script for RPC Health Check functionality
 *
 * This script can be run independently to test the health check features
 * without needing to integrate with the React application.
 */
import {
    getBlacklistRpcs,
    getHealthCheckResults,
    getWhitelistRpcs,
    healthCheckRpcs,
    testGasEstimation,
} from './rpc-health-check';

// Sepolia testnet RPCs (11155111)
const testRpcs = [
    // More reliable RPCs (based on test results)
    'https://ethereum-sepolia-rpc.publicnode.com',
    'https://ethereum-sepolia.publicnode.com',
    'https://sepolia.gateway.tenderly.co',
    'https://rpc.sepolia.org',
    'https://ethereum-sepolia.blockpi.network/v1/rpc/public',

    // RPCs with access issues (may need API keys or have rate limits)
    'https://eth-sepolia.g.alchemy.com/v2/mf7LavWgl6idryZtb9IJadAr0jf8KETr',
    'https://api.zan.top/node/v1/eth/sepolia/public',

    // RPCs with DNS issues (may be temporarily down)
    'https://rpc.notadegen.com/eth/sepolia',
    'https://rpc.notadegen.com/sepolia',
];

// Test transactions
const testTransactions = [
    // {
    //     to: '0xc87baaa752642beb24e3b86b624dc8a5115e321b',
    //     value: '0x0',
    //     data: '0x095ea7b3000000000000000000000000da9c889a49c55e8fc9479eff4aa12f5a06d0f7140000000000000000000000000000000000000000000000000de0b6b3a7640000',
    //     from: '0x219360A9aD9069eD9667ad888D61C832e701031F',
    // },
    {
        to: '0x2a268b7a47bb06a02a757d443bdbd565f0ef4630',
        value: '0x0',
        data: '0x589464350000000000000000000000000000000000000000000000000000000000000020a75ff20c77be62aaabe79edb3a1607d9a0ca1191006384f0c749afb4a18df60700000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000120000000000000000000000000c87baaa752642beb24e3b86b624dc8a5115e321b0000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000006699b5bb0fad74965ad0b6df1999310cd7ac7434000000000000000000000000000000000000000000000000000dd99c9f327c10000000000000000000000000000000000000000000000000000000000000697873000000000000000000000000219360a9ad9069ed9667ad888d61c832e701031f00000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000000a6c6f636b5f6f7264657200000000000000000000000000000000000000000000',
        from: '0x219360A9aD9069eD9667ad888D61C832e701031F',
    },
];

let flag = false;

/**
 * Run comprehensive health check test
 */
async function runHealthCheckTest() {
    if (flag) return;
    flag = true;

    console.log('🚀 Starting RPC Health Check Test...');
    console.log(`📊 Testing ${testRpcs.length} RPCs`);

    try {
        // Step 1: Basic health check
        // console.log('\n📋 Step 1: Basic Health Check');
        // const healthResults = await healthCheckRpcs(testRpcs);

        // console.log('✅ Health check completed');
        // console.log(`📈 Results: ${healthResults.size} RPCs tested`);

        // Step 2: Gas estimation test
        console.log('\n⛽ Step 2: Gas Estimation Test');
        await testGasEstimation(testRpcs, testTransactions, 'Comprehensive Gas Test');

        // Step 3: Show detailed results
        console.log('\n📊 Step 3: Detailed Results');
        const finalResults = getHealthCheckResults();
        const whitelist = getWhitelistRpcs();
        const blacklist = getBlacklistRpcs();

        console.log('\n🎯 Final Results:');
        console.log(`✅ Whitelist (${whitelist.length}):`, whitelist);
        console.log(`❌ Blacklist (${blacklist.length}):`, blacklist);

        console.log('\n📋 Detailed RPC Analysis:');
        Array.from(finalResults.entries()).forEach(([rpc, result]) => {
            const status = result.isHealthy ? '✅' : '❌';
            const category = result.category === 'whitelist' ? '🟢' : result.category === 'blacklist' ? '🔴' : '🟡';
            console.log(`${status} ${category} ${rpc}`);
            console.log(`   Success Rate: ${(result.successRate * 100).toFixed(1)}%`);
            console.log(`   Response Time: ${result.responseTime}ms`);
            console.log(`   Last Error: ${result.lastError || 'None'}`);
            console.log('');
        });

        // Step 4: Recommendations
        console.log('\n💡 Recommendations:');
        if (whitelist.length > 0) {
            console.log(`✅ Use these reliable RPCs: ${whitelist.join(', ')}`);
        } else {
            console.log('⚠️ No RPCs in whitelist! All RPCs may be experiencing issues.');
        }

        if (blacklist.length > 0) {
            console.log(`❌ Avoid these RPCs: ${blacklist.join(', ')}`);
        }

        console.log('\n🎉 Health check test completed successfully!');
    } catch (error) {
        console.error('❌ Health check test failed:', error);
    }
}

/**
 * Run quick connectivity test
 */
async function runQuickTest() {
    console.log('⚡ Running quick connectivity test...');

    try {
        await healthCheckRpcs(testRpcs, {
            timeout: 5000, // 5 seconds
            maxResponseTime: 3000, // 3 seconds
        });

        const whitelist = getWhitelistRpcs();
        const blacklist = getBlacklistRpcs();

        console.log(`✅ Quick test completed: ${whitelist.length} working, ${blacklist.length} failed`);
        console.log('Working RPCs:', whitelist);
    } catch (error) {
        console.error('❌ Quick test failed:', error);
    }
}

// Export functions for potential use
export { runHealthCheckTest, runQuickTest };

// If running directly (not imported), run the test
// if (typeof window === 'undefined' && require.main === module) {
//     // Running in Node.js environment
//     runHealthCheckTest()
//         .then(() => {
//             console.log('Test completed');
//             process.exit(0);
//         })
//         .catch((error) => {
//             console.error('Test failed:', error);
//             process.exit(1);
//         });
// }
